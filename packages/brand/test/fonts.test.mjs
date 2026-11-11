import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const brand = JSON.parse(readFileSync(join(root, 'src/brand.json'), 'utf8'));
const inter = brand.fonts.families.inter;
const size = (file) => statSync(join(root, 'fonts', file)).size;
const face = (file) => inter.faces.find((f) => f.file === file);

// Owner ruling R3 keeps text invisible until the preloaded faces decode, so their bytes are what a
// first visit waits for. The Latin Extended face a page preloads holds Latin Extended-A only (the
// Central European letters the sites use); the rest of the old 85 kB file is a face of its own that
// only a page showing such a glyph fetches (scripts/split-latin-ext.py).
test('the gated Inter faces stay small', () => {
  assert.ok(size('inter-latin.woff2') < 52_000, 'inter-latin.woff2 grew');
  assert.ok(size('inter-latin-ext.woff2') < 24_000, 'inter-latin-ext.woff2 is the Latin Extended-A face, about 19 kB: do not put the full subset back');
});

test('the Latin Extended ranges do not overlap, and together cover what the full subset covered', () => {
  assert.equal(face('inter-latin-ext.woff2').unicodeRange, 'U+0100-017F, U+0304, U+0308, U+0329');
  const rest = face('inter-latin-ext-rest.woff2');
  assert.ok(rest, 'the on-demand face is declared');
  assert.match(rest.unicodeRange, /^U\+0180-02AF, /, 'the rest starts right after Latin Extended-A');
  assert.doesNotMatch(rest.unicodeRange, /U\+01[0-7][0-9A-F]\b/, 'no Latin Extended-A code point in the on-demand face');
  const css = readFileSync(join(root, 'dist/fonts/inter.css'), 'utf8');
  assert.equal((css.match(/@font-face/g) ?? []).length, 4, 'three Inter faces and the fallback');
  assert.ok(css.includes("url('/fonts/inter-latin-ext-rest.woff2')"));
});

// The Latin face is the Google Fonts subset plus five code points the copy uses: two arrows, the
// subscript two and the Greek mu cut from the full Inter file of the same build, and the
// non-breaking hyphen drawn with the keyboard hyphen's glyph (scripts/extend-latin.py). A browser asks a face only for the code points its range names:
// with Google's range pasted back, the glyphs would be in the file and never used.
test('the Latin face names the code points added to the Google subset', () => {
  const parts = face('inter-latin.woff2').unicodeRange.split(', ');
  for (const part of ['U+03BC', 'U+2000-206F', 'U+2082', 'U+2191-2193', 'U+2197']) {
    assert.ok(parts.includes(part), `${part} is in the Latin range`);
  }
  const others = inter.faces.filter((f) => f.file !== 'inter-latin.woff2').map((f) => f.unicodeRange).join(', ');
  assert.doesNotMatch(others, /U\+(03BC|2082|219[0-9])\b/, 'no other face claims them');
  const css = readFileSync(join(root, 'dist/fonts/inter.css'), 'utf8');
  assert.ok(css.includes('U+2191-2193, U+2197'), 'the generated CSS carries the range');
});
