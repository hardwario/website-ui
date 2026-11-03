import { hwioMount } from './mount.js';
import { hwioAnnouncePopup, hwioOnPopup } from './popup.js';

/**
 * Header behaviours: opens HWioHeader's small-screen menu from its [data-hwio-menu-toggle] button into its
 * [data-hwio-menu-panel] sheet (aria-expanded and the button's label follow; the page is locked without
 * moving, its scrollbar's width kept as padding, and made inert behind the sheet; focus moves to the first
 * item without scrolling and back to the toggle on close; the toggle, Escape, a followed link, another
 * popup and a resize to the desktop layout close it), opens HWioHeader's mega panels
 * ([data-hwio-mega-trigger] buttons and their [data-hwio-mega-panel]; hover with intent on pointer
 * devices, click, ArrowDown into the panel, Escape / outside click / focus leaving close; one at a
 * time; the click that follows a hover-open keeps the panel open, the next one closes it), and marks the nav link whose section is in view ([data-hwio-scrollspy] nav with same-page
 * anchors) with aria-current="location". Opening a mega panel or the small-screen menu announces it
 * (`hwio:popupopen`, popup.ts), so an open dropdown (HWioLanguageSwitcher) closes; a dropdown that
 * opens closes the mega panels the same way.
 */
export function hwioNavRuntime() {
  let controller: AbortController | null = null;
  let observer: IntersectionObserver | null = null;
  let closeMenus: (() => void)[] = [];
  function cleanup() {
    // A page swap with the menu open must not leave the next page locked or inert.
    closeMenus.forEach((close) => close()); closeMenus = [];
    controller?.abort(); controller = null;
    observer?.disconnect(); observer = null;
  }
  function bind() {
    cleanup();
    controller = new AbortController();
    const { signal } = controller;
    document.querySelectorAll<HTMLButtonElement>('[data-hwio-menu-toggle]').forEach((toggle) => {
      const panel = document.querySelector<HTMLElement>(`[data-hwio-menu-panel="${toggle.dataset.hwioMenuToggle}"]`);
      if (!panel) return;
      const header = toggle.closest('header');
      const root = document.documentElement;
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
      const desktop = toggle.dataset.hwioMenuUntil ? window.matchMedia(`(min-width: ${toggle.dataset.hwioMenuUntil})`) : null;
      let inerted: HTMLElement[] = [];
      let hideTimer: ReturnType<typeof setTimeout> | null = null;
      const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';
      const label = (open: boolean) => {
        const text = open ? toggle.dataset.hwioLabelClose : toggle.dataset.hwioLabelOpen;
        if (text) toggle.setAttribute('aria-label', text);
      };
      // Lock the page where it is: overflow hidden on the root, its scrollbar's width kept as padding (so
      // the layout keeps its width), and the page outside the header inert, walking up from the header.
      // Fixed layers and dialogs stay live: they sit above the sheet (the cookie banner and its settings,
      // a chat widget), and an inert one would show but not take a click (owner, 2026-11-03).
      const staysLive = (el: HTMLElement) => el.tagName === 'DIALOG' || getComputedStyle(el).position === 'fixed';
      const lock = (on: boolean) => {
        if (on) {
          root.style.setProperty('--hwio-scrollbar', `${Math.max(0, window.innerWidth - root.clientWidth)}px`);
          root.classList.add('hwio-scroll-lock');
          for (let node: HTMLElement | null = header; node && node.parentElement && node !== document.body; node = node.parentElement) {
            for (const sibling of Array.from(node.parentElement.children)) {
              if (sibling !== node && sibling instanceof HTMLElement && !sibling.inert && sibling.tagName !== 'SCRIPT' && !staysLive(sibling)) {
                sibling.inert = true;
                inerted.push(sibling);
              }
            }
          }
        } else {
          root.classList.remove('hwio-scroll-lock');
          root.style.removeProperty('--hwio-scrollbar');
          inerted.forEach((el) => { el.inert = false; });
          inerted = [];
        }
      };
      const setOpen = (open: boolean, restoreFocus = true) => {
        if (isOpen() === open) return;
        toggle.setAttribute('aria-expanded', String(open));
        label(open);
        if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
        if (open) {
          panel.hidden = false;
          lock(true);
          // One frame with the closed state rendered, so the sheet fades in instead of appearing.
          requestAnimationFrame(() => { if (isOpen()) panel.dataset.state = 'open'; });
          hwioAnnouncePopup(panel);
          panel.querySelector<HTMLElement>('a[href], button, summary, input:not([type="hidden"])')?.focus({ preventScroll: true });
        } else {
          panel.dataset.state = 'closed';
          lock(false);
          const hide = () => { if (!isOpen()) panel.hidden = true; };
          if (reduced.matches) hide(); else hideTimer = setTimeout(hide, 200);
          if (restoreFocus) toggle.focus({ preventScroll: true });
        }
      };
      closeMenus.push(() => { if (isOpen()) { setOpen(false, false); panel.hidden = true; } });
      toggle.addEventListener('click', () => setOpen(!isOpen()), { signal });
      // A followed link closes the menu without stealing focus from the navigation target (same-page anchors).
      panel.querySelectorAll('a[href]').forEach((a) => a.addEventListener('click', () => setOpen(false, false), { signal }));
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && isOpen()) setOpen(false); }, { signal });
      desktop?.addEventListener('change', (e) => { if (e.matches) setOpen(false, false); }, { signal });
      // Another popup (the language dropdown in the bar) opened: close the menu unless it sits in the sheet.
      hwioOnPopup((owner) => { if (owner !== panel && !panel.contains(owner)) setOpen(false, false); }, signal);
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
      // Another popup (a language dropdown, the small-screen menu) opened: close the panels unless it sits in one.
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
