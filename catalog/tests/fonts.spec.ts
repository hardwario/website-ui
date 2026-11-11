import { test, expect, type Browser } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Two of Inter's faces are not the files Google Fonts serves, and both must render exactly like them.
//
// The Latin Extended face a page waits for is a regrouping of the full Google Fonts subset
// (packages/brand/scripts/split-latin-ext.py): Latin Extended-A in the preloaded file, the rest in
// a file a page fetches on demand. The Latin face is the Google Fonts subset plus five code points
// the copy uses: four cut from the full Inter file of the same build, and the non-breaking hyphen
// drawn with the keyboard hyphen's glyph (packages/brand/scripts/extend-latin.py).
// A plain subset does not render the same: without the glyph names and the base glyphs Chrome on
// macOS anti-aliases small text differently. So each is compared with the Google file, glyph by
// glyph, in this browser.

// One test at a time: the sheets are large captures at up to 3x, and the CI runner cannot take two
// at once ("Unable to capture screenshot").
test.describe.configure({ mode: 'default' });

const file = (path: string) => readFileSync(fileURLToPath(new URL(path, import.meta.url))).toString('base64');
const LATIN_GOOGLE = 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD';
const LATIN = 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+03BC, U+2000-206F, U+2074, U+2082, U+20AC, U+2122, U+2191-2193, U+2197, U+2212, U+2215, U+FEFF, U+FFFD';
const FULL = 'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF';
const CRITICAL = 'U+0100-017F, U+0304, U+0308, U+0329';
const REST = 'U+0180-02AF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF';
const face = (data: string, range: string) => `@font-face{font-family:'Inter';font-weight:100 900;font-display:block;src:url(data:font/woff2;base64,${data}) format('woff2-variations');unicode-range:${range}}`;

const latin = face(file('../../packages/brand/fonts/inter-latin.woff2'), LATIN);
const latinGoogle = face(file('./fixtures/inter-latin-google.woff2'), LATIN_GOOGLE);
const before = [latin, face(file('./fixtures/inter-latin-ext-full.woff2'), FULL)].join('');
const after = [latin, face(file('../../packages/brand/fonts/inter-latin-ext.woff2'), CRITICAL), face(file('../../packages/brand/fonts/inter-latin-ext-rest.woff2'), REST)].join('');

const LETTERS = 'ąćęłńśźżĄĆĘŁŃŚŹŻěščřžůďťňĚŠČŘŽŮĎŤŇĺľŕĹĽŔőűŐŰ';
const RARE = 'ǎǐǒǔșțȘȚẞẀẂỲỳệễɛɔʃəǄǅǆ†₽₿ℓ';
// Two sizes per sheet: a full-page capture of all ten at 3x is too large for the CI runner to take.
const SIZES = [[12, 13], [14, 15], [16, 17], [18, 20], [24, 32]];
const WEIGHTS = [400, 500, 600, 700];
const CELL = 40;
const COLUMNS = 22;

const escape = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const row = (text: string, size: number) => `<div style="font-size:${size}px">${[...text].map((c) => `<span>${escape(c)}</span>`).join('')}</div>`;
const extended = (size: number) => row(LETTERS, size) + row(RARE, size) + `<p style="font-size:${size}px">Zażółć gęślą jaźń. Příliš žluťoučký kůň úpěl ďábelské ódy. Vŕba, ľalia, dĺžka. Árvíztűrő tükörfúrógép.</p>`;

function sheet(faces: string, weight: number, sizes: number[], rows: (size: number) => string = extended) {
  return `<!doctype html><meta charset="utf-8"><style>${faces}body{margin:0;font-family:'Inter',serif;font-weight:${weight};width:${CELL * COLUMNS}px}span{display:inline-block;width:${CELL}px;height:${CELL}px;line-height:${CELL}px;text-align:center;vertical-align:top}p{margin:0 0 0 3.3px;line-height:1.5}</style>${sizes.map(rows).join('')}`;
}

async function render(browser: Browser, deviceScaleFactor: number, faces: string, weight: number, sizes: number[], rows?: (size: number) => string) {
  const context = await browser.newContext({ viewport: { width: CELL * COLUMNS, height: 600 }, deviceScaleFactor });
  const page = await context.newPage();
  await page.setContent(sheet(faces, weight, sizes, rows));
  await page.evaluate(() => Promise.all([...document.fonts].map((f) => f.load())));
  const loaded = await page.evaluate(() => [...document.fonts].every((f) => f.status === 'loaded'));
  const shot = await page.screenshot({ fullPage: true });
  await context.close();
  return { shot, loaded };
}

for (const deviceScaleFactor of [1, 2, 3]) {
  test(`the split Latin Extended faces render like the full subset at ${deviceScaleFactor}x`, async ({ browser }) => {
    for (const weight of WEIGHTS) {
      for (const sizes of SIZES) {
        const full = await render(browser, deviceScaleFactor, before, weight, sizes);
        const split = await render(browser, deviceScaleFactor, after, weight, sizes);
        expect(full.loaded && split.loaded, 'every face loaded').toBe(true);
        expect(split.shot.equals(full.shot), `weight ${weight}, ${sizes.join(' and ')} px: ${LETTERS.length + RARE.length} glyphs and a sentence`).toBe(true);
      }
    }
  });
}

test('the comparison can tell a different face apart', async ({ browser }) => {
  const full = await render(browser, 1, before, 400, SIZES[0]);
  const latinOnly = await render(browser, 1, latin, 400, SIZES[0]);
  expect(latinOnly.shot.equals(full.shot)).toBe(false);
});

// The Latin face: every visible code point of the Google subset, and running text with kerning,
// digits and punctuation, must come out as before; the five added ones must be Inter's.
const points = (ranges: number[][]) => ranges.flatMap(([from, to]) => Array.from({ length: to - from + 1 }, (_, i) => String.fromCodePoint(from + i))).join('');
const SUBSET = points([[0x21, 0x7e], [0xa1, 0xac], [0xae, 0xff], [0x131, 0x131], [0x152, 0x153], [0x2bb, 0x2bc], [0x2c6, 0x2c6], [0x2da, 0x2da], [0x2dc, 0x2dc], [0x2013, 0x2014], [0x2018, 0x201a], [0x201c, 0x201e], [0x2022, 0x2022], [0x2026, 0x2026], [0x2032, 0x2033], [0x2039, 0x203a], [0x2044, 0x2044], [0x20ac, 0x20ac], [0x2122, 0x2122], [0x2191, 0x2191], [0x2193, 0x2193], [0x2212, 0x2212]]);
const TEXT = 'AVATAR Töne «Yes», “To We”: low-power, 1-Wire, 0–26 V, 12:34, 1/2, 3 × 4 = 12, 100 %, (a+b) [c] {d} -> <- ↑↓ © ® ™ € £ ¥ § ¶ ¿Qué? ¡Sí! Straße, façade, naïve, Ærø, œuvre.';
const subset = (size: number) => row(SUBSET, size) + `<p style="font-size:${size}px">${escape(TEXT)}</p>`;

for (const deviceScaleFactor of [1, 2, 3]) {
  test(`the Latin face renders the Google subset's ${[...SUBSET].length} glyphs like the Google subset at ${deviceScaleFactor}x`, async ({ browser }) => {
    for (const weight of WEIGHTS) {
      for (const size of SIZES.flat()) {
        // One size per sheet: ten rows of glyphs are as tall as two sizes of the sheets above.
        const google = await render(browser, deviceScaleFactor, latinGoogle, weight, [size], subset);
        const ours = await render(browser, deviceScaleFactor, latin, weight, [size], subset);
        expect(google.loaded && ours.loaded, 'every face loaded').toBe(true);
        expect(ours.shot.equals(google.shot), `weight ${weight}, ${size} px`).toBe(true);
      }
    }
  });
}

// Advances in font units (2048 to the em) of the five added code points, read from the full Inter
// file: a system font that stood in for a missing glyph would not have all of them. Measured at
// 1024 px, where a pixel is two units: a browser that rounds advances to whole pixels (Chromium on
// Linux) stays within one unit.
const ADDED: [string, number, number][] = [
  ['\u2011', 942, 958], // non-breaking hyphen: the keyboard hyphen's glyph and advance, not Inter's own shorter hyphen (734, 929)
  ['\u2192', 1954, 1954], // →
  ['\u2197', 1588, 1603], // ↗
  ['\u2082', 905, 942], // ₂
  ['\u03bc', 1200, 1286], // Greek μ
];

async function advances(browser: Browser, faces: string, weight: number, family = "'Inter',serif") {
  const page = await browser.newPage();
  await page.setContent(`<!doctype html><meta charset="utf-8"><style>${faces}body{margin:0;font:${weight} 1024px ${family};font-kerning:none;white-space:nowrap}span{display:inline-block}</style>${ADDED.map(([c]) => `<span>${c}</span>`).join(' ')}`);
  await page.evaluate(() => Promise.all([...document.fonts].map((f) => f.load())));
  const widths = await page.evaluate(() => [...document.querySelectorAll('span')].map((s) => s.getBoundingClientRect().width * 2));
  await page.close();
  return widths;
}

test('the five added code points are set in Inter', async ({ browser }) => {
  for (const [weight, column] of [[400, 1], [700, 2]] as const) {
    const widths = await advances(browser, latin, weight);
    ADDED.forEach((entry, i) => expect(Math.abs(widths[i] - entry[column]), `U+${entry[0].codePointAt(0)!.toString(16)} at weight ${weight}: ${widths[i]} units, Inter's is ${entry[column]}`).toBeLessThan(2));
  }
  // The control: the measurement tells another font apart. A monospace family gives all five one
  // advance, which cannot be Inter's five. (Not "the Google subset with a fallback": a machine with
  // Inter installed, such as a designer's Mac, hands WebKit that Inter as the fallback.)
  const other = await advances(browser, '', 400, 'monospace');
  expect(ADDED.some((entry, i) => Math.abs(other[i] - entry[1]) >= 2)).toBe(true);
});
