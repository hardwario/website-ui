# @hubpav/hwio-ui

## 0.6.2

### Patch Changes

- 1dbf42e: Theme `er3o`: the CTA gradient applies only to the filled `btn-primary`; outline, ghost and link variants keep a transparent background (the consent banner's "Odmítnout" was gradient-on-gradient), and the outline button uses the AA teal accent for text and border. `HWioCookieConsent`: the policy link is `link-accent` (AA on every theme; `link-secondary` was the 2.0:1 green on enerooo).
  - @hubpav/hwio-brand@0.6.2
  - @hubpav/hwio-web-runtime@0.6.2
  - @hubpav/hwio-web-worker@0.6.2

## 0.6.1

### Patch Changes

- 4dcc256: Accessibility: `HWioLanguageSwitcher`'s dropdown button names itself with visually hidden text ("Language: EN") instead of an `aria-label` that hid the visible code (WCAG 2.5.3); `HWioFormField` controls point at their legend with `aria-labelledby`, so every input, select and textarea has an accessible name.

  Contrast: kickers and eyebrows on neutral (dark) sections use the lighter rose `#fb7185` (5.6:1 on the neutral surface, 4.9:1 on its cards) instead of `#f43f5e`, which failed WCAG AA at 4.1:1 and 3.6:1.

  - @hubpav/hwio-brand@0.6.1
  - @hubpav/hwio-web-runtime@0.6.1
  - @hubpav/hwio-web-worker@0.6.1

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
- Updated dependencies [f5bc02d]
- Updated dependencies [36794e1]
  - @hubpav/hwio-web-runtime@0.6.0
  - @hubpav/hwio-brand@0.6.0
  - @hubpav/hwio-web-worker@0.6.0

## 0.5.0

### Minor Changes

- f1c41ff: Owner decision 2026-09-06: light is the default theme on every site regardless of the OS setting; dark applies only when the visitor chose it. The choice is remembered without a consent gate (a user-requested display preference): localStorage on every site and, where the site declares `themeCookieDomain` in `hwioHtmlAttrs`, a first-party `hwio_theme` cookie shared across that domain (www, docs, stem on .hardwario.com). The consent runtime no longer clears theme keys; `hwio-dark` no longer claims `prefersdark`; the system-scheme media twins are gone.

### Patch Changes

- 375ebe3: HWioHeader: one language control everywhere (the desktop dropdown; pills only inside the drawer). The `languageVariant` prop added in 0.4.0 is removed (owner rule: keep component variations to a minimum).
- Updated dependencies [f1c41ff]
  - @hubpav/hwio-web-runtime@0.5.0
  - @hubpav/hwio-brand@0.5.0
  - @hubpav/hwio-web-worker@0.5.0

## 0.4.0

### Patch Changes

- 0d4868c: HWioHeader `languageVariant` (inline pills for two-language sites); HWioPricingTiers `pricePrefix` and `period` around the amount; HWioFaq answers may be an array of paragraphs.
- e75d628: The theme bootstrap always stamps `data-theme` (stored choice, else the system scheme) so non-default DaisyUI themes such as `hwio-forestry` apply and dark rules match on the attribute alone; the runtime follows `prefers-color-scheme` changes when no choice is stored. Pricing badges stay on one line.
- Updated dependencies [e75d628]
  - @hubpav/hwio-web-runtime@0.4.0
  - @hubpav/hwio-brand@0.4.0
  - @hubpav/hwio-web-worker@0.4.0

## 0.3.0

### Minor Changes

- 48a2fa6: HWioHeader CTAs accept an `icon` and collapse to the icon alone below 2xl (label becomes the aria-label; the store button rule). HWioPricingTiers tiers take an `eyebrow`. HWioLogoStrip logos take a `size` step (xs to xl). HWioHeader takes `desktopFrom` (lg default, xl) so long navs keep the drawer up to 1279 px.

### Patch Changes

- @hubpav/hwio-brand@0.3.0
- @hubpav/hwio-web-runtime@0.3.0
- @hubpav/hwio-web-worker@0.3.0

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
