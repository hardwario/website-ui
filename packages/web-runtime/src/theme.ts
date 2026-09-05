import { hwioMount } from './mount.js';

export type HWioScheme = 'light' | 'dark';
export type HWioThemeChoice = HWioScheme | 'system';

const THEME_KEY = 'hwio_theme';
const THEME_VERSION_KEY = 'hwio_theme_consent_version';

/** The scheme actually in effect: explicit data-theme ending in "-dark", else the OS preference. */
export function hwioResolvedScheme(): HWioScheme {
  const theme = document.documentElement.getAttribute('data-theme');
  if (theme) return theme.endsWith('-dark') ? 'dark' : 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function themeNames() {
  const d = document.documentElement.dataset;
  return { light: d.hwioThemeLight ?? 'hwio', dark: d.hwioThemeDark ?? 'hwio-dark' };
}

export function hwioApplyTheme(choice: HWioThemeChoice): void {
  const html = document.documentElement;
  const names = themeNames();
  if (choice === 'system') html.removeAttribute('data-theme');
  else html.setAttribute('data-theme', choice === 'dark' ? names.dark : names.light);
  html.classList.add('hwio-theme-transition');
  window.setTimeout(() => html.classList.remove('hwio-theme-transition'), 300);
  try {
    if (window.hwioConsent?.allows('preferences')) {
      if (choice === 'system') { localStorage.removeItem(THEME_KEY); localStorage.removeItem(THEME_VERSION_KEY); }
      else {
        localStorage.setItem(THEME_KEY, choice);
        const version = html.dataset.hwioConsentVersion;
        if (version) localStorage.setItem(THEME_VERSION_KEY, version);
      }
    }
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
    else document.documentElement.removeAttribute('data-theme');
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
