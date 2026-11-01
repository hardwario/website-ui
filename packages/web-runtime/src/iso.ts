import { hwioMount } from './mount.js';

/** Timing of a scene build (ms): objects settle one after another, then the traces draw. */
const STEP = 90;
const SETTLE = 300;
const DRAW = 700;
const LINK_GAP = 250;

/**
 * Isometric scenes drawn with the Brand Guidelines' kit (the artwork library's `make isometric`;
 * HWioIsoScene inlines one): when a `[data-hwio-iso]` scene enters the viewport it builds itself
 * once. The kit's class names are the contract:
 * - `.iso-object` groups fade in and settle 4 px, in drawing order (300 ms, 90 ms apart);
 * - `g.iso-radio` links fade in after the objects;
 * - each `g.iso-link` draws its `.iso-trace` path from pad to pad (700 ms, ease-out; the kit gives
 *   every trace `pathLength="1"`), and its `.iso-pad` ends appear as the trace leaves and arrives
 *   (`data-end="end"` marks the far pad).
 * The runtime only sets transition delays (CSSOM, allowed by a strict style-src) and two classes:
 * `hwio-iso-anim` hides the parts, `hwio-iso-play` plays them. Without this runtime, under
 * prefers-reduced-motion or without IntersectionObserver the scene shows complete at once.
 * Transforms, opacity and stroke-dashoffset only, so the layout never moves.
 */
export function hwioIsoRuntime() {
  let observer: IntersectionObserver | null = null;
  function bind() {
    const scenes = Array.from(document.querySelectorAll<HTMLElement>('[data-hwio-iso]:not([data-hwio-iso-bound])'));
    if (!scenes.length) return;
    scenes.forEach((scene) => (scene.dataset.hwioIsoBound = 'true'));
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
    scenes.forEach((scene) => {
      const objects = Array.from(scene.querySelectorAll<SVGGElement>('.iso-object'));
      objects.forEach((g, i) => (g.style.transitionDelay = `${i * STEP}ms`));
      const objectsDone = Math.max(0, objects.length - 1) * STEP + SETTLE;
      scene.querySelectorAll<SVGGElement>('g.iso-radio').forEach((g) => (g.style.transitionDelay = `${objectsDone}ms`));
      const links = Array.from(scene.querySelectorAll<SVGGElement>('g.iso-link:not(.iso-radio)'));
      links.forEach((link, k) => {
        const start = objectsDone + 100 + k * LINK_GAP;
        const trace = link.querySelector<SVGPathElement>('.iso-trace');
        if (trace) trace.style.transitionDelay = `${start}ms`;
        link.querySelectorAll<SVGPathElement>('.iso-pad').forEach((pad) => {
          pad.style.transitionDelay = `${pad.dataset.end === 'end' ? start + DRAW - 100 : start}ms`;
        });
      });
      scene.classList.add('hwio-iso-anim');
    });
    observer ??= new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        observer?.unobserve(entry.target);
        entry.target.classList.add('hwio-iso-play');
      });
    }, { threshold: 0.3 });
    scenes.forEach((scene) => observer!.observe(scene));
  }
  return hwioMount('iso', { bind, cleanup: () => { observer?.disconnect(); observer = null; } });
}
