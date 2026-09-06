import test from 'node:test';
import assert from 'node:assert/strict';
import { hwioFooterSites, hwioSiteUrl } from '../dist/sites.js';

test('footer strip follows the owner rules', () => {
  // Engineering's 2026-07-19 exemption was lifted by the owner on 2026-09-06: full strip, self omitted.
  assert.deepEqual(hwioFooterSites({ self: 'engineering', locale: 'en' }).map((s) => s.key), ['www', 'docs', 'studio', 'academy', 'stem']);
  assert.deepEqual(hwioFooterSites({ self: 'energy', locale: 'cs' }), []);
  assert.deepEqual(hwioFooterSites({ self: 'academy', locale: 'cs' }).map((s) => s.key), ['www', 'engineering', 'studio']);
  assert.deepEqual(hwioFooterSites({ self: 'www', locale: 'en' }).map((s) => s.key), ['docs', 'engineering', 'studio', 'academy', 'stem']);
  assert.deepEqual(hwioFooterSites({ self: 'forestry', locale: 'en' }), []);
});

test('family URLs are localised only where the site has the locale', () => {
  assert.equal(hwioSiteUrl('www', 'cs'), 'https://www.hardwario.com/cs/');
  assert.equal(hwioSiteUrl('docs', 'de'), 'https://docs.hardwario.com/');
  assert.equal(hwioSiteUrl('docs', 'cs'), 'https://docs.hardwario.com/cs/');
  assert.equal(hwioSiteUrl('engineering', 'en'), 'https://hardwario.engineering/');
});
