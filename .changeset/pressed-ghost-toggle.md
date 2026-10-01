---
"@hubpav/hwio-ui": patch
"@hubpav/hwio-brand": patch
"@hubpav/hwio-web-runtime": patch
"@hubpav/hwio-web-worker": patch
---

`@hubpav/hwio-ui`: DaisyUI 5.7.47 (0.7.2) fills pressed buttons, so `HWioThemeToggle` (a ghost button with `aria-pressed="true"` in dark mode) showed a filled square on every site's dark theme. Ghost buttons with `aria-pressed` or `aria-checked` keep the transparent ground at rest again; hover and focus tint them as before (computed backgrounds now match DaisyUI 5.7.28 in all four states on `hwio`, `hwio-dark` and `er3o`).
