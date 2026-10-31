import test from 'node:test';
import assert from 'node:assert/strict';
import { hwioParseCount, hwioFormatCount, hwioEaseOut, hwioCountAt } from '../dist/count-core.js';

const NBSP = '\u00a0';

test('format: thousands with a non-breaking space, template around the number', () => {
  assert.equal(hwioFormatCount(7000, '{n}+', NBSP), `7${NBSP}000+`);
  assert.equal(hwioFormatCount(1234567, '{n}', NBSP), `1${NBSP}234${NBSP}567`);
  assert.equal(hwioFormatCount(30, '{n}+'), '30+');
  assert.equal(hwioFormatCount(2016, 'Since {n}'), 'Since 2016');
  assert.equal(hwioFormatCount(999, '{n}', ','), '999');
  assert.equal(hwioFormatCount(12.6), '13');
  assert.equal(hwioFormatCount(-1500, '{n}', ','), '-1,500');
});

test('parse: data attributes into a spec; a missing or bad target is no count', () => {
  assert.deepEqual(hwioParseCount({ hwioCount: '7000', hwioCountTemplate: '{n}+', hwioCountGroup: NBSP }), { to: 7000, from: 0, template: '{n}+', group: NBSP });
  assert.deepEqual(hwioParseCount({ hwioCount: '2016', hwioCountFrom: '2000', hwioCountTemplate: 'Since {n}' }), { to: 2016, from: 2000, template: 'Since {n}', group: '' });
  assert.equal(hwioParseCount({}), null);
  assert.equal(hwioParseCount({ hwioCount: '' }), null);
  assert.equal(hwioParseCount({ hwioCount: 'many' }), null);
  assert.equal(hwioParseCount({ hwioCount: '5', hwioCountTemplate: 'no marker' })?.template, '{n}');
  assert.equal(hwioParseCount({ hwioCount: '5', hwioCountFrom: 'x' })?.from, 0);
});

test('ease-out: 0 at the start, 1 at the end, never past either, fast start', () => {
  assert.equal(hwioEaseOut(0), 0);
  assert.equal(hwioEaseOut(1), 1);
  assert.equal(hwioEaseOut(-1), 0);
  assert.equal(hwioEaseOut(2), 1);
  assert.ok(hwioEaseOut(0.5) > 0.5);
});

test('count at progress: from at 0, to at 1, monotonic between', () => {
  const spec = { from: 2000, to: 2016 };
  assert.equal(hwioCountAt(spec, 0), 2000);
  assert.equal(hwioCountAt(spec, 1), 2016);
  let last = -Infinity;
  for (let p = 0; p <= 1; p += 0.05) {
    const v = hwioCountAt({ from: 0, to: 7000 }, p);
    assert.ok(v >= last);
    last = v;
  }
});
