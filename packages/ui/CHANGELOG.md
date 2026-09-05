# @hubpav/hwio-ui

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
