import { hwioMount } from './mount.js';
import { hwioCountAt, hwioFormatCount, hwioParseCount } from './count-core.js';

/** Count-up duration of a single figure (`[data-hwio-count]`). */
const COUNT_MS = 800;

/**
 * Count-up of figures, once each, when they enter the viewport; the final value is what the server
 * rendered, so without JavaScript or under reduced motion the figure simply shows.
 *
 * - `[data-hwio-count="7000" data-hwio-count-template="{n}+" data-hwio-count-group=" "]`
 *   (HWioKeyFigure): each figure counts on its own (800 ms, ease-out) from `data-hwio-count-from`
 *   (default 0) and ends on its exact server text (non-breaking spaces included). Below the fold the
 *   start value is set while nobody sees it; a figure already in view counts at once.
 * - `[data-hwio-counter data-target="120" data-suffix="+"]` (HWioStatsBand, unchanged): every
 *   counter of the page counts together when the first one enters the view.
 */
export function hwioCounterRuntime() {
  let observer: IntersectionObserver | null = null;
  let countObserver: IntersectionObserver | null = null;
  let frame = 0;
  const frames = new Set<number>();
  function cleanup() {
    observer?.disconnect(); observer = null;
    countObserver?.disconnect(); countObserver = null;
    if (frame) cancelAnimationFrame(frame); frame = 0;
    frames.forEach((f) => cancelAnimationFrame(f)); frames.clear();
  }
  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function bindCounts() {
    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-hwio-count]:not([data-hwio-count-bound])'));
    if (!els.length) return;
    els.forEach((el) => (el.dataset.hwioCountBound = 'true'));
    if (reduced() || !('IntersectionObserver' in window)) return;
    const finals = new WeakMap<HTMLElement, string>();
    const run = (el: HTMLElement) => {
      const spec = hwioParseCount(el.dataset);
      if (!spec) return;
      const start = performance.now();
      const step = (now: number) => {
        const progress = Math.min((now - start) / COUNT_MS, 1);
        if (progress < 1) {
          el.textContent = hwioFormatCount(hwioCountAt(spec, progress), spec.template, spec.group);
          frames.add(requestAnimationFrame(step));
        } else {
          el.textContent = finals.get(el) ?? el.textContent;
        }
      };
      frames.add(requestAnimationFrame(step));
    };
    countObserver ??= new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        countObserver?.unobserve(entry.target);
        run(entry.target as HTMLElement);
      });
    }, { threshold: 0.4 });
    els.forEach((el) => {
      const spec = hwioParseCount(el.dataset);
      if (!spec) return;
      finals.set(el, el.textContent ?? '');
      if (el.getBoundingClientRect().top > window.innerHeight) el.textContent = hwioFormatCount(spec.from, spec.template, spec.group);
      countObserver?.observe(el);
    });
  }

  function bindCounters() {
    const counters = Array.from(document.querySelectorAll<HTMLElement>('[data-hwio-counter]:not([data-hwio-counter-bound])'));
    if (!counters.length) return;
    counters.forEach((c) => (c.dataset.hwioCounterBound = 'true'));
    const finish = () => counters.forEach((c) => { c.textContent = `${parseInt(c.dataset.target ?? '0', 10)}${c.dataset.suffix ?? ''}`; c.dataset.hwioCounterActive = 'true'; });
    if (reduced()) return finish();
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

  function bind() {
    bindCounts();
    bindCounters();
  }
  return hwioMount('counter', { bind, cleanup });
}
