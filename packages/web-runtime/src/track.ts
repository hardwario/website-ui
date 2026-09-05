/**
 * CTA click events for GTM: any [data-track] element pushes cta_click with its id and location.
 * Consent-gated like the form events. Attribute names are the measurement contract shared with
 * the GTM containers and CONVERSION.md; do not rename them.
 */
export function hwioTrackRuntime(): void {
  if ((window as Window & { __hwioTrackBound?: boolean }).__hwioTrackBound) return;
  (window as Window & { __hwioTrackBound?: boolean }).__hwioTrackBound = true;
  document.addEventListener('click', (event) => {
    const el = (event.target as Element | null)?.closest?.('[data-track]');
    if (!el || !window.hwioConsent?.canTrack()) return;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'cta_click',
      cta_id: el.getAttribute('data-track'),
      trigger_location: el.getAttribute('data-track-location') || undefined,
      page_path: window.location.pathname,
    });
  });
}
