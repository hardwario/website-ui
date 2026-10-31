import { hwioMount } from './mount.js';

/** Class on <html> while the reveal runtime runs; the stylesheet hides waiting content only under it. */
export const HWIO_REVEAL_CLASS = 'hwio-reveal-on';

declare global {
  interface Window {
    __hwioRevealSwap?: boolean;
  }
}

/**
 * Scroll reveal for [data-hwio-reveal]: each element fades in and settles once, the first time it
 * enters the viewport (data-hwio-revealed). `data-hwio-reveal-delay="<ms>"` staggers siblings; it is
 * applied through the CSSOM, which a strict style-src allows.
 *
 * Fail-safe (owner, 2026-10-30): content waiting for its reveal is hidden only once this runtime has
 * started, through the class `hwio-reveal-on` it sets on <html>. If the module never runs (a script
 * error, a blocked or failed import), nothing is hidden and every section shows. Under
 * prefers-reduced-motion, or without IntersectionObserver, everything is revealed at once and the
 * class is never set.
 */
export function hwioRevealRuntime() {
  let observer: IntersectionObserver | null = null;
  // With Astro's ClientRouter the next document's <html> replaces this one's attributes; carry the
  // class across the swap so revealed-on-arrival content of the next page never flashes.
  if (!window.__hwioRevealSwap) {
    window.__hwioRevealSwap = true;
    document.addEventListener('astro:before-swap', (event) => {
      const next = (event as Event & { newDocument?: Document }).newDocument;
      if (next && document.documentElement.classList.contains(HWIO_REVEAL_CLASS)) next.documentElement.classList.add(HWIO_REVEAL_CLASS);
    });
  }
  function bind() {
    const targets = Array.from(document.querySelectorAll<HTMLElement>('[data-hwio-reveal]:not([data-hwio-revealed])'));
    if (!targets.length) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      targets.forEach((el) => (el.dataset.hwioRevealed = 'true'));
      return;
    }
    targets.forEach((el) => {
      const delay = Number(el.dataset.hwioRevealDelay);
      if (Number.isFinite(delay) && delay > 0) el.style.transitionDelay = `${Math.min(delay, 1000)}ms`;
    });
    document.documentElement.classList.add(HWIO_REVEAL_CLASS);
    // Threshold 0: an element taller than the viewport still reveals (a 10 % threshold never fires
    // for a section ten screens tall, which would leave it hidden).
    observer ??= new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        (entry.target as HTMLElement).dataset.hwioRevealed = 'true';
        observer?.unobserve(entry.target);
      });
    }, { threshold: 0, rootMargin: '0px 0px -50px 0px' });
    targets.forEach((el) => observer!.observe(el));
  }
  return hwioMount('reveal', { bind, cleanup: () => { observer?.disconnect(); observer = null; } });
}
