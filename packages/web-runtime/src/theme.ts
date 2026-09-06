import { hwioMount } from './mount.js';

export type HWioScheme = 'light' | 'dark';
export type HWioThemeChoice = HWioScheme;

const THEME_KEY = 'hwio_theme';

/** The scheme actually in effect: the stamped data-theme ending in "-dark" means dark. */
export function hwioResolvedScheme(): HWioScheme {
  const theme = document.documentElement.getAttribute('data-theme');
  if (theme) return theme.endsWith('-dark') ? 'dark' : 'light';
  if (document.documentElement.classList.contains('dark')) return 'dark'; // legacy-ok: www's class toggle until P2
  return 'light';
}

function themeNames() {
  const d = document.documentElement.dataset;
  return { light: d.hwioThemeLight ?? 'hwio', dark: d.hwioThemeDark ?? 'hwio-dark' };
}

/**
 * Applies and remembers the visitor's choice. Light is the default (owner decision 2026-09-06); the
 * choice is a user-requested display preference, stored without a consent gate: localStorage on every
 * site and, when <html data-hwio-theme-cookie-domain> is set, a first-party cookie shared by that
 * domain's sites (www, docs, stem on .hardwario.com).
 */
export function hwioApplyTheme(choice: HWioThemeChoice): void {
  const html = document.documentElement;
  const names = themeNames();
  html.setAttribute('data-theme', choice === 'dark' ? names.dark : names.light);
  html.classList.add('hwio-theme-transition');
  window.setTimeout(() => html.classList.remove('hwio-theme-transition'), 300);
  try {
    localStorage.setItem(THEME_KEY, choice);
    const domain = html.dataset.hwioThemeCookieDomain;
    if (domain) document.cookie = `${THEME_KEY}=${choice}; Domain=${domain}; Path=/; Max-Age=31536000; SameSite=Lax; Secure`;
  } catch {
    // storage unavailable
  }
  window.dispatchEvent(new CustomEvent('hwio:themechange', { detail: { choice, scheme: hwioResolvedScheme() } }));
}

/**
 * Binds [data-hwio-theme-toggle] buttons (two-state light/dark) and keeps the runtime-only
 * data-theme across ClientRouter swaps (Astro restores root attributes from server HTML).
 */
export function hwioThemeRuntime() {
  let controller: AbortController | null = null;
  let themeBeforeSwap: string | null = null;
  document.addEventListener('astro:before-swap', () => { themeBeforeSwap = document.documentElement.getAttribute('data-theme'); });
  document.addEventListener('astro:after-swap', () => {
    document.documentElement.classList.add('js');
    if (themeBeforeSwap) document.documentElement.setAttribute('data-theme', themeBeforeSwap);
  });
  function syncPressed() {
    const dark = hwioResolvedScheme() === 'dark';
    document.querySelectorAll<HTMLElement>('[data-hwio-theme-toggle]').forEach((el) => el.setAttribute('aria-pressed', String(dark)));
  }
  function bind() {
    const toggles = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-hwio-theme-toggle]:not([data-hwio-theme-bound])'));
    syncPressed();
    if (!toggles.length) return;
    controller ??= new AbortController();
    toggles.forEach((toggle) => {
      toggle.dataset.hwioThemeBound = 'true';
      toggle.addEventListener('click', () => {
        hwioApplyTheme(hwioResolvedScheme() === 'dark' ? 'light' : 'dark');
        syncPressed();
      }, { signal: controller!.signal });
    });
  }
  return hwioMount('theme', { bind, cleanup: () => { controller?.abort(); controller = null; } });
}
