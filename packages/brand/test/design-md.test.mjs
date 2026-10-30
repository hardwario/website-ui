import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const brand = JSON.parse(readFileSync(join(here, '../src/brand.json'), 'utf8'));
const css = readFileSync(join(here, '../../ui/src/styles/styles.css'), 'utf8');
const presets = brand.typography.presets;
const theme = (name) => readFileSync(join(here, `../../ui/src/styles/themes/${name}.css`), 'utf8');
const BP = ['sm', 'md', 'lg', 'xl', '2xl'];

// The declarations of one theme scope: the base block, then each media step in order.
function typeSteps(css, role) {
  const re = new RegExp(`--hwio-type-${role}-size: ([^;]+);`, 'g');
  return [...css.matchAll(re)].map((m) => m[1]);
}

test('styles.css reads every typography role from the theme variables', () => {
  for (const role of ['display', 'heading', 'subheading', 'title', 'lead', 'body', 'caption', 'kicker', 'chip', 'figure', 'button']) {
    assert.match(css, new RegExp(`var\\(--hwio-type-${role}-size`), `${role} size not read in styles.css`);
  }
  assert.match(css, /h1 \{ font-size: var\(--hwio-type-display-size/);
  assert.match(css, /h2 \{ font-size: var\(--hwio-type-heading-size/);
  assert.match(css, /h3 \{ font-size: var\(--hwio-type-subheading-size/);
  assert.match(css, /--fontsize: var\(--hwio-type-button-size/);
});

test('generated theme files carry each preset, base value first and one value per responsive step', () => {
  for (const [themeName, presetName] of [['hwio', 'hwio'], ['hwio-dark', 'hwio'], ['er3o', 'er3o']]) {
    const file = theme(themeName);
    assert.match(file, new RegExp(`Type preset "${presetName}"`));
    for (const [role, r] of Object.entries(presets[presetName].roles)) {
      const expected = [r.responsive?.base ?? r.fontSize];
      for (const bp of BP) {
        if (r.responsive?.[bp]) expected.push(r.responsive[bp]);
        if (r.from === bp) expected.push(r.fontSize);
      }
      assert.deepEqual(typeSteps(file, role), expected, `${themeName} ${role}`);
      assert.match(file, new RegExp(`--hwio-type-${role}-weight: ${r.fontWeight};`));
      if (r.lineHeight !== undefined) assert.match(file, new RegExp(`--hwio-type-${role}-leading: ${r.lineHeight};`));
    }
  }
});

test('the HARDWARIO preset keeps the guidelines\' minimums (D12, D22, chapter 04)', () => {
  const r = presets.hwio.roles;
  const px = (rem) => parseFloat(rem) * 16;
  // The role follows the size: 28 pt (37.3 px) and up is display type (1.2), titles 1.3, text 1.4.
  // Checked at the base and at every step where the size or the line height changes.
  for (const [name, role] of Object.entries(r)) {
    if (role.lineHeight === undefined || name === 'button' || name === 'body' || name === 'lead') continue;
    let size = role.responsive?.base ?? role.fontSize;
    let leading = role.lineHeight;
    const check = (at) => {
      const min = px(size) >= 37.3 ? 1.2 : role.fontWeight >= 600 ? 1.3 : 1.4;
      assert.ok(leading >= min, `${name} ${at}: line height ${leading} at ${px(size)} px is below ${min}`);
    };
    check('base');
    for (const bp of BP) {
      if (role.responsive?.[bp]) size = role.responsive[bp];
      if (role.from === bp) size = role.fontSize;
      if (role.lineHeightSteps?.[bp] !== undefined) leading = role.lineHeightSteps[bp];
      check(bp);
    }
  }
  assert.ok(r.body.lineHeight >= 1.4 && r.lead.lineHeight >= 1.4);
  // Web H1 60-72 px Bold, H2 40-48 px and H3 28-32 px Semibold at the large steps.
  assert.deepEqual([px(r.display.responsive.lg), px(r.display.fontSize), r.display.fontWeight], [60, 72, 700]);
  assert.deepEqual([px(r.heading.responsive.lg), px(r.heading.fontSize), r.heading.fontWeight], [40, 48, 600]);
  assert.deepEqual([px(r.subheading.responsive.lg), px(r.subheading.fontSize), r.subheading.fontWeight], [28, 32, 600]);
  assert.equal(px(r.body.fontSize), 16);
  // Three weights, no Medium; Semibold only on H2 and H3.
  for (const [name, role] of Object.entries(r)) {
    assert.ok([400, 600, 700].includes(role.fontWeight), `${name}: weight ${role.fontWeight}`);
    if (role.fontWeight === 600) assert.ok(['heading', 'subheading'].includes(name), `${name}: Semibold outside H2/H3`);
  }
  for (const w of Object.values(presets.hwio.weights)) assert.ok([400, 700].includes(w));
  // Display tracking -1 to -2 %; kicker caps at 0.07 em.
  for (const name of ['display', 'heading', 'figure']) {
    const t = parseFloat(r[name].letterSpacing);
    assert.ok(t <= -0.01 && t >= -0.02, `${name}: tracking ${t}`);
  }
  assert.equal(r.kicker.textTransform, 'uppercase');
  assert.equal(r.kicker.letterSpacing, '0.07em');
  assert.ok(px(r.kicker.fontSize) >= 12 && px(r.kicker.fontSize) <= 14);
});

test('rhythm tokens match the section padding in styles.css (Tailwind --spacing = 4px)', () => {
  const px = (v) => parseInt(v, 10);
  const units = [...css.matchAll(/\.hwio-section \{ padding-block: calc\(var\(--spacing\) \* (\d+)\); \}/g)].map((m) => Number(m[1]) * 4);
  assert.deepEqual(units, [px(brand.rhythm.section.base), px(brand.rhythm.section.lg)]);
  const compact = [...css.matchAll(/\.hwio-section-compact \{ padding-block: calc\(var\(--spacing\) \* (\d+)\); \}/g)].map((m) => Number(m[1]) * 4);
  assert.deepEqual(compact, [px(brand.rhythm.sectionCompact.base), px(brand.rhythm.sectionCompact.lg)]);
  assert.match(css, /\.card \.card-body \{ --card-p: 2rem; \}/);
  assert.equal(brand.rhythm.cardPadding, '32px');
});

test('generated DESIGN.md files exist for every light theme and the root copy equals the default theme', () => {
  const dist = join(here, '../dist/design');
  for (const name of ['hwio', 'hwio-forestry', 'er3o']) assert.ok(existsSync(join(dist, `${name}.md`)), `${name}.md missing`);
  const hwio = readFileSync(join(dist, 'hwio.md'), 'utf8');
  assert.match(hwio, /^---\nname: "HARDWARIO"/);
  for (const h of ['## Overview', '## Colors', '## Typography', '## Layout', '## Elevation & Depth', '## Shapes', '## Components', "## Do's and Don'ts"]) assert.ok(hwio.includes(`\n${h}\n`), `${h} missing`);
  assert.match(hwio, /primary: "#016ad4"/);
  assert.match(hwio, /accent: "#e30427"/);
  assert.match(hwio, /The Gradient Rule/);
  assert.match(hwio, /The Brand Rule/);
  assert.equal(readFileSync(join(here, '../../../DESIGN.md'), 'utf8'), hwio);
  const forestry = readFileSync(join(dist, 'hwio-forestry.md'), 'utf8');
  assert.match(forestry, /primary: "#2B7036"/);
});
