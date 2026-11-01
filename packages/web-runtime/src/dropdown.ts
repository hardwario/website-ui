import { hwioMount } from './mount.js';
import { hwioAnnouncePopup, hwioOnPopup } from './popup.js';

/**
 * Dropdowns built on `<details data-hwio-dropdown>` (HWioLanguageSwitcher's dropdown variant). A
 * native `<details>` stays open over the page until its own summary is clicked again; this runtime
 * closes it the way a menu button is expected to close (WAI-ARIA disclosure pattern, WCAG 2.1.1 and
 * 1.4.13):
 * - a click or tap outside it;
 * - Escape, with focus back on its summary when focus was inside;
 * - focus leaving it (Tab past the last item);
 * - another dropdown opening, or another runtime announcing a popup (HWioHeader's mega panels and
 *   drawer, through `hwio:popupopen`). Opening a dropdown announces it, so an open mega panel closes.
 */
export function hwioDropdownRuntime() {
  let controller: AbortController | null = null;
  function cleanup() {
    controller?.abort();
    controller = null;
  }
  function bind() {
    cleanup();
    const dropdowns = Array.from(document.querySelectorAll<HTMLDetailsElement>('details[data-hwio-dropdown]'));
    if (!dropdowns.length) return;
    controller = new AbortController();
    const { signal } = controller;
    const close = (dropdown: HTMLDetailsElement, restoreFocus = false) => {
      if (!dropdown.open) return;
      const hadFocus = dropdown.contains(document.activeElement);
      dropdown.open = false;
      if (restoreFocus && hadFocus) dropdown.querySelector<HTMLElement>('summary')?.focus();
    };
    document.addEventListener(
      'click',
      (event) => {
        const target = event.target as Node | null;
        dropdowns.forEach((d) => {
          if (!target || !d.contains(target)) close(d);
        });
      },
      { signal },
    );
    document.addEventListener(
      'keydown',
      (event) => {
        if (event.key === 'Escape') dropdowns.forEach((d) => close(d, true));
      },
      { signal },
    );
    dropdowns.forEach((dropdown) => {
      dropdown.addEventListener(
        'focusout',
        (event) => {
          const next = (event as FocusEvent).relatedTarget as Node | null;
          if (next && !dropdown.contains(next)) close(dropdown);
        },
        { signal },
      );
      dropdown.addEventListener(
        'toggle',
        () => {
          if (!dropdown.open) return;
          dropdowns.forEach((other) => {
            if (other !== dropdown) close(other);
          });
          hwioAnnouncePopup(dropdown);
        },
        { signal },
      );
    });
    hwioOnPopup((owner) => {
      dropdowns.forEach((d) => {
        if (d !== owner && !d.contains(owner)) close(d);
      });
    }, signal);
  }
  return hwioMount('dropdown', { bind, cleanup });
}
