/**
 * One popup at a time across runtimes. A runtime that opens something which floats over the page
 * (HWioHeader's mega panel or drawer, a `details[data-hwio-dropdown]`) announces the element it
 * opened with `hwio:popupopen`; every other runtime closes what it has open unless that element is
 * the announced one or contains it. The runtimes stay independent: neither imports the other.
 */
export const HWIO_POPUP_EVENT = 'hwio:popupopen';

export interface HWioPopupDetail {
  owner: Element;
}

/** Tell the other runtimes that `owner` has just opened. */
export function hwioAnnouncePopup(owner: Element): void {
  document.dispatchEvent(new CustomEvent<HWioPopupDetail>(HWIO_POPUP_EVENT, { detail: { owner } }));
}

/** Run `handler` whenever another runtime opens a popup; detaches with `signal`. */
export function hwioOnPopup(handler: (owner: Element) => void, signal: AbortSignal): void {
  document.addEventListener(
    HWIO_POPUP_EVENT,
    (event) => {
      const owner = (event as CustomEvent<HWioPopupDetail>).detail?.owner;
      if (owner) handler(owner);
    },
    { signal },
  );
}
