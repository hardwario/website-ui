---
"@hubpav/hwio-ui": patch
---

`hwioUi()` limits Tailwind's scan of the package components to the ones the site imports (directly, through another component, from a local workspace package, or under the entry stylesheet's own `@source` directories), so pages no longer carry DaisyUI and utility rules for components they never render. Per-page CSS shrinks by 0.3–2.9 KB gzipped (3–22 KB raw) on the current sites. It falls back to scanning every component when it finds no import or an import path it cannot read literally; `hwioUi({ componentCss: 'all' })` turns it off.
