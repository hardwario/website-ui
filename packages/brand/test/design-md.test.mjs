import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const brand = JSON.parse(readFileSync(join(here, '../src/brand.json'), 'utf8'));
const css = readFileSync(join(here, '../../ui/src/styles/styles.css'), 'utf8');
const roles = brand.typography.roles;

// Every `sel { font-size: X; ... }` rule for a selector, in source order (base, then breakpoints).
const rules = (selector) => [...css.matchAll(new RegExp(`(?:^|[\\s,])${selector.replace('.', '\\.')}\\s*\\{([^}]*)\\}`, 'g'))].map((m) => Object.fromEntries([...m[1].matchAll(/([a-z-]+)\s*:\s*([^;]+);/g)].map((d) => [d[1], d[2].trim()])));

test('typography tokens in brand.json match the ramp implemented in hwio-ui styles.css', () => {
  const h1 = rules('h1').filter((r) => r['font-size']);
  assert.deepEqual(h1.map((r) => r['font-size']), [roles.display.responsive.base, roles.display.responsive.md, roles.display.fontSize]);
  assert.equal(h1[0]['line-height'], String(roles.display.lineHeight));
  assert.equal(h1[0]['letter-spacing'], roles.display.letterSpacing);
  const h2 = rules('h2').filter((r) => r['font-size']);
  assert.deepEqual(h2.map((r) => r['font-size']), [roles.heading.responsive.base, roles.heading.fontSize]);
  assert.equal(h2[0]['letter-spacing'], roles.heading.letterSpacing);
  assert.equal(rules('h3').find((r) => r['font-size'])['font-size'], roles.subheading.fontSize);
  assert.equal(rules('h4').find((r) => r['font-size'])['font-size'], roles.title.fontSize);
  const body = rules('body').find((r) => r['font-size']);
  assert.equal(body['font-size'], roles.body.fontSize);
  assert.equal(body['line-height'], String(roles.body.lineHeight));
  const lead = rules('.hwio-lead').find((r) => r['font-size']);
  assert.equal(lead['font-size'], roles.lead.fontSize);
  assert.equal(lead['line-height'], String(roles.lead.lineHeight));
  const kicker = rules('.hwio-eyebrow').find((r) => r['font-size']); // `.hwio-kicker,\n .hwio-eyebrow {` shares one block
  assert.equal(kicker['font-size'], roles.kicker.fontSize);
  assert.equal(kicker['font-weight'], String(roles.kicker.fontWeight));
  const btn = rules('.btn').find((r) => r['--fontsize']);
  assert.equal(btn['--fontsize'], roles.button.fontSize);
  assert.equal(btn['font-weight'], String(roles.button.fontWeight));
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
  assert.match(hwio, /primary: "#06367a"/);
  assert.match(hwio, /accent: "#e30427"/);
  assert.match(hwio, /The Fixed Four Rule/);
  assert.equal(readFileSync(join(here, '../../../DESIGN.md'), 'utf8'), hwio);
  const forestry = readFileSync(join(dist, 'hwio-forestry.md'), 'utf8');
  assert.match(forestry, /primary: "#2B7036"/);
});
