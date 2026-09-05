import { hwioMount } from './mount.js';
import { hwioResolvedScheme } from './theme.js';

const SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

interface TurnstileApi {
  render: (el: HTMLElement, opts: { sitekey: string; theme?: 'light' | 'dark' | 'auto' }) => string | undefined;
  reset: (id?: string) => void;
  remove: (id: string) => void;
}

export type HWioTurnstileForm = HTMLFormElement & {
  hwioLoadTurnstile?: () => void;
  hwioTurnstileWidgetId?: string;
  hwLoadTurnstile?: () => void; // legacy-ok
  hwTurnstileWidgetId?: string; // legacy-ok
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
    __hwioTurnstileLoader?: Promise<TurnstileApi>;
  }
}

function loadApi(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (window.__hwioTurnstileLoader) return window.__hwioTurnstileLoader;
  window.__hwioTurnstileLoader = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SRC}"]`);
    const script = existing ?? document.createElement('script');
    script.addEventListener('load', () => (window.turnstile ? resolve(window.turnstile) : reject(new Error('Turnstile loaded without its API'))), { once: true });
    script.addEventListener('error', () => { delete window.__hwioTurnstileLoader; reject(new Error('Turnstile failed to load')); }, { once: true });
    if (!existing) {
      script.src = SRC;
      script.async = true;
      document.head.appendChild(script);
    }
  });
  return window.__hwioTurnstileLoader;
}

/**
 * Lazy explicit Turnstile: the third-party script loads on first form interaction (focus or
 * pointer-enter) and the widget id is stored on its form so the submit handler resets exactly
 * the token it consumed. Markup: <div class="cf-turnstile" data-sitekey="..."> inside a <form>.
 */
export function hwioTurnstileRuntime() {
  let controller: AbortController | null = null;
  let widgetIds: string[] = [];

  function cleanup() {
    controller?.abort();
    controller = null;
    widgetIds.forEach((id) => { try { window.turnstile?.remove(id); } catch { /* gone */ } });
    widgetIds = [];
  }

  function bind() {
    const containers = Array.from(document.querySelectorAll<HTMLElement>('.cf-turnstile:not([data-hwio-turnstile-bound])'));
    if (!containers.length) return;
    controller ??= new AbortController();
    const { signal } = controller;
    containers.forEach((container) => {
      const form = container.closest('form') as HWioTurnstileForm | null;
      if (!form) return;
      container.dataset.hwioTurnstileBound = 'true';
      let state: 'idle' | 'loading' | 'rendered' = 'idle';
      const render = (api: TurnstileApi) => {
        if (signal.aborted || !container.isConnected || state === 'rendered') return;
        state = 'rendered';
        const id = api.render(container, { sitekey: container.dataset.sitekey ?? '', theme: hwioResolvedScheme() });
        if (id !== undefined) {
          widgetIds.push(id);
          form.hwioTurnstileWidgetId = id;
          form.hwTurnstileWidgetId = id; // legacy-ok
        }
      };
      const load = () => {
        if (state !== 'idle') return;
        state = 'loading';
        loadApi().then(render).catch(() => { if (!signal.aborted) state = 'idle'; });
      };
      form.hwioLoadTurnstile = load;
      form.hwLoadTurnstile = load; // legacy-ok
      form.addEventListener('focusin', load, { once: true, signal });
      form.addEventListener('pointerenter', load, { once: true, signal });
    });
  }

  return hwioMount('turnstile', { bind, cleanup });
}

/** Waits (bounded) for the lazily rendered widget to produce a token before the form is snapshotted. */
export async function hwioEnsureTurnstileToken(form: HWioTurnstileForm, timeoutMs = 4000): Promise<void> {
  const token = () => form.querySelector<HTMLInputElement>('input[name="cf-turnstile-response"]')?.value ?? '';
  if (!form.querySelector('.cf-turnstile') || token()) return;
  form.hwioLoadTurnstile?.();
  const start = performance.now();
  while (!token() && performance.now() - start < timeoutMs) {
    await new Promise((r) => setTimeout(r, 100));
  }
}

export function hwioResetTurnstile(form: HWioTurnstileForm): void {
  const id = form.hwioTurnstileWidgetId;
  if (id) window.turnstile?.reset(id);
}
