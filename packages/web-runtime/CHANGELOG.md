# @hubpav/hwio-web-runtime

## 0.4.0

### Minor Changes

- e75d628: The theme bootstrap always stamps `data-theme` (stored choice, else the system scheme) so non-default DaisyUI themes such as `hwio-forestry` apply and dark rules match on the attribute alone; the runtime follows `prefers-color-scheme` changes when no choice is stored. Pricing badges stay on one line.

## 0.3.0

## 0.2.0

## 0.1.5

## 0.1.4

## 0.1.3

## 0.1.2

## 0.1.1

## 0.1.0

### Minor Changes

- 070b713: First release of the HARDWARIO web design system (direction A, owner rulings R1 to R9 of 2026-09-05): brand tokens and generated DaisyUI themes (`hwio`, `hwio-dark`, `hwio-forestry`, `er3o`), the Tailwind 4 entry stylesheet, thirty `HWio*` Astro components, the framework-free web runtime (consent with Consent Mode v2 and legacy-cookie migration, HubSpot forms with Turnstile, attribution, theme, tracking, behaviours) and the Cloudflare Worker handler with the `_headers` builder. Pre-1.0: the component API may still change between minors.
