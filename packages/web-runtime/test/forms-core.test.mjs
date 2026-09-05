import test from 'node:test';
import assert from 'node:assert/strict';
import { hwioBuildSubmitPayload, hwioPageUri, hwioGaClientId, hwioFoldMessageContext, hwioFormEventPayload } from '../dist/forms-core.js';
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
