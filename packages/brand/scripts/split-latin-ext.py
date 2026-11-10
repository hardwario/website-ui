# /// script
# dependencies = ["fonttools==4.60.1", "brotli"]
# ///
"""Splits Inter's Latin Extended face in two, without touching a single outline.

Why: owner ruling R3 keeps a page's text invisible until its faces have decoded, and every page
preloads and waits for the Latin Extended face. The Google Fonts subset it came from is 85 kB and
holds 733 code points (IPA, Vietnamese, phonetic extensions, rare currency signs); the sites use 31 of
them, all in Latin Extended-A (Czech, Slovak, Polish, German, Hungarian and their neighbours).

  fonts/inter-latin-ext.woff2       U+0100-017F plus the combining marks: about 19 kB, preloaded and gated
  fonts/inter-latin-ext-rest.woff2  everything else of the old file: about 80 kB, fetched only by a page
                                    that shows such a glyph

Both hold the glyphs, variations and layout rules of the source file, regrouped. Two things are kept
on purpose, because Chrome on macOS renders small text differently without them (found 2026-11-10 by
comparing screenshots: anti-aliasing of every extended glyph changed at 7 of 12 sizes):

  - the glyph names (`post` format 2), and
  - the unmapped base glyphs the source carries (A to Z, a to z, a digit, period, space): the
    rasterizer finds its reference glyphs for vertical alignment by name.

The font's bounding box and the few low code points of the source (space, A, no-break space) stay
too, so the files differ from the source only in which extended glyphs they hold.

Checked when this was introduced: for 44 Central European letters at 12 sizes and 8 weights, at
device pixel ratios 1, 2 and 3, the pair renders byte-identical to the source in Chromium and WebKit
on macOS; so do the glyphs of the rest face; advances of all 729 extended code points are identical
at weights 100, 400, 700 and 900. `catalog/tests/fonts.spec.ts` repeats the comparison in CI (Linux).

Run it only to regenerate the pair from a full Latin Extended subset (the 85 kB file is
catalog/tests/fixtures/inter-latin-ext-full.woff2, or a fresh `latin-ext` subset from Google Fonts):

  uv run packages/brand/scripts/split-latin-ext.py <source.woff2> packages/brand/fonts/inter-latin-ext.woff2 packages/brand/fonts/inter-latin-ext-rest.woff2
"""
import string
import sys
from fontTools.ttLib import TTFont
from fontTools import subset

SRC, OUT_CRITICAL, OUT_REST = sys.argv[1:4]
MARKS = {0x0304, 0x0308, 0x0329}  # combining marks, listed in the Latin and the Latin Extended range alike
BASE_NAMES = set(string.ascii_letters) | {
    "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
    "space", "period", "comma", "hyphen", ".null",
}


def load():
    # recalcBBoxes=False: the font-wide bounding box and extents stay the source's.
    font = TTFont(SRC, lazy=False, recalcTimestamp=False, recalcBBoxes=False)
    gvar = font["gvar"]
    variations = {}
    for glyph in font.getGlyphOrder():
        try:
            variations[glyph] = gvar.variations[glyph]
        except KeyError:  # a glyph without deltas has no entry in the Google subset; the subsetter expects one
            variations[glyph] = []
    variations.setdefault(".notdef", [])
    gvar.variations = variations
    return font


def write(unicodes, out):
    font = load()
    base = [glyph for glyph in font.getGlyphOrder() if glyph in BASE_NAMES]
    options = subset.Options()
    options.layout_features = ["*"]
    options.name_IDs = ["*"]
    options.name_languages = ["*"]
    options.notdef_outline = True
    options.glyph_names = True  # keep `post` format 2: see the note above
    options.hinting = True
    options.legacy_kern = True
    subsetter = subset.Subsetter(options)
    subsetter.populate(unicodes=sorted(unicodes), glyphs=base)
    subsetter.subset(font)
    font.flavor = "woff2"
    font.save(out)
    return len(font.getBestCmap()), font["maxp"].numGlyphs, len(base)


cmap = set(load().getBestCmap())
low = {c for c in cmap if c < 0x0100}
critical = low | {c for c in cmap if 0x0100 <= c <= 0x017F} | (cmap & MARKS)
rest = low | {c for c in cmap if c > 0x017F} | (cmap & MARKS)
print("source code points:", len(cmap))
print("critical (code points, glyphs, base glyphs kept):", write(critical, OUT_CRITICAL))
print("rest (code points, glyphs, base glyphs kept):", write(rest, OUT_REST))
