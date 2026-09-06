---
"@hubpav/hwio-ui": patch
---

Accessibility: `HWioLanguageSwitcher`'s dropdown button names itself with visually hidden text ("Language: EN") instead of an `aria-label` that hid the visible code (WCAG 2.5.3); `HWioFormField` controls point at their legend with `aria-labelledby`, so every input, select and textarea has an accessible name.

Contrast: kickers and eyebrows on neutral (dark) sections use the lighter rose `#fb7185` (5.6:1 on the neutral surface, 4.9:1 on its cards) instead of `#f43f5e`, which failed WCAG AA at 4.1:1 and 3.6:1.
