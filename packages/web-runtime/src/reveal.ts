import { hwioMount } from './mount.js';

/** Scroll reveal for [data-hwio-reveal]: sets data-hwio-revealed once in view; reduced motion reveals immediately. */
export function hwioRevealRuntime() {
  let observer: IntersectionObserver | null = null;
  function bind() {
    const targets = Array.from(document.querySelectorAll<HTMLElement>('[data-hwio-reveal]:not([data-hwio-revealed])'));
    if (!targets.length) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      targets.forEach((el) => (el.dataset.hwioRevealed = 'true'));
      return;
    }
    observer ??= new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        (entry.target as HTMLElement).dataset.hwioRevealed = 'true';
        observer?.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    targets.forEach((el) => observer!.observe(el));
  }
  return hwioMount('reveal', { bind, cleanup: () => { observer?.disconnect(); observer = null; } });
}
