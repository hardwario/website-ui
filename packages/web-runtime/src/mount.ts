/** A behaviour that can attach to the current document and detach before a view-transition swap. */
export interface HWioBinder {
  bind: () => void;
  cleanup: () => void;
}

declare global {
  interface Window {
    __hwioRuntimes?: Record<string, HWioBinder>;
  }
}

/**
 * Registers a behaviour once per page session. With Astro's ClientRouter the module script runs
 * once, so `bind` re-runs on every `astro:page-load` and `cleanup` before each swap. Without the
 * router it binds immediately. Binders must be idempotent (mark bound nodes with data-hwio-*-bound).
 */
export function hwioMount(name: string, binder: HWioBinder): HWioBinder {
  const registry = (window.__hwioRuntimes ??= {});
  const existing = registry[name];
  if (existing) {
    existing.bind();
    return existing;
  }
  registry[name] = binder;
  document.addEventListener('astro:before-swap', () => binder.cleanup());
  document.addEventListener('astro:page-load', () => binder.bind());
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => binder.bind(), { once: true });
  } else {
    binder.bind();
  }
  return binder;
}

/** Shorthand for behaviours that use one AbortController per page. */
export function hwioPageScope(): { signal: AbortSignal; abort: () => void } {
  const controller = new AbortController();
  return { signal: controller.signal, abort: () => controller.abort() };
}
