---
"@hubpav/hwio-ui": patch
---

HWioButton: an external link always shows the external glyph. Before, `arrow` suppressed it, so a primary call to action that opens a new tab (academy's "Book meeting", and HWioCtaBand, HWioHeroSplit or HWioChoiceCards with an external lead button) gave no sign of it. The glyph now takes the arrow's place; `externalIcon={false}` still turns it off.
