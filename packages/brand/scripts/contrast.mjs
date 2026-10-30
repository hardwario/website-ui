// WCAG 2 contrast of every text/background pair the themes produce, computed from the resolved
// tokens (dist/tokens.json). `node scripts/contrast.mjs` prints a Markdown table; the test
// test/contrast.test.mjs fails on any pair below its requirement that is not listed in ACCEPTED.
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

const rgb = (hex) => [0, 2, 4].map((i) => parseInt(hex.replace('#', '').slice(i, i + 2), 16));
const lin = (c) => { const s = c / 255; return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
const luminance = (hex) => { const [r, g, b] = rgb(hex).map(lin); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
export const ratio = (fg, bg) => { const [a, b] = [luminance(fg), luminance(bg)].sort((x, y) => y - x); return (a + 0.05) / (b + 0.05); };
// Text at `alpha` over its ground, mixed in sRGB (opacity and the /80-style utilities).
export const over = (fg, bg, alpha) => '#' + rgb(fg).map((v, i) => Math.round(v * alpha + rgb(bg)[i] * (1 - alpha)).toString(16).padStart(2, '0')).join('');
const isHex = (v) => typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v);

// [label, foreground, background, required ratio]. 4.5 = text, 3 = large text or non-text (icons,
// focus rings, chart marks). Roles come from the DaisyUI slots, extras from the --hwio-* variables.
export function pairs(t) {
  const r = t.roles;
  const x = (k, fallback) => (isHex(t.extras[k]) ? t.extras[k] : fallback);
  const secondary = x('--hwio-text-secondary', over(r['base-content'], r['base-100'], 0.72));
  const out = [
    ['text on page', r['base-content'], r['base-100'], 4.5],
    ['text on alt section / card (base-200)', r['base-content'], r['base-200'], 4.5],
    ['secondary text on page', secondary, r['base-100'], 4.5],
    ['secondary text on base-200', secondary, r['base-200'], 4.5],
    ['filled primary button', r['primary-content'], r['primary'], 4.5],
    ['outline primary button / primary text on page', r['primary'], r['base-100'], 4.5],
    ['primary text on base-200', r['primary'], r['base-200'], 4.5],
    ['secondary badge / button', r['secondary-content'], r['secondary'], 4.5],
    ['focus ring (secondary) on page', r['secondary'], r['base-100'], 3],
    ['kicker / accent text on page', r['accent'], r['base-100'], 4.5],
    ['kicker on alt section (base-200)', x('--hwio-kicker-on-alt', r['accent']), r['base-200'], 4.5],
    ['accent badge', r['accent-content'], r['accent'], 4.5],
    ['text on neutral panel / footer', r['neutral-content'], r['neutral'], 4.5],
    ['footer links (neutral-content at 80 %)', over(r['neutral-content'], r['neutral'], 0.8), r['neutral'], 4.5],
    ['secondary text on neutral', x('--hwio-text-secondary-on-neutral', over(r['neutral-content'], r['neutral'], 0.75)), r['neutral'], 4.5],
    ['kicker on neutral', x('--hwio-kicker-on-neutral', r['accent']), r['neutral'], 4.5],
    ['footer link hover', x('--hwio-footer-hover', r['accent']), r['neutral'], 4.5],
    ['inverse button on neutral', r['neutral'], r['neutral-content'], 4.5],
    ['info alert / badge', r['info-content'], r['info'], 4.5],
    ['success alert / badge', r['success-content'], r['success'], 4.5],
    ['warning alert / badge', r['warning-content'], r['warning'], 4.5],
    ['error alert / badge', r['error-content'], r['error'], 4.5],
    ['form success text on page', r['success'], r['base-100'], 4.5],
    ['form error text on page', r['error'], r['base-100'], 4.5],
    ['link on page', x('--hwio-link', r['primary']), r['base-100'], 4.5],
    ['link on base-200', x('--hwio-link', r['primary']), r['base-200'], 4.5],
    ['link hover on page', x('--hwio-link-hover', r['primary']), r['base-100'], 4.5],
    ['nav hover on page', x('--hwio-nav-hover', r['accent']), r['base-100'], 4.5],
    ['icon on page (non-text)', x('--hwio-icon', r['accent']), r['base-100'], 3],
    ['icon on its tile (base-200, non-text)', x('--hwio-icon', r['accent']), r['base-200'], 3],
  ];
  if (t.guidelines) {
    const [g0, g1] = t.extras['--hwio-gradient'].match(/#[0-9a-f]{6}/gi);
    const [f0, f1] = t.extras['--hwio-gradient-figure'].match(/#[0-9a-f]{6}/gi);
    // The darkest or lightest point along a gradient decides: sample it in sRGB, as the browser draws it.
    const worst = (from, to, upTo, fgOrBg, side) => {
      let min = Infinity, at = from;
      for (let i = 0; i <= 100; i++) {
        const c = over(to, from, (i / 100) * upTo);
        const v = side === 'fg' ? ratio(c, fgOrBg) : ratio(fgOrBg, c);
        if (v < min) { min = v; at = c; }
      }
      return at;
    };
    out.push(
      ['white on the gradient, left three quarters (chapter 03)', '#ffffff', worst(g0, g1, 0.75, '#ffffff', 'bg'), 4.5],
      // The key figure is 28 pt and up (large text, 3:1); D23 keeps 4.5:1 on white.
      ['gradient figure, weakest point, on page', worst(f0, f1, 1, r['base-100'], 'fg'), r['base-100'], t.scheme === 'light' ? 4.5 : 3],
      // A series mark counts by its edge: an unlabelled Sky mark on white carries a 1 px Blue outline
      // (D44), so its outline faces the page; every other mark faces the page with its own fill.
      ...[1, 2, 3].map((i) => {
        const fill = t.extras[`--hwio-chart-${i}`];
        const outlined = t.extras['--hwio-chart-outline-width'] !== '0px' && fill.toLowerCase() === '#009cfa';
        return [`chart series ${i} mark on page (non-text${outlined ? ', 1 px outline' : ''})`, outlined ? t.extras['--hwio-chart-outline'] : fill, r['base-100'], 3];
      }),
      ['chart highlight on page (bold text)', t.extras['--hwio-chart-highlight'], r['base-100'], 4.5],
      ['chart direct label on page', t.extras['--hwio-chart-label'], r['base-100'], 4.5],
      ['chart failure on page (non-text)', t.extras['--hwio-chart-failure'], r['base-100'], 3],
    );
  }
  return out.map(([label, fg, bg, need]) => ({ label, fg, bg, need, ratio: ratio(fg, bg) }));
}

// Pairs below their requirement that are known and accepted, with the decision behind each.
export const ACCEPTED = {
  hwio: {
    'warning alert / badge': 'Amber is never a ground for text (chapter 03); status messages sit on the 12 % tint (D34)',
  },
  'hwio-forestry': {
    'warning alert / badge': 'Amber is never a ground for text (chapter 03); status messages sit on the 12 % tint (D34)',
  },
  er3o: {
    'filled primary button': 'R7: ENEROOO keeps its teal; the filled button carries the er3o gradient (unchanged, PLAN 4.7)',
    'outline primary button / primary text on page': 'R7: the er3o outline button reads in its AA accent teal (theme rule), unchanged',
    'primary text on base-200': 'R7: unchanged ENEROOO theme (PLAN 4.7)',
    'focus ring (secondary) on page': 'R7: unchanged ENEROOO theme (PLAN 4.7)',
    'link hover on page': 'R7: unchanged ENEROOO theme (PLAN 4.7)',
  },
};

export function report(tokens) {
  return Object.values(tokens.themes).map((t) => ({ theme: t.name, rows: pairs(t) }));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const tokens = JSON.parse(readFileSync(join(here, '../dist/tokens.json'), 'utf8'));
  const onlyFailing = process.argv.includes('--failing');
  for (const { theme, rows } of report(tokens)) {
    const shown = onlyFailing ? rows.filter((p) => p.ratio < p.need) : rows;
    if (!shown.length) continue;
    console.log(`\n### ${theme}\n\n| Pair | Foreground | Background | Ratio | Needs |\n|---|---|---|---|---|`);
    for (const p of shown) console.log(`| ${p.label} | \`${p.fg}\` | \`${p.bg}\` | ${(Math.floor(p.ratio * 100) / 100).toFixed(2)}${p.ratio < p.need ? ' (fails)' : ''} | ${p.need} |`);
  }
}
