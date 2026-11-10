# /// script
# dependencies = ["fonttools==4.60.1", "brotli"]
# ///
"""Splits Inter's Latin Extended face in two, without touching a single outline.

Why: owner ruling R3 keeps a page's text invisible until its faces have decoded, and every page
preloads and waits for the Latin Extended face. The Google Fonts subset it came from is 85 kB and
holds 733 code points (IPA, Vietnamese, phonetic extensions, rare currency signs); the sites use 31 of
them, all in Latin Extended-A (Czech, Slovak, Polish, German, Hungarian and their neighbours).

  fonts/inter-latin-ext.woff2       U+0100-017F plus the combining marks: about 16 kB, preloaded and gated
  fonts/inter-latin-ext-rest.woff2  everything else of the old file: about 78 kB, fetched only by a page
                                    that shows such a glyph

Both hold the glyphs, variations and layout rules of the source file, regrouped. Verified when this
was introduced (2026-11-10): the advance of all 733 code points is identical at weights 100, 400,
700 and 900, and 90 lines of text at five weights and three sizes render byte-identical screenshots.

Run it only to regenerate the pair from a full Latin Extended subset (the 85 kB file is in the Git
history of fonts/inter-latin-ext.woff2, or a fresh `latin-ext` subset from Google Fonts):

  uv run packages/brand/scripts/split-latin-ext.py <source.woff2> packages/brand/fonts/inter-latin-ext.woff2 packages/brand/fonts/inter-latin-ext-rest.woff2
"""
import sys
from fontTools.ttLib import TTFont
from fontTools import subset

SRC, OUT_CRITICAL, OUT_REST = sys.argv[1:4]
MARKS = {0x0304, 0x0308, 0x0329}  # combining marks, listed in the Latin and the Latin Extended range alike


def load():
    font = TTFont(SRC, lazy=False, recalcTimestamp=False)
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
    options = subset.Options()
    options.layout_features = ["*"]
    options.name_IDs = ["*"]
    options.name_languages = ["*"]
    options.notdef_outline = True
    options.glyph_names = False
    options.hinting = True
    options.legacy_kern = True
    subsetter = subset.Subsetter(options)
    subsetter.populate(unicodes=sorted(unicodes))
    subsetter.subset(font)
    font.flavor = "woff2"
    font.save(out)
    return len(font.getBestCmap()), font["maxp"].numGlyphs


cmap = set(load().getBestCmap())
critical = {c for c in cmap if 0x0100 <= c <= 0x017F} | (cmap & MARKS)
rest = {c for c in cmap if c > 0x017F} | (cmap & MARKS)
print("source code points:", len(cmap))
print("critical (code points, glyphs):", write(critical, OUT_CRITICAL))
print("rest (code points, glyphs):", write(rest, OUT_REST))
