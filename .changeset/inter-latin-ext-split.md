---
'@hubpav/hwio-brand': patch
---

Inter: the Latin Extended face a page preloads and waits for is 16 kB instead of 85 kB. `inter-latin-ext.woff2` now holds Latin Extended-A (U+0100-017F: every Czech, Slovak, Polish, German and Hungarian letter; the sites use 31 code points of the old file's 733, all in this block), and the rest of the old file is a third face, `inter-latin-ext-rest.woff2`, that only a page showing such a glyph fetches. The glyphs, variations and layout rules are the old file's, regrouped (`scripts/split-latin-ext.py`): advances of all 733 code points are identical at four weights and text renders pixel-identical. Sites keep their preload list and Early Hints as they are (same two file names); the integration copies the third file by its `inter-` prefix. A site with its own `@font-face` rules (www) declares the third face itself.
