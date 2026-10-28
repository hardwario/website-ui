---
"@hubpav/hwio-ui": patch
---

`HWioHeader` takes `navDensity="tight"` (with `desktopFrom="xl"`): from 1280 to 1535 px, where the container is still 1280 px wide while the full nav and CTAs show, nav labels drop from 15 to 14 px and item padding from 12 to 8 px, and the current-page bar follows the padding. Long SK/PL/CS navs then fit without sideways scroll. The default (`'default'`) renders exactly as before; the stylesheet gains one inert `@media` rule.
