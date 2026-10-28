export const HWIO_ATTRIBUTION_KEY = 'hwio_attribution';
const LEGACY_ATTRIBUTION_KEY = 'hw_attribution'; // legacy-ok
const MAX_LEN = 512;

/** Click identifiers + UTM params; lowercase keys map onto HubSpot contact properties of the same name. */
export const HWIO_ATTRIBUTION_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'gbraid', 'wbraid', 'fbclid', 'msclkid', 'li_fat_id'] as const;

export type HWioAttribution = Record<string, string>;

/** Pure: click identifiers present in a query string. */
export function hwioAttributionFromSearch(search: string): HWioAttribution {
  const out: HWioAttribution = {};
  const params = new URLSearchParams(search);
  for (const key of HWIO_ATTRIBUTION_PARAMS) {
    const value = params.get(key);
    if (value) out[key] = value.slice(0, MAX_LEN);
  }
  return out;
}

/** Pure: first value per key wins, in the order the sources are given (earliest touch first). */
export function hwioFirstTouch(...sources: (HWioAttribution | undefined)[]): HWioAttribution {
  const out: HWioAttribution = {};
  for (const source of sources) {
    for (const [key, value] of Object.entries(source ?? {})) if (value && !out[key]) out[key] = value;
  }
  return out;
}

// The landing page's click ids and UTM parameters, held in memory only: nothing is written to the
// device, and nothing leaves the browser unless a form is sent with marketing consent. The memory
// lives as long as the page's JavaScript does, so it survives Astro ClientRouter navigations
// (which drop the query string) and is gone after a full page load.
let landing: HWioAttribution | undefined;

/**
 * Remembers the current URL's click ids and UTM parameters in memory (first touch). Call on every
 * page load; the forms runtime does. No consent is needed because nothing is stored or sent.
 */
export function hwioRememberLandingAttribution(): void {
  landing = hwioFirstTouch(landing, hwioAttributionFromSearch(window.location.search));
}

function read(): HWioAttribution {
  try {
    const raw = sessionStorage.getItem(HWIO_ATTRIBUTION_KEY) ?? sessionStorage.getItem(LEGACY_ATTRIBUTION_KEY);
    return raw ? (JSON.parse(raw) as HWioAttribution) : {};
  } catch {
    return {};
  }
}

/**
 * First-touch capture into sessionStorage (marketing storage: call only with marketing consent).
 * Keeps the first value seen in the session so later navigations cannot clobber the campaign.
 */
export function hwioCaptureAttribution(): void {
  const stored = read();
  let changed = false;
  // The remembered landing values first: consent given on a later page keeps the ad click.
  for (const [key, value] of Object.entries(hwioGetPageAttribution())) {
    if (!stored[key]) { stored[key] = value; changed = true; }
  }
  if (!stored.referrer && document.referrer) {
    try {
      if (new URL(document.referrer).host !== window.location.host) {
        stored.referrer = document.referrer.slice(0, MAX_LEN);
        changed = true;
      }
    } catch {
      // malformed referrer
    }
  }
  if (changed) {
    try {
      sessionStorage.setItem(HWIO_ATTRIBUTION_KEY, JSON.stringify(stored));
      sessionStorage.removeItem(LEGACY_ATTRIBUTION_KEY);
    } catch {
      // best effort
    }
  }
}

export function hwioGetAttribution(): HWioAttribution {
  return read();
}

/** Click ids and UTM parameters of this visit: the remembered landing values, then the current URL. */
export function hwioGetPageAttribution(): HWioAttribution {
  return hwioFirstTouch(landing, hwioAttributionFromSearch(window.location.search));
}
