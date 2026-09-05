export type HWioConsentCategory = 'necessary' | 'preferences' | 'statistics' | 'marketing';
export type HWioConsentCategories = Record<HWioConsentCategory, boolean>;
export interface HWioConsentReceipt {
  version: string;
  method: string;
  locale: string;
  timestamp: string;
  categories: HWioConsentCategories;
}

export const HWIO_CONSENT_COOKIE = 'hwio_cookie_consent';
/** Pre-design-system cookie written by www and the Zola sites; migrated in place, never re-prompted. */
export const LEGACY_CONSENT_COOKIE = 'hw_cookie_consent'; // legacy-ok
export const HWIO_CONSENT_MAX_AGE = 60 * 60 * 24 * 180;

export function hwioBaseCategories(overrides?: Partial<Record<string, boolean>> | null): HWioConsentCategories {
  return {
    necessary: true,
    preferences: !!overrides?.preferences,
    statistics: !!overrides?.statistics,
    marketing: !!overrides?.marketing,
  };
}

function safeDecode(input: string): string {
  try {
    return decodeURIComponent(input);
  } catch {
    return input;
  }
}

/** Parses a raw cookie value; returns null unless it is a receipt of the expected version. */
export function hwioParseReceipt(raw: string | null | undefined, version: string): HWioConsentReceipt | null {
  if (!raw) return null;
  const attempts = [raw];
  const decoded = safeDecode(raw);
  if (decoded !== raw) attempts.push(decoded);
  for (const attempt of attempts) {
    try {
      const parsed = JSON.parse(attempt) as Partial<HWioConsentReceipt>;
      if (parsed && parsed.version === version) {
        return {
          version,
          method: parsed.method ?? 'unknown',
          locale: parsed.locale ?? 'en',
          timestamp: parsed.timestamp ?? new Date(0).toISOString(),
          categories: hwioBaseCategories(parsed.categories),
        };
      }
    } catch {
      // not JSON, try the next form
    }
  }
  return null;
}

export function hwioMakeReceipt(categories: Partial<Record<string, boolean>>, method: string, version: string, locale: string, now = new Date()): HWioConsentReceipt {
  return { version, method, locale, timestamp: now.toISOString(), categories: hwioBaseCategories(categories) };
}

/** Serialises a receipt into the Set-Cookie string (document.cookie assignment form). */
export function hwioCookieString(name: string, receipt: HWioConsentReceipt, secure: boolean): string {
  return `${name}=${encodeURIComponent(JSON.stringify(receipt))}; Max-Age=${HWIO_CONSENT_MAX_AGE}; Path=/; SameSite=Lax${secure ? '; Secure' : ''}`;
}

export function hwioExpireCookieString(name: string, domain?: string): string {
  return `${name}=; Max-Age=0; Path=/; SameSite=Lax${domain ? `; Domain=${domain}` : ''}`;
}

export function hwioReadCookie(cookieHeader: string, name: string): string | null {
  const match = cookieHeader.match(new RegExp('(?:^|;\\s*)' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '=([^;]*)'));
  return match ? match[1] : null;
}

export type HWioGoogleConsent = Record<
  'ad_storage' | 'ad_user_data' | 'ad_personalization' | 'analytics_storage' | 'functionality_storage' | 'personalization_storage' | 'security_storage',
  'granted' | 'denied'
>;

export function hwioConsentToGoogle(receipt: HWioConsentReceipt | null): HWioGoogleConsent {
  const c = hwioBaseCategories(receipt?.categories);
  const g = (v: boolean) => (v ? 'granted' : 'denied') as 'granted' | 'denied';
  return {
    ad_storage: g(c.marketing),
    ad_user_data: g(c.marketing),
    ad_personalization: g(c.marketing),
    analytics_storage: g(c.statistics),
    functionality_storage: g(c.preferences),
    personalization_storage: g(c.preferences),
    security_storage: 'granted',
  };
}

export function hwioHasTrackingConsent(receipt: HWioConsentReceipt | null): boolean {
  return !!receipt && (receipt.categories.statistics || receipt.categories.marketing);
}

/** Cookie names that a withdrawn category must delete (GA4, Google Ads, Meta, HubSpot). */
export function hwioDisallowedCookieNames(names: string[], categories: HWioConsentCategories): string[] {
  return names.filter((name) => {
    const isStatistics = name === '_ga' || name.startsWith('_ga_') || name === '_gid' || name.startsWith('_gat');
    const isMarketing = name.startsWith('_gcl_') || name === '_fbp' || name === '_fbc' || name === 'hubspotutk' || name === '__hstc' || name === '__hssc' || name === '__hssrc';
    return (!categories.statistics && isStatistics) || (!categories.marketing && isMarketing);
  });
}
