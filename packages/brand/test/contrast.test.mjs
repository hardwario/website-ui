import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { report, ACCEPTED, ratio } from '../scripts/contrast.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const tokens = JSON.parse(readFileSync(join(here, '../dist/tokens.json'), 'utf8'));

test('the ratios of record in the guidelines hold (chapter 03, D23, D35)', () => {
  const p = tokens.palette;
  const floor = (v) => Math.floor(v * 10) / 10;
  assert.equal(floor(ratio(p.ink, p.white)), 15.1);
  assert.equal(floor(ratio(p.blue, p.white)), 5.2);
  assert.equal(floor(ratio(p.gray, p.panel)), 4.9);
  assert.equal(floor(ratio(p.sky, p.white)), 2.9);
  assert.equal(floor(ratio(p['gradient-figure-end'], p.white)), 4.5);
  assert.equal(floor(ratio(p['dark-red'], p['dark-ground'])), 4.9);
  assert.equal(floor(ratio(p.sky, p['dark-ground'])), 6.1);
});

test('every text/background pair of every theme meets WCAG AA or is a listed, decided exception', () => {
  const failures = [];
  for (const { theme, rows } of report(tokens)) {
    for (const row of rows) {
      const accepted = ACCEPTED[theme]?.[row.label];
      if (row.ratio < row.need && !accepted) failures.push(`${theme}: ${row.label} ${row.fg} on ${row.bg} = ${row.ratio.toFixed(2)} (needs ${row.need})`);
      if (row.ratio >= row.need && accepted) failures.push(`${theme}: ${row.label} passes now (${row.ratio.toFixed(2)}); drop it from ACCEPTED`);
    }
  }
  assert.deepEqual(failures, []);
});
