# /// script
# dependencies = ["fonttools==4.60.1", "brotli"]
# ///
"""Adds code points to Inter's Latin face from the full Inter file of the same build.

Why: the Google Fonts `latin` subset holds 230 code points, and the sites' copy uses five more, which
a browser then sets in a system font in the middle of an Inter line (found 2026-11-10):

  U+2011  non-breaking hyphen   "1‑Wire", "Wi‑Fi", "DIN‑rail"
  U+2192  rightwards arrow      "→" in links and steps
  U+2197  north-east arrow      "↗" on external links
  U+2082  subscript two         "CO₂"
  U+03BC  Greek small mu        "μA" (the micro sign U+00B5 is in the subset already)

No Google Fonts subset holds the two arrows, the subscript or the hyphen, so they come from the full
variable file of the same build (google/fonts, ofl/inter/Inter[opsz,wght].ttf; the version string
must match the current face, the script refuses otherwise). The full file is cut the way the Google
subset was cut: the optical-size axis pinned at its default, the subset's own layout features and
name records, so everything the current face holds comes out the same. The script proves it before it
writes: outline, advance and side bearing of every glyph of the current face are compared at seven
weights, and the code points must map to the same glyphs.

Kept on purpose, as in split-latin-ext.py: the glyph names (`post` format 2). Chrome on macOS
anti-aliases small text differently without them. `catalog/tests/fonts.spec.ts` compares the new
face with the Google subset in a browser, byte for byte (fixture inter-latin-google.woff2).

Checked when this was introduced, besides the script's own proof: shaping of all 229 x 229 pairs of
the subset's code points at weights 100, 400, 700 and 900 (HarfBuzz: same glyphs, advances and
offsets, so kerning and the contextual rules are the same), and the feature runs for tnum, frac and
calt.

Run it only to add a code point (and then add it to the face's `unicodeRange` in src/brand.json):

  uv run packages/brand/scripts/extend-latin.py <Inter[opsz,wght].ttf> <current inter-latin.woff2> <out.woff2> [U+2011 U+2192 ...]
"""
import sys
from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

FULL, CURRENT, OUT = sys.argv[1:4]
EXTRA = [int(arg.removeprefix("U+"), 16) for arg in sys.argv[4:]] or [0x2011, 0x2192, 0x2197, 0x2082, 0x03BC]
WEIGHTS = [100, 250, 400, 500, 600, 700, 900]


def features(font):
    return sorted({record.FeatureTag for tag in ("GSUB", "GPOS") for record in font[tag].table.FeatureList.FeatureRecord})


def shape(font, name):
    glyph = font["glyf"][name]
    if glyph.isComposite():
        return ("composite", tuple((c.glyphName, c.x, c.y, c.flags, getattr(c, "transform", None) and tuple(map(tuple, c.transform))) for c in glyph.components))
    if glyph.numberOfContours == 0:
        return ("empty",)
    return ("simple", tuple(map(tuple, glyph.coordinates)), tuple(glyph.endPtsOfContours), bytes(glyph.flags))


def build():
    current = TTFont(CURRENT, lazy=False)
    full = TTFont(FULL, lazy=False, recalcTimestamp=False)
    version = current["name"].getDebugName(5)
    if full["name"].getDebugName(5) != version:
        sys.exit(f"not the same Inter build: the face is '{version}', the full file '{full['name'].getDebugName(5)}'")
    absent = [f"U+{c:04X}" for c in EXTRA if c not in full.getBestCmap()]
    if absent:
        sys.exit(f"the full file has no glyph for {' '.join(absent)}")

    # Google's weight-only files have the optical size pinned at its default (14).
    full = instancer.instantiateVariableFont(full, {"opsz": None}, inplace=False)
    gvar = full["gvar"]
    variations = {}
    for glyph in full.getGlyphOrder():
        try:
            variations[glyph] = gvar.variations[glyph]
        except KeyError:  # a glyph without deltas has no entry; the subsetter expects one
            variations[glyph] = []
    gvar.variations = variations

    options = subset.Options()
    options.layout_features = features(current)  # the subset's own list: more would pull in alternates no site uses
    options.name_IDs = sorted({record.nameID for record in current["name"].names})
    options.name_languages = ["*"]
    options.notdef_outline = True
    options.glyph_names = True  # keep `post` format 2: see the note above
    options.hinting = True
    options.legacy_kern = True
    options.recalc_timestamp = False
    subsetter = subset.Subsetter(options)
    subsetter.populate(unicodes=sorted(set(current.getBestCmap()) | set(EXTRA)))
    subsetter.subset(full)
    if "prep" not in current and "prep" in full:
        del full["prep"]  # the Google download carries none; a fontsource copy does, and keeps it
    full.flavor = "woff2"
    full.save(OUT)
    return current


def prove(current):
    new = TTFont(OUT, lazy=False)
    old_cmap, new_cmap = current.getBestCmap(), new.getBestCmap()
    names = current.getGlyphOrder()
    problems = []
    lost = sorted(set(names) - set(new.getGlyphOrder()))
    if lost:
        sys.exit(f"glyphs of the current face missing from the new one: {lost}")
    problems += [f"U+{c:04X} maps to {new_cmap.get(c)}, was {g}" for c, g in old_cmap.items() if new_cmap.get(c) != g]
    problems += [f"U+{c:04X} is not in the new face" for c in EXTRA if c not in new_cmap]
    if features(new) != features(current):
        problems.append(f"layout features differ: {features(new)} against {features(current)}")
    for weight in WEIGHTS:
        a = instancer.instantiateVariableFont(TTFont(CURRENT), {"wght": weight})
        b = instancer.instantiateVariableFont(TTFont(OUT), {"wght": weight})
        problems += [f"outline of {g} differs at weight {weight}" for g in names if shape(a, g) != shape(b, g)]
        problems += [f"advance or side bearing of {g} differs at weight {weight}" for g in names if a["hmtx"][g] != b["hmtx"][g]]
    for table, keys in (
        ("hhea", ["ascent", "descent", "lineGap"]),
        ("OS/2", ["sTypoAscender", "sTypoDescender", "sTypoLineGap", "usWinAscent", "usWinDescent", "sxHeight", "sCapHeight", "fsSelection"]),
        ("head", ["unitsPerEm", "macStyle", "flags", "modified"]),
        ("post", ["formatType", "underlinePosition", "underlineThickness"]),
    ):
        problems += [f"{table}.{key}: {getattr(new[table], key)}, was {getattr(current[table], key)}" for key in keys if getattr(new[table], key) != getattr(current[table], key)]
    if new["gasp"].gaspRange != current["gasp"].gaspRange or new["avar"].segments != current["avar"].segments:
        problems.append("gasp or avar differ")
    if ("prep" in new) != ("prep" in current):
        problems.append("`prep` came or went")
    box = lambda font: (font["head"].xMin, font["head"].yMin, font["head"].xMax, font["head"].yMax)
    print(f"current: {len(old_cmap)} code points, {len(names)} glyphs, bounding box {box(current)}")
    print(f"new:     {len(new_cmap)} code points, {new['maxp'].numGlyphs} glyphs, bounding box {box(new)}")
    print("added glyphs:", " ".join(sorted(set(new.getGlyphOrder()) - set(names))) or "none (the glyphs were there, only the code points are new)")
    print("added code points:", " ".join(f"U+{c:04X}={new_cmap[c]}" for c in sorted(set(new_cmap) - set(old_cmap))))
    if problems:
        print(f"{len(problems)} differences:")
        for problem in problems[:40]:
            print("  " + problem)
        sys.exit(1)
    print(f"every glyph of the current face is unchanged at weights {', '.join(map(str, WEIGHTS))}")


prove(build())
