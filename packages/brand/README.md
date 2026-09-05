# @hubpav/hwio-brand

HARDWARIO brand source of truth: `src/brand.json` holds the palette, theme roles (DaisyUI
slots), shape tokens, fonts, layout presets, the sites registry and the footer-strip rules.
`npm run build` generates `dist/tokens.json`, `dist/vars.css` (plain `--hwio-*` custom
properties), `dist/docusaurus.css` (`--ifm-*` mapping), `dist/fonts/*.css` with the woff2
files, and `dist/sites.js` (registry + `hwioFooterSites()`). Zero runtime dependencies.
