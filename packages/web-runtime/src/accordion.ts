import { hwioMount } from './mount.js';

/** Exclusive accordion fallback for browsers without <details name="…"> support. */
export function hwioAccordionRuntime() {
  let controller: AbortController | null = null;
  function bind() {
    if ('name' in document.createElement('details')) return; // native exclusive accordion
    controller ??= new AbortController();
    document.querySelectorAll<HTMLDetailsElement>('details[name]:not([data-hwio-accordion-bound])').forEach((details) => {
      details.dataset.hwioAccordionBound = 'true';
      details.addEventListener('toggle', () => {
        if (!details.open) return;
        const name = details.getAttribute('name');
        document.querySelectorAll<HTMLDetailsElement>(`details[name="${name}"]`).forEach((other) => { if (other !== details) other.open = false; });
      }, { signal: controller!.signal });
    });
  }
  return hwioMount('accordion', { bind, cleanup: () => { controller?.abort(); controller = null; } });
}
