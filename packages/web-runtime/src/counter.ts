import { hwioMount } from './mount.js';

/**
 * Count-up for [data-hwio-counter data-target="120" data-suffix="+"]. Renders the final value
 * without animation under reduced motion; otherwise eases from 0 when the first counter enters view.
 */
export function hwioCounterRuntime() {
  let observer: IntersectionObserver | null = null;
  let frame = 0;
  function cleanup() {
    observer?.disconnect(); observer = null;
    if (frame) cancelAnimationFrame(frame); frame = 0;
  }
  function bind() {
    const counters = Array.from(document.querySelectorAll<HTMLElement>('[data-hwio-counter]:not([data-hwio-counter-bound])'));
    if (!counters.length) return;
    counters.forEach((c) => (c.dataset.hwioCounterBound = 'true'));
    const finish = () => counters.forEach((c) => { c.textContent = `${parseInt(c.dataset.target ?? '0', 10)}${c.dataset.suffix ?? ''}`; c.dataset.hwioCounterActive = 'true'; });
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return finish();
    const animate = () => {
      const start = performance.now();
      counters.forEach((c) => { c.textContent = `0${c.dataset.suffix ?? ''}`; c.dataset.hwioCounterActive = 'true'; });
      const step = (now: number) => {
        const progress = Math.min((now - start) / 1200, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        counters.forEach((c) => { c.textContent = `${Math.floor(eased * parseInt(c.dataset.target ?? '0', 10))}${c.dataset.suffix ?? ''}`; });
        if (progress < 1) frame = requestAnimationFrame(step); else { frame = 0; finish(); }
      };
      frame = requestAnimationFrame(step);
    };
    if (!('IntersectionObserver' in window)) return animate();
    observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { observer?.disconnect(); observer = null; animate(); }
    }, { threshold: 0.3 });
    observer.observe(counters[0]);
  }
  return hwioMount('counter', { bind, cleanup });
}
