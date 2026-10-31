import { hwioMount } from './mount.js';
import { hwioAnnouncePopup, hwioOnPopup } from './popup.js';

/**
 * Header behaviours: drives the DaisyUI drawer from its [data-hwio-drawer-toggle] buttons (Enter and
 * Space work because they are buttons; aria-expanded follows the checkbox, focus moves to the panel's
 * first control on open and back to the trigger on close, Escape closes, a followed link closes),
 * opens HWioHeader's mega panels
 * ([data-hwio-mega-trigger] buttons and their [data-hwio-mega-panel]; hover with intent on pointer
 * devices, click, ArrowDown into the panel, Escape / outside click / focus leaving close; one at a
 * time; the click that follows a hover-open keeps the panel open, the next one closes it), and marks the nav link whose section is in view ([data-hwio-scrollspy] nav with same-page
 * anchors) with aria-current="location". Opening a mega panel or the drawer announces it
 * (`hwio:popupopen`, popup.ts), so an open dropdown (HWioLanguageSwitcher) closes; a dropdown that
 * opens closes the mega panels the same way.
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
      const side = input.parentElement?.querySelector<HTMLElement>('.drawer-side') ?? null;
      const toggles = Array.from(document.querySelectorAll<HTMLElement>(`[data-hwio-drawer-toggle="${input.id}"]`));
      const trigger = toggles.find((t) => !side?.contains(t)) ?? null;
      const sync = () => toggles.forEach((t) => t.setAttribute('aria-expanded', String(input.checked)));
      // DaisyUI reveals .drawer-side after a 100 ms visibility delay; retry per frame until the control takes focus.
      const focusWhenVisible = (el: HTMLElement, frames = 40) => {
        if (!input.checked) return;
        el.focus();
        if (document.activeElement !== el && frames > 0) requestAnimationFrame(() => focusWhenVisible(el, frames - 1));
      };
      const apply = (restoreFocus: boolean) => {
        sync();
        if (input.checked) {
          if (side) hwioAnnouncePopup(side);
          const first = side?.querySelector<HTMLElement>('button, a[href], input:not([type="hidden"]), select, textarea, summary, [tabindex]:not([tabindex="-1"])');
          if (first) focusWhenVisible(first);
        } else if (restoreFocus) {
          trigger?.focus();
        }
      };
      const setOpen = (open: boolean, restoreFocus = true) => {
        if (input.checked === open) return;
        input.checked = open;
        apply(restoreFocus);
      };
      sync();
      toggles.forEach((t) => t.addEventListener('click', () => setOpen(!input.checked), { signal }));
      // Labels (the overlay) still flip the checkbox natively; follow them.
      input.addEventListener('change', () => apply(true), { signal });
      // A followed link closes the drawer without stealing focus from the navigation target (same-page anchors).
      side?.querySelectorAll('a[href]').forEach((a) => a.addEventListener('click', () => setOpen(false, false), { signal }));
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && input.checked) setOpen(false); }, { signal });
    });
    const triggers = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-hwio-mega-trigger]'));
    if (triggers.length) {
      const panelOf = (trigger: HTMLElement) => document.querySelector<HTMLElement>(`[data-hwio-mega-panel="${trigger.dataset.hwioMegaTrigger}"]`);
      const pairs = triggers.map((trigger) => ({ trigger, panel: panelOf(trigger) })).filter((p): p is { trigger: HTMLButtonElement; panel: HTMLElement } => !!p.panel);
      const hoverable = window.matchMedia('(hover: hover)').matches;
      let closeTimer: ReturnType<typeof setTimeout> | null = null;
      const cancelClose = () => { if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; } };
      const set = (pair: { trigger: HTMLElement; panel: HTMLElement }, open: boolean) => { pair.trigger.setAttribute('aria-expanded', String(open)); pair.panel.hidden = !open; };
      // A panel that hover has just opened stays open on the click that follows (pointer users click the
      // item they point at); the next click closes it. Without this, hover opened it and the click shut it.
      let hoverOpened: HTMLElement | null = null;
      const closeAll = () => { cancelClose(); hoverOpened = null; pairs.forEach((p) => set(p, false)); };
      const isOpen = (pair: { trigger: HTMLElement }) => pair.trigger.getAttribute('aria-expanded') === 'true';
      const openOne = (pair: { trigger: HTMLElement; panel: HTMLElement }) => {
        cancelClose();
        const wasOpen = isOpen(pair);
        pairs.forEach((p) => set(p, p === pair));
        if (!wasOpen) hwioAnnouncePopup(pair.panel);
      };
      const scheduleClose = () => { cancelClose(); closeTimer = setTimeout(closeAll, 180); };
      pairs.forEach((pair) => {
        const { trigger, panel } = pair;
        trigger.addEventListener('click', () => {
          if (isOpen(pair) && hoverOpened === trigger) { hoverOpened = null; return; }
          if (isOpen(pair)) closeAll(); else openOne(pair);
        }, { signal });
        trigger.addEventListener('keydown', (e) => {
          if (e.key !== 'ArrowDown') return;
          e.preventDefault(); openOne(pair); panel.querySelector<HTMLElement>('a[href], button')?.focus();
        }, { signal });
        if (hoverable) {
          trigger.addEventListener('mouseenter', () => {
            const wasOpen = isOpen(pair);
            openOne(pair);
            hoverOpened = wasOpen ? null : trigger;
          }, { signal });
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
      // Another popup (a language dropdown, the drawer) opened: close the panels unless it sits in one.
      hwioOnPopup((owner) => {
        if (!pairs.some((p) => p.panel === owner || p.panel.contains(owner))) closeAll();
      }, signal);
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
