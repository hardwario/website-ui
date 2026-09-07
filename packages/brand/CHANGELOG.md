# @hubpav/hwio-brand

## 0.6.6

## 0.6.5

### Patch Changes

- 2f034d1: `HWioHeader`: the current page's nav item is marked with a coloured label and a 2px bar on the header's bottom edge (`--hwio-nav-active`, default the primary colour; the `er3o` theme uses ENEROOO's blue `#296ea7`). Registry: the HARDWARIO LinkedIn link is `https://www.linkedin.com/company/hardwario/`.

## 0.6.4

## 0.6.3

### Patch Changes

- 9f0b548: Footer link hover colour is themed: `--hwio-footer-hover` (default the accent). The `er3o` theme sets white, because its accent is a dark teal that vanished on the graphite footer.

## 0.6.2

## 0.6.1

## 0.6.0

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
