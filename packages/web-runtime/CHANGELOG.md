# @hubpav/hwio-web-runtime

## 0.6.1

## 0.6.0

### Minor Changes

- f5bc02d: `HWioHeader` mega items: the `mega:<key>` slot now opens as a full-width panel under the bar (hover with intent on pointer devices, click, ArrowDown into the panel; Escape, outside click and focus leaving close it; one panel at a time), driven by the nav runtime. A mega item's `children` render as a collapsible group in the drawer, where the panel is not shown; a child's optional `description` is a second, muted line. The former anchored dropdown is gone.

### Patch Changes

- 36794e1: - `hwioUi()` copies only the font families the site uses into `/fonts` (`fonts` option, default `['inter']`); the Poppins files no longer ship with every HARDWARIO site.
  - A form whose Turnstile widget produced no token (blocked script, unsupported browser, timeout) shows the error status and does not send the request; `HWioHubSpotForm` accepts an optional `labels.turnstile` message for it.
  - `HWioContactSection`: the phone number never breaks across lines on narrow screens.
  - Registry: hardwario.engineering carries the cross-site footer strip again (owner lifted the 2026-07-19 exemption on 2026-09-06).
  - `HWioIcon`: `facebook` (enerooo's footer).
  - Theme `er3o`: `neutral` is the ENEROOO footer graphite `#404040` (the production footer's black at 75 percent over white), owner ruling 2026-09-06.

## 0.5.0

### Minor Changes

- f1c41ff: Owner decision 2026-09-06: light is the default theme on every site regardless of the OS setting; dark applies only when the visitor chose it. The choice is remembered without a consent gate (a user-requested display preference): localStorage on every site and, where the site declares `themeCookieDomain` in `hwioHtmlAttrs`, a first-party `hwio_theme` cookie shared across that domain (www, docs, stem on .hardwario.com). The consent runtime no longer clears theme keys; `hwio-dark` no longer claims `prefersdark`; the system-scheme media twins are gone.

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
