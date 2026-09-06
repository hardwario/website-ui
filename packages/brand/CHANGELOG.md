# @hubpav/hwio-brand

## 0.5.0

### Minor Changes

- f1c41ff: Owner decision 2026-09-06: light is the default theme on every site regardless of the OS setting; dark applies only when the visitor chose it. The choice is remembered without a consent gate (a user-requested display preference): localStorage on every site and, where the site declares `themeCookieDomain` in `hwioHtmlAttrs`, a first-party `hwio_theme` cookie shared across that domain (www, docs, stem on .hardwario.com). The consent runtime no longer clears theme keys; `hwio-dark` no longer claims `prefersdark`; the system-scheme media twins are gone.

## 0.4.0

## 0.3.0

## 0.2.0

### Minor Changes

- 3bd781e: Owner ruling R10 (2026-09-06): the dark themes lift `primary` to the light brand blue (`#009cfa`) with dark content (6.5:1 on the night surfaces); `hwio-forestry-dark` likewise to `forestry-light`. Filled, outline and ghost primary buttons, badges and links are now legible in dark mode without per-variant overrides (the 0.1.5 outline rule is removed).

## 0.1.5

## 0.1.4

## 0.1.3

## 0.1.2

## 0.1.1

## 0.1.0

### Minor Changes

- 070b713: First release of the HARDWARIO web design system (direction A, owner rulings R1 to R9 of 2026-09-05): brand tokens and generated DaisyUI themes (`hwio`, `hwio-dark`, `hwio-forestry`, `er3o`), the Tailwind 4 entry stylesheet, thirty `HWio*` Astro components, the framework-free web runtime (consent with Consent Mode v2 and legacy-cookie migration, HubSpot forms with Turnstile, attribution, theme, tracking, behaviours) and the Cloudflare Worker handler with the `_headers` builder. Pre-1.0: the component API may still change between minors.
