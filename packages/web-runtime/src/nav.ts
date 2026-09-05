import { hwioMount } from './mount.js';

/**
 * Header behaviours: keeps aria-expanded on the DaisyUI drawer label in sync with its checkbox,
 * closes the drawer when a link inside it is followed, and marks the nav link whose section is
 * in view ([data-hwio-scrollspy] nav with same-page anchors) with aria-current="location".
 */
export function hwioNavRuntime() {
  let controller: AbortController | null = null;
  let observer: IntersectionObserver | null = null;
  function cleanup() {
    controller?.abort(); controller = null;
    observer?.disconnect(); observer = null;
  }
  function bind() {
    cleanup();
    controller = new AbortController();
    const { signal } = controller;
    document.querySelectorAll<HTMLInputElement>('input.drawer-toggle').forEach((input) => {
      const labels = Array.from(document.querySelectorAll<HTMLElement>(`label[for="${input.id}"]`));
      const sync = () => labels.forEach((l) => l.setAttribute('aria-expanded', String(input.checked)));
      sync();
      input.addEventListener('change', sync, { signal });
      const side = input.parentElement?.querySelector('.drawer-side');
      side?.querySelectorAll('a[href]').forEach((a) => a.addEventListener('click', () => { input.checked = false; sync(); }, { signal }));
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && input.checked) { input.checked = false; sync(); } }, { signal });
    });
    const nav = document.querySelector<HTMLElement>('[data-hwio-scrollspy]');
    if (!nav || !('IntersectionObserver' in window)) return;
    const links = Array.from(nav.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'));
    const sections = links.map((a) => document.getElementById(a.hash.slice(1))).filter((s): s is HTMLElement => !!s);
    if (!sections.length) return;
    observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      links.forEach((a) => { if (a.hash.slice(1) === visible.target.id) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current'); });
    }, { rootMargin: '-40% 0px -50% 0px', threshold: [0, 0.25, 0.5] });
    sections.forEach((s) => observer!.observe(s));
  }
  return hwioMount('nav', { bind, cleanup });
}
