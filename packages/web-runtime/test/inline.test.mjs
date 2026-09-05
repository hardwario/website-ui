import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { consentDefaults, themeBootstrap, fontGate, hwioInlineHashes } from '../dist/inline.js';

test('inline bootstrap hashes match their code (CSP script-src)', () => {
  for (const s of [consentDefaults, themeBootstrap, fontGate]) {
    assert.equal(s.hash, `sha256-${createHash('sha256').update(s.code, 'utf8').digest('base64')}`);
    assert.doesNotMatch(s.code, /GTM-|hardwario\.(com|studio)/, 'bootstraps must not be site-specific');
  }
  assert.equal(hwioInlineHashes.length, 3);
});
