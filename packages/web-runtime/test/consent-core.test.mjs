import test from 'node:test';
import assert from 'node:assert/strict';
import { hwioParseReceipt, hwioMakeReceipt, hwioCookieString, hwioConsentToGoogle, hwioReadCookie, hwioDisallowedCookieNames, HWIO_CONSENT_COOKIE } from '../dist/consent-core.js';

test('receipt round-trips through the cookie string and rejects other versions', () => {
  const receipt = hwioMakeReceipt({ statistics: true }, 'granular', '2026-09-05', 'cs', new Date('2026-09-05T10:00:00Z'));
  const cookie = hwioCookieString(HWIO_CONSENT_COOKIE, receipt, true);
  assert.match(cookie, /^hwio_cookie_consent=.*; Max-Age=15552000; Path=\/; SameSite=Lax; Secure$/);
  const raw = hwioReadCookie(cookie.split(';')[0], HWIO_CONSENT_COOKIE);
  assert.deepEqual(hwioParseReceipt(raw, '2026-09-05'), receipt);
  assert.equal(hwioParseReceipt(raw, '2026-01-01'), null);
});

test('legacy www receipt (same shape) parses so it can be migrated', () => {
  const legacy = JSON.stringify({ version: '2026-05-16', method: 'accept_all', locale: 'en', timestamp: '2026-06-01T00:00:00.000Z', categories: { necessary: true, preferences: true, statistics: true, marketing: true } });
  const parsed = hwioParseReceipt(encodeURIComponent(legacy), '2026-05-16');
  assert.equal(parsed?.categories.marketing, true);
});

test('Consent Mode v2 mapping', () => {
  assert.deepEqual(hwioConsentToGoogle(null), { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied', functionality_storage: 'denied', personalization_storage: 'denied', security_storage: 'granted' });
  const r = hwioMakeReceipt({ marketing: true, preferences: true }, 'granular', 'v', 'en');
  const g = hwioConsentToGoogle(r);
  assert.equal(g.ad_storage, 'granted'); assert.equal(g.analytics_storage, 'denied'); assert.equal(g.functionality_storage, 'granted');
});

test('withdrawn categories select the right cookies to expire', () => {
  const names = ['_ga', '_ga_ABC', '_gid', '_gcl_au', 'hubspotutk', '__hstc', 'hwio_cookie_consent', 'session'];
  assert.deepEqual(hwioDisallowedCookieNames(names, { necessary: true, preferences: false, statistics: false, marketing: true }), ['_ga', '_ga_ABC', '_gid']);
  assert.deepEqual(hwioDisallowedCookieNames(names, { necessary: true, preferences: false, statistics: true, marketing: false }), ['_gcl_au', 'hubspotutk', '__hstc']);
});
