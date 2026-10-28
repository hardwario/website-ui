import test from 'node:test';
import assert from 'node:assert/strict';
import { hwioBuildSubmitPayload, hwioPageUri, hwioGaClientId, hwioFoldMessageContext, hwioFormEventPayload, hwioSubmitAttribution } from '../dist/forms-core.js';
import { hwioAttributionFromSearch } from '../dist/attribution.js';

test('submit payload matches the website-forms Worker contract', () => {
  const payload = hwioBuildSubmitPayload({
    formId: '1506fb62-d786-423f-acf0-9b6cdc55cb91', locale: 'en', turnstileToken: 'tok', hutk: undefined,
    pageUri: 'https://www.hardwario.com/contact/', pageName: 'Contact', fields: { email: 'a@b.c', hwio_hp: '' }, attribution: {},
  });
  assert.deepEqual(Object.keys(payload), ['formId', 'locale', 'turnstileToken', 'hutk', 'pageUri', 'pageName', 'fields', 'attribution']);
  assert.equal(payload.attribution, undefined);
  assert.equal(payload.fields.hwio_hp, '');
});

test('page URI drops the query string', () => {
  assert.equal(hwioPageUri({ origin: 'https://x.y', pathname: '/p/' }), 'https://x.y/p/');
});

test('attribution reads only the allowlisted params and clamps to 512 chars', () => {
  const out = hwioAttributionFromSearch('?utm_source=li&gclid=' + 'x'.repeat(600) + '&evil=1');
  assert.deepEqual(Object.keys(out), ['utm_source', 'gclid']);
  assert.equal(out.gclid.length, 512);
});

test('without marketing consent no click id or UTM parameter is sent, not even from the current URL', () => {
  const page = hwioAttributionFromSearch('?gclid=g1&gbraid=gb&wbraid=wb&fbclid=f1&msclkid=m1&li_fat_id=l1&utm_source=google&utm_medium=cpc&utm_campaign=c&utm_term=t&utm_content=x');
  const stored = { utm_source: 'linkedin', referrer: 'https://example.com/' };
  for (const enrich of [true, false]) {
    assert.deepEqual(hwioSubmitAttribution({ enrich, marketing: false, statistics: false, stored, page }), {});
    assert.deepEqual(hwioSubmitAttribution({ enrich, marketing: false, statistics: true, stored, page, gaClientId: '1.2' }), enrich ? { ga_client_id: '1.2' } : {});
  }
});

test('with marketing consent the URL ids are sent on every form, the stored copy on enriched forms only', () => {
  const page = { gclid: 'g1', utm_source: 'google' };
  const stored = { utm_source: 'linkedin', referrer: 'https://example.com/' };
  assert.deepEqual(hwioSubmitAttribution({ enrich: true, marketing: true, statistics: false, stored, page }), { utm_source: 'google', referrer: 'https://example.com/', gclid: 'g1' });
  assert.deepEqual(hwioSubmitAttribution({ enrich: false, marketing: true, statistics: false, stored, page }), { gclid: 'g1', utm_source: 'google' });
});

test('the GA4 client id needs statistics consent and an enriched form', () => {
  assert.deepEqual(hwioSubmitAttribution({ enrich: true, marketing: false, statistics: true, gaClientId: '123.456' }), { ga_client_id: '123.456' });
  assert.deepEqual(hwioSubmitAttribution({ enrich: true, marketing: true, statistics: false, gaClientId: '123.456' }), {});
  assert.deepEqual(hwioSubmitAttribution({ enrich: false, marketing: true, statistics: true, gaClientId: '123.456' }), {});
});

test('GA client id extraction', () => {
  assert.equal(hwioGaClientId('_ga=GA1.1.123456.789012; other=1'), '123456.789012');
  assert.equal(hwioGaClientId('other=1'), undefined);
});

test('message context folds into the message field and removes UI-only fields', () => {
  const fields = hwioFoldMessageContext({ message: 'Hi', budget: '10k', team: '' }, [{ name: 'budget', label: 'Budget', value: '10k' }, { name: 'team', label: 'Team', value: '' }]);
  assert.equal(fields.message, 'Budget: 10k\n\nHi');
  assert.equal('budget' in fields, false);
});

test('form event payload keeps the GTM parameter names', () => {
  assert.deepEqual(hwioFormEventPayload({ event: 'generate_lead', formId: 'g', formName: 'contact', pagePath: '/contact/' }), { event: 'generate_lead', form_id: 'g', form_name: 'contact', form_kind: 'contact', page_path: '/contact/' });
});

test('first touch: the earliest source wins per key, empty values never count', async () => {
  const { hwioFirstTouch } = await import('../dist/attribution.js');
  const landing = { gclid: 'landing', utm_source: 'google' };
  const later = { gclid: 'later', utm_campaign: 'spring', utm_source: '' };
  assert.deepEqual(hwioFirstTouch(undefined, landing, later), { gclid: 'landing', utm_source: 'google', utm_campaign: 'spring' });
  assert.deepEqual(hwioFirstTouch(undefined, {}), {});
});

test('landing click ids survive a client-side navigation in memory and nothing is stored', async () => {
  const storage = new Map();
  const location = { search: '?gclid=abc&utm_source=google', host: 'www.example.com' };
  globalThis.window = { location };
  globalThis.document = { referrer: '' };
  globalThis.sessionStorage = { getItem: (k) => storage.get(k) ?? null, setItem: (k, v) => storage.set(k, v), removeItem: (k) => storage.delete(k) };
  const { hwioRememberLandingAttribution, hwioGetPageAttribution, hwioCaptureAttribution } = await import('../dist/attribution.js?memory');
  hwioRememberLandingAttribution();
  location.search = '';                      // ClientRouter navigation drops the query
  hwioRememberLandingAttribution();
  assert.equal(storage.size, 0);             // nothing written before consent
  assert.deepEqual(hwioGetPageAttribution(), { gclid: 'abc', utm_source: 'google' });
  hwioCaptureAttribution();                  // marketing consent granted on the later page
  assert.deepEqual(JSON.parse(storage.get('hwio_attribution')), { gclid: 'abc', utm_source: 'google' });
  delete globalThis.window; delete globalThis.document; delete globalThis.sessionStorage;
});
