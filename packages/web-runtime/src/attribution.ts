export const HWIO_ATTRIBUTION_KEY = 'hwio_attribution';
const LEGACY_ATTRIBUTION_KEY = 'hw_attribution'; // legacy-ok
const MAX_LEN = 512;

/** Click identifiers + UTM params; lowercase keys map onto HubSpot contact properties of the same name. */
export const HWIO_ATTRIBUTION_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'gbraid', 'wbraid', 'fbclid', 'msclkid', 'li_fat_id'] as const;

export type HWioAttribution = Record<string, string>;

/** Pure: click identifiers present in a query string (read at submit time, never stored). */
export function hwioAttributionFromSearch(search: string): HWioAttribution {
  const out: HWioAttribution = {};
  const params = new URLSearchParams(search);
  for (const key of HWIO_ATTRIBUTION_PARAMS) {
    const value = params.get(key);
    if (value) out[key] = value.slice(0, MAX_LEN);
  }
  return out;
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
  for (const [key, value] of Object.entries(hwioAttributionFromSearch(window.location.search))) {
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

export function hwioGetPageAttribution(): HWioAttribution {
  return hwioAttributionFromSearch(window.location.search);
}
