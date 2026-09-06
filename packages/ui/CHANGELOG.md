# @hubpav/hwio-ui

## 0.2.0

### Minor Changes

- 3bd781e: Owner ruling R10 (2026-09-06): the dark themes lift `primary` to the light brand blue (`#009cfa`) with dark content (6.5:1 on the night surfaces); `hwio-forestry-dark` likewise to `forestry-light`. Filled, outline and ghost primary buttons, badges and links are now legible in dark mode without per-variant overrides (the 0.1.5 outline rule is removed).

### Patch Changes

- Updated dependencies [3bd781e]
  - @hubpav/hwio-brand@0.2.0
  - @hubpav/hwio-web-runtime@0.2.0
  - @hubpav/hwio-web-worker@0.2.0

## 0.1.5

### Patch Changes

- ec10633: `.hwio-logo-grey` inverts in system dark mode too (previously only with an explicit dark data-theme).
- db6aa92: Dark themes: outline and ghost primary buttons use the light brand blue (navy text was unreadable on the night surfaces), in both the explicit-theme and system-preference cases.
  - @hubpav/hwio-brand@0.1.5
  - @hubpav/hwio-web-runtime@0.1.5
  - @hubpav/hwio-web-worker@0.1.5

## 0.1.4

### Patch Changes

- bf3b72c: `.hwio-btn-inverse` uses the neutral pair, so it stays light on dark surfaces in the dark theme too.
- 19cf0f0: HWioProcessSteps: optional `number` per item renders the copy's own ordinal ("01") instead of the index.
  - @hubpav/hwio-brand@0.1.4
  - @hubpav/hwio-web-runtime@0.1.4
  - @hubpav/hwio-web-worker@0.1.4

## 0.1.3

### Patch Changes

- e035e63: HWioHeader: the desktop nav never wraps (nowrap, tighter item spacing).
- d66fd46: HWioLanguageSwitcher: pills show the language code (label as title/aria-label); dropdown items show code and name.
  - @hubpav/hwio-brand@0.1.3
  - @hubpav/hwio-web-runtime@0.1.3
  - @hubpav/hwio-web-worker@0.1.3

## 0.1.2

### Patch Changes

- 99232a8: HWioStatsBand supports five items in one row.
  - @hubpav/hwio-brand@0.1.2
  - @hubpav/hwio-web-runtime@0.1.2
  - @hubpav/hwio-web-worker@0.1.2

## 0.1.1

### Patch Changes

- a3545be: `.container` is an unlayered rule so the theme width (`--hwio-container`) beats Tailwind's breakpoint caps on every viewport.
- c5a5e2a: HWioFooter and HWioFooterSites set their link colours explicitly instead of inheriting, so a site-wide anchor colour rule cannot turn the footer red.
- 1906d63: Type declaration for the `hwioUi()` integration entry (`@hubpav/hwio-ui/integration`).
  - @hubpav/hwio-brand@0.1.1
  - @hubpav/hwio-web-runtime@0.1.1
  - @hubpav/hwio-web-worker@0.1.1

## 0.1.0

### Minor Changes

- 070b713: First release of the HARDWARIO web design system (direction A, owner rulings R1 to R9 of 2026-09-05): brand tokens and generated DaisyUI themes (`hwio`, `hwio-dark`, `hwio-forestry`, `er3o`), the Tailwind 4 entry stylesheet, thirty `HWio*` Astro components, the framework-free web runtime (consent with Consent Mode v2 and legacy-cookie migration, HubSpot forms with Turnstile, attribution, theme, tracking, behaviours) and the Cloudflare Worker handler with the `_headers` builder. Pre-1.0: the component API may still change between minors.

### Patch Changes

- Updated dependencies [070b713]
  - @hubpav/hwio-brand@0.1.0
  - @hubpav/hwio-web-runtime@0.1.0
  - @hubpav/hwio-web-worker@0.1.0
