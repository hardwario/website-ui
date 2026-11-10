import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import vm from 'node:vm';
import { consentDefaults, consentReveal, themeBootstrap, fontGate, hwioInlineHashes } from '../dist/inline.js';

test('inline bootstrap hashes match their code (CSP script-src)', () => {
  for (const s of [consentDefaults, consentReveal, themeBootstrap, fontGate]) {
    assert.equal(s.hash, `sha256-${createHash('sha256').update(s.code, 'utf8').digest('base64')}`);
    assert.doesNotMatch(s.code, /GTM-|hardwario\.(com|studio)/, 'bootstraps must not be site-specific');
    assert.ok(hwioInlineHashes.includes(s.hash), 'every bootstrap is in the list the sites put into script-src');
  }
  assert.equal(hwioInlineHashes.length, 4);
});

// consentReveal runs right behind the banner's markup: it may only lift `hidden`, and only when no
// consent cookie of either name exists.
function reveal(cookie, { banner = true, script = true } = {}) {
  const root = { hidden: true, hasAttribute: (name) => banner && name === 'data-hwio-consent' };
  const document = { cookie, currentScript: script ? { previousElementSibling: root } : null };
  vm.runInNewContext(consentReveal.code, { document });
  return root.hidden;
}

test('consentReveal shows the banner on a visit without a stored choice', () => {
  assert.equal(reveal(''), false);
  assert.equal(reveal('hwio_theme=dark; _ga=GA1.1.1'), false);
  assert.equal(reveal('not_hwio_cookie_consent=1'), false, 'a cookie whose name only ends the same does not count');
});

test('consentReveal leaves the banner hidden when a consent cookie exists', () => {
  assert.equal(reveal('hwio_cookie_consent=%7B%22version%22%3A%222026-09-05%22%7D'), true);
  assert.equal(reveal('hwio_theme=dark; hwio_cookie_consent=x'), true);
  assert.equal(reveal('hw_cookie_consent=x'), true, 'the pre-design-system cookie is migrated by the runtime, not asked again'); // legacy-ok
});

test('consentReveal touches nothing but the banner behind it', () => {
  assert.equal(reveal('', { banner: false }), true, 'another element before the script stays as it is');
  assert.doesNotThrow(() => reveal('', { script: false }), 'no currentScript (a module context) is not an error');
});
