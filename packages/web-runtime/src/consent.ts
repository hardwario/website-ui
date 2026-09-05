import { hwioMount } from './mount.js';
import {
  HWIO_CONSENT_COOKIE,
  LEGACY_CONSENT_COOKIE,
  hwioBaseCategories,
  hwioConsentToGoogle,
  hwioCookieString,
  hwioDisallowedCookieNames,
  hwioExpireCookieString,
  hwioHasTrackingConsent,
  hwioMakeReceipt,
  hwioParseReceipt,
  hwioReadCookie,
  type HWioConsentCategory,
  type HWioConsentReceipt,
} from './consent-core.js';

export interface HWioConsentApi {
  getConsent: () => HWioConsentReceipt | null;
  allows: (category: HWioConsentCategory | string) => boolean;
  canTrack: () => boolean;
  open: () => void;
  acceptAll: () => void;
  rejectAll: () => void;
}

declare global {
  interface Window {
    hwioConsent?: HWioConsentApi;
    /** Deprecated alias kept while www's local call sites migrate (P2). */
    hwConsent?: HWioConsentApi; // legacy-ok
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    __hwioGtmLoaded?: boolean;
  }
}

const ATTRIBUTION_KEYS = ['hwio_attribution', 'hw_attribution']; // legacy-ok
const THEME_KEYS = ['hwio_theme', 'hwio_theme_consent_version', 'theme', 'hw_theme_consent_version']; // legacy-ok

/**
 * Consent runtime. Markup contract (rendered by HWioCookieConsent):
 *   [data-hwio-consent data-version data-gtm? data-locale]  banner root (hidden attr toggles it)
 *   [data-hwio-consent-modal]                               settings dialog wrapper (hidden)
 *   [data-hwio-consent-accept|reject|customize|save|close]  buttons (may appear several times)
 *   [data-hwio-consent-toggle="preferences|statistics|marketing"] checkboxes
 *   [data-hwio-cookie-settings] anywhere (footer)            reopens the dialog
 */
export function hwioConsentRuntime(): HWioConsentApi {
  let version = '';
  let gtmId: string | null = null;
  let locale = 'en';
  let current: HWioConsentReceipt | null = null;
  let resolved = false;
  let root: HTMLElement | null = null;
  let modal: HTMLElement | null = null;
  let toggles: HTMLInputElement[] = [];
  let controller: AbortController | null = null;

  const secure = () => window.location.protocol === 'https:';

  function readStored(): HWioConsentReceipt | null {
    const fresh = hwioParseReceipt(hwioReadCookie(document.cookie, HWIO_CONSENT_COOKIE), version);
    if (fresh) return fresh;
    const legacy = hwioParseReceipt(hwioReadCookie(document.cookie, LEGACY_CONSENT_COOKIE), version);
    if (legacy) {
      // Migrate in place so returning visitors are not asked again.
      document.cookie = hwioCookieString(HWIO_CONSENT_COOKIE, legacy, secure());
      document.cookie = hwioExpireCookieString(LEGACY_CONSENT_COOKIE);
      return legacy;
    }
    return null;
  }

  function write(categories: Partial<Record<string, boolean>>, method: string): HWioConsentReceipt {
    const receipt = hwioMakeReceipt(categories, method, version, locale);
    document.cookie = hwioCookieString(HWIO_CONSENT_COOKIE, receipt, secure());
    return receipt;
  }

  function updateGoogle(receipt: HWioConsentReceipt | null) {
    window.dataLayer = window.dataLayer || [];
    window.gtag =
      window.gtag ||
      function (...args: unknown[]) {
        window.dataLayer!.push(args);
      };
    window.gtag('consent', 'update', hwioConsentToGoogle(receipt));
  }

  function loadGtm(receipt: HWioConsentReceipt | null) {
    if (!gtmId || window.__hwioGtmLoaded || !hwioHasTrackingConsent(receipt)) return;
    if (document.querySelector('script[src*="googletagmanager.com/gtm.js"]')) {
      window.__hwioGtmLoaded = true;
      return;
    }
    window.__hwioGtmLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
    script.addEventListener('error', () => { window.__hwioGtmLoaded = false; }, { once: true });
    document.head.appendChild(script);
  }

  function clearDisallowed(receipt: HWioConsentReceipt | null) {
    const categories = hwioBaseCategories(receipt?.categories);
    const host = window.location.hostname;
    const parts = host.split('.');
    const domains = Array.from(new Set(['', host, ...(parts.length >= 2 ? ['.' + host] : []), ...(parts.length > 2 ? ['.' + parts.slice(-2).join('.')] : [])]));
    const names = document.cookie.split(';').map((e) => e.split('=')[0].trim()).filter(Boolean);
    for (const name of hwioDisallowedCookieNames(names, categories)) {
      for (const domain of domains) document.cookie = hwioExpireCookieString(name, domain || undefined);
    }
    try {
      if (!categories.marketing) ATTRIBUTION_KEYS.forEach((k) => sessionStorage.removeItem(k));
      if (!categories.preferences) THEME_KEYS.forEach((k) => localStorage.removeItem(k));
      else {
        if (localStorage.getItem('hwio_theme')) localStorage.setItem('hwio_theme_consent_version', version);
        if (localStorage.getItem('theme')) localStorage.setItem('hw_theme_consent_version', version); // legacy-ok
      }
    } catch {
      // storage unavailable
    }
  }

  function setToggles(receipt: HWioConsentReceipt | null) {
    const categories = hwioBaseCategories(receipt?.categories);
    toggles.forEach((input) => {
      const key = input.dataset.hwioConsentToggle as HWioConsentCategory | undefined;
      input.checked = !!key && categories[key];
    });
  }

  function setModal(open: boolean) {
    if (!modal) return;
    modal.hidden = !open;
    if (open) {
      const first = modal.querySelector<HTMLElement>('input:not([disabled]), button');
      first?.focus();
    }
  }

  function render() {
    if (!resolved || !root) return;
    root.hidden = !!current;
    if (current) setToggles(current);
  }

  function dispatch() {
    window.dispatchEvent(new CustomEvent('hwio:consentchange', { detail: current }));
    window.dispatchEvent(new CustomEvent('hw:consentchange', { detail: current })); // legacy-ok
  }

  function apply(categories: Partial<Record<string, boolean>>, method: string) {
    current = write(categories, method);
    resolved = true;
    updateGoogle(current);
    clearDisallowed(current);
    loadGtm(current);
    render();
    setModal(false);
    dispatch();
  }

  const api: HWioConsentApi = {
    getConsent: () => current,
    allows: (category) => category === 'necessary' || !!current?.categories[category as HWioConsentCategory],
    canTrack: () => hwioHasTrackingConsent(current),
    open: () => { setToggles(current); setModal(true); },
    acceptAll: () => apply({ preferences: true, statistics: true, marketing: true }, 'accept_all'),
    rejectAll: () => apply({}, 'reject_all'),
  };

  function cleanup() {
    controller?.abort();
    controller = null;
    setModal(false);
    root = null;
    modal = null;
    toggles = [];
  }

  function bind() {
    const nextRoot = document.querySelector<HTMLElement>('[data-hwio-consent]');
    if (!nextRoot) return;
    if (root === nextRoot && controller && !controller.signal.aborted) return;
    cleanup();
    root = nextRoot;
    version = root.dataset.version ?? document.documentElement.dataset.hwioConsentVersion ?? '';
    gtmId = root.dataset.gtm || null;
    locale = root.dataset.locale ?? document.documentElement.lang ?? 'en';
    modal = document.querySelector<HTMLElement>('[data-hwio-consent-modal]');
    toggles = Array.from(document.querySelectorAll<HTMLInputElement>('[data-hwio-consent-toggle]'));
    controller = new AbortController();
    const { signal } = controller;
    const on = (selector: string, handler: () => void) =>
      document.querySelectorAll<HTMLElement>(selector).forEach((el) => el.addEventListener('click', handler, { signal }));
    on('[data-hwio-consent-accept]', api.acceptAll);
    on('[data-hwio-consent-reject]', api.rejectAll);
    on('[data-hwio-consent-customize]', api.open);
    on('[data-hwio-consent-close]', () => setModal(false));
    on('[data-hwio-consent-save]', () => {
      const categories: Partial<Record<string, boolean>> = {};
      toggles.forEach((input) => { categories[input.dataset.hwioConsentToggle ?? ''] = input.checked; });
      apply(categories, 'granular');
    });
    on('[data-hwio-cookie-settings], [data-cookie-settings]', api.open); // legacy-ok: footer buttons of the current sites
    modal?.addEventListener('click', (event) => { if (event.target === modal) setModal(false); }, { signal });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') setModal(false);
      if (event.key !== 'Tab' || !modal || modal.hidden) return;
      const focusables = Array.from(modal.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')).filter((el) => !el.hidden && el.offsetParent !== null);
      if (!focusables.length) return;
      const first = focusables[0], last = focusables[focusables.length - 1], active = document.activeElement;
      if (event.shiftKey && (active === first || !modal.contains(active))) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && active === last) { event.preventDefault(); first.focus(); }
    }, { signal });

    if (!resolved) {
      current = readStored();
      resolved = true;
      if (current) {
        updateGoogle(current);
        clearDisallowed(current);
        loadGtm(current);
      }
    }
    render();
  }

  window.hwioConsent = api;
  window.hwConsent = api; // legacy-ok
  hwioMount('consent', { bind, cleanup });
  return api;
}
