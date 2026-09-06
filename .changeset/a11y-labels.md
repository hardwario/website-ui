---
"@hubpav/hwio-ui": patch
---

Accessibility: `HWioLanguageSwitcher`'s dropdown button names itself with visually hidden text ("Language: EN") instead of an `aria-label` that hid the visible code (WCAG 2.5.3); `HWioFormField` controls point at their legend with `aria-labelledby`, so every input, select and textarea has an accessible name.
