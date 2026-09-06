import { hwioMount } from './mount.js';

/**
 * Header behaviours: keeps aria-expanded on the DaisyUI drawer label in sync with its checkbox,
 * closes the drawer when a link inside it is followed, opens HWioHeader's mega panels
 * ([data-hwio-mega-trigger] buttons and their [data-hwio-mega-panel]; hover with intent on pointer
 * devices, click, ArrowDown into the panel, Escape / outside click / focus leaving close; one at a
 * time), and marks the nav link whose section is in view ([data-hwio-scrollspy] nav with same-page
 * anchors) with aria-current="location".
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
    const triggers = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-hwio-mega-trigger]'));
    if (triggers.length) {
      const panelOf = (trigger: HTMLElement) => document.querySelector<HTMLElement>(`[data-hwio-mega-panel="${trigger.dataset.hwioMegaTrigger}"]`);
      const pairs = triggers.map((trigger) => ({ trigger, panel: panelOf(trigger) })).filter((p): p is { trigger: HTMLButtonElement; panel: HTMLElement } => !!p.panel);
      const hoverable = window.matchMedia('(hover: hover)').matches;
      let closeTimer: ReturnType<typeof setTimeout> | null = null;
      const cancelClose = () => { if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; } };
      const set = (pair: { trigger: HTMLElement; panel: HTMLElement }, open: boolean) => { pair.trigger.setAttribute('aria-expanded', String(open)); pair.panel.hidden = !open; };
      const closeAll = () => { cancelClose(); pairs.forEach((p) => set(p, false)); };
      const openOne = (pair: { trigger: HTMLElement; panel: HTMLElement }) => { cancelClose(); pairs.forEach((p) => set(p, p === pair)); };
      const scheduleClose = () => { cancelClose(); closeTimer = setTimeout(closeAll, 180); };
      const isOpen = (pair: { trigger: HTMLElement }) => pair.trigger.getAttribute('aria-expanded') === 'true';
      pairs.forEach((pair) => {
        const { trigger, panel } = pair;
        trigger.addEventListener('click', () => (isOpen(pair) ? closeAll() : openOne(pair)), { signal });
        trigger.addEventListener('keydown', (e) => {
          if (e.key !== 'ArrowDown') return;
          e.preventDefault(); openOne(pair); panel.querySelector<HTMLElement>('a[href], button')?.focus();
        }, { signal });
        if (hoverable) {
          trigger.addEventListener('mouseenter', () => openOne(pair), { signal });
          trigger.addEventListener('mouseleave', scheduleClose, { signal });
          panel.addEventListener('mouseenter', cancelClose, { signal });
          panel.addEventListener('mouseleave', scheduleClose, { signal });
        }
        panel.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.preventDefault(); closeAll(); trigger.focus(); } }, { signal });
        panel.addEventListener('focusout', (e) => { const next = e.relatedTarget as Node | null; if (next && !panel.contains(next) && next !== trigger) closeAll(); }, { signal });
        panel.querySelectorAll('a[href]').forEach((a) => a.addEventListener('click', closeAll, { signal }));
      });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeAll(); }, { signal });
      document.addEventListener('click', (e) => {
        const node = e.target as Node;
        if (!pairs.some((p) => p.trigger.contains(node) || p.panel.contains(node))) closeAll();
      }, { signal });
    }
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
