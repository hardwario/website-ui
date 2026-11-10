import { test, expect, type Browser } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// The Latin Extended face a page waits for is a regrouping of the full Google Fonts subset
// (packages/brand/scripts/split-latin-ext.py): Latin Extended-A in the preloaded file, the rest in
// a file a page fetches on demand. It must render exactly like the full subset. A plain subset does
// not: without the glyph names and the base glyphs Chrome on macOS anti-aliases small text
// differently. This compares the pair with the full file, glyph by glyph, in this browser.

const file = (path: string) => readFileSync(fileURLToPath(new URL(path, import.meta.url))).toString('base64');
const LATIN = "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD";
const FULL = 'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF';
const CRITICAL = 'U+0100-017F, U+0304, U+0308, U+0329';
const REST = 'U+0180-02AF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF';
const face = (data: string, range: string) => `@font-face{font-family:'Inter';font-weight:100 900;font-display:block;src:url(data:font/woff2;base64,${data}) format('woff2-variations');unicode-range:${range}}`;

const latin = face(file('../../packages/brand/fonts/inter-latin.woff2'), LATIN);
const before = [latin, face(file('./fixtures/inter-latin-ext-full.woff2'), FULL)].join('');
const after = [latin, face(file('../../packages/brand/fonts/inter-latin-ext.woff2'), CRITICAL), face(file('../../packages/brand/fonts/inter-latin-ext-rest.woff2'), REST)].join('');

const LETTERS = 'ąćęłńśźżĄĆĘŁŃŚŹŻěščřžůďťňĚŠČŘŽŮĎŤŇĺľŕĹĽŔőűŐŰ';
const RARE = 'ǎǐǒǔșțȘȚẞẀẂỲỳệễɛɔʃəǄǅǆ†₽₿ℓ';
const SIZES = [12, 13, 14, 15, 16, 17, 18, 20, 24, 32];
const WEIGHTS = [400, 500, 600, 700];
const CELL = 40;

function sheet(faces: string, weight: number) {
  const row = (text: string, size: number) => `<div style="font-size:${size}px">${[...text].map((c) => `<span>${c}</span>`).join('')}</div>`;
  const rows = SIZES.map((size) => row(LETTERS, size) + row(RARE, size) + `<p style="font-size:${size}px">Zażółć gęślą jaźń. Příliš žluťoučký kůň úpěl ďábelské ódy. Vŕba, ľalia, dĺžka. Árvíztűrő tükörfúrógép.</p>`).join('');
  return `<!doctype html><meta charset="utf-8"><style>${faces}body{margin:0;font-family:'Inter',serif;font-weight:${weight};width:${CELL * LETTERS.length}px}span{display:inline-block;width:${CELL}px;height:${CELL}px;line-height:${CELL}px;text-align:center;vertical-align:top}div{white-space:nowrap}p{margin:0 0 0 3.3px;line-height:1.5;white-space:nowrap}</style>${rows}`;
}

async function render(browser: Browser, deviceScaleFactor: number, faces: string, weight: number) {
  const context = await browser.newContext({ viewport: { width: CELL * LETTERS.length, height: 600 }, deviceScaleFactor });
  const page = await context.newPage();
  await page.setContent(sheet(faces, weight));
  await page.evaluate(() => Promise.all([...document.fonts].map((f) => f.load())));
  const loaded = await page.evaluate(() => [...document.fonts].every((f) => f.status === 'loaded'));
  const shot = await page.screenshot({ fullPage: true });
  await context.close();
  return { shot, loaded };
}

for (const deviceScaleFactor of [1, 2, 3]) {
  test(`the split Latin Extended faces render like the full subset at ${deviceScaleFactor}x`, async ({ browser }) => {
    for (const weight of WEIGHTS) {
      const full = await render(browser, deviceScaleFactor, before, weight);
      const split = await render(browser, deviceScaleFactor, after, weight);
      expect(full.loaded && split.loaded, 'every face loaded').toBe(true);
      expect(split.shot.equals(full.shot), `weight ${weight}: ${SIZES.length} sizes of ${LETTERS.length + RARE.length} glyphs and a sentence`).toBe(true);
    }
  });
}

test('the comparison can tell a different face apart', async ({ browser }) => {
  const full = await render(browser, 1, before, 400);
  const latinOnly = await render(browser, 1, latin, 400);
  expect(latinOnly.shot.equals(full.shot)).toBe(false);
});
