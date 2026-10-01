# @hubpav/hwio-ui

## 0.7.2

### Patch Changes

- 4d16a18: CSP collector, GTM origins and DaisyUI 5.7.47 (found in the 2026-10-01 infrastructure review).

  - `@hubpav/hwio-web-worker`: the `/csp-report` collector cut every body to 8 KB before `JSON.parse`, so Chrome's batched Reporting API posts (`application/reports+json`, up to ~100 KB) were logged as `parse: failed` and lost. It now reads up to 256 KB, accepts both the Reporting API batch and the legacy `report-uri` body (`hwioParseCspReports`), merges identical violations with a count and logs one compact line per distinct violation (`kind: "csp-report"`, directive, blocked, document, source, line, column, disposition, sample, count, ua). URLs keep origin and path only, so query strings (form fields, click ids) never reach Workers Logs.
  - `@hubpav/hwio-web-worker`: the `gtm` CSP preset follows Google's tag CSP guide for GA4 with Ads features: `connect-src` adds `https://*.google.com` (covers `analytics.google.com/g/collect`, which `*.analytics.google.com` does not match), the country Google domains (`googleTlds`, default cz, sk, de, at, ch, pl; `www.google.<tld>/ads/ga-audiences`), `https://*.g.doubleclick.net` and `https://pagead2.googlesyndication.com`. Production reports showed both Google calls blocked.
  - `@hubpav/hwio-ui`: DaisyUI 5.7.28 to 5.7.47. DaisyUI now paints a menu link with `aria-current` like `.menu-active`; the header's current nav item (and the drawer row) keeps its own label colour and bar instead of a dark fill. Buttons with `aria-current` (the current pill in `HWioLanguageSwitcher`'s pills variant) take DaisyUI's pressed state, 5 % darker. Checkbox ticks are re-centred by DaisyUI.

- Updated dependencies [4d16a18]
  - @hubpav/hwio-web-worker@0.7.2
  - @hubpav/hwio-brand@0.7.2
  - @hubpav/hwio-web-runtime@0.7.2

## 0.7.1

### Patch Changes

- afdacd4: HWioHeader accessibility and reflow fixes (defects verified on www.hardwario.com, 2026-09-07). The drawer trigger and its close control are real buttons (`data-hwio-drawer-toggle`) instead of `label[role=button]`, so Enter and Space open and close the menu (WCAG 2.1.1); the nav runtime keeps `aria-expanded` in sync, moves focus to the panel's first control on open and back to the trigger on close, Escape closes, and the CSS-only checkbox leaves the tab order and the accessibility tree. Focusable items inside `.menu` (header nav, drawer, the language dropdown) get the system's 2 px `secondary` focus ring back, which DaisyUI had set to `outline-style: none` (WCAG 2.4.7). Below `sm` the bar hides the language dropdown (the drawer already carries the pills), so logo, theme toggle and the 48 px trigger fit a 320 px viewport with no horizontal overflow or clipped hamburger (WCAG 1.4.10).
- Updated dependencies [afdacd4]
  - @hubpav/hwio-web-runtime@0.7.1
  - @hubpav/hwio-brand@0.7.1
  - @hubpav/hwio-web-worker@0.7.1

## 0.7.0

### Minor Changes

- df685b7: Design context, preview deployments and an accessibility gate for the 2026 redesign program (owner rulings R13 to R16, website-admin `DESIGN-SYSTEM.md`).

  - `@hubpav/hwio-brand`: `typography` and `rhythm` token blocks mirror the ramp implemented in `hwio-ui/styles.css` (a test fails when they drift); `dist/design/<theme>.md` is a generated DESIGN.md (impeccable format) per light theme, exported as `@hubpav/hwio-brand/design/<theme>.md`; the repo root `DESIGN.md` is the `hwio` copy. Dark themes lift `secondary` to the light brand blue like `primary` (R10): prose links on the night ground were 3.7:1. The `er3o` theme gains `--hwio-link` (its text teal) and `--hwio-kicker-on-neutral` (its green) so link buttons, prose links and kickers on neutral panels clear AA.
  - `@hubpav/hwio-ui`: `.label` and inactive `.tab` text at 78 % of the text colour instead of DaisyUI's 60 and 50 % (R5, AA at 14 px); `.btn-link` and `.hwio-prose a` read `--hwio-link` with the previous roles as fallback.
  - `@hubpav/hwio-web-worker`: `hwioWorker` treats `*.workers.dev` hosts (`previewHosts`) as preview deployments: no canonical-host redirect there and `X-Robots-Tag: noindex, nofollow` on every response. `hwioRenderHeadersFile({ previewNoindex: true })` adds the same header as a host-scoped `_headers` rule for sites whose Worker does not run for HTML.
  - Catalog: `preview_urls` on; axe accessibility test (serious and critical fail) and an impeccable detector scan (report-only) in CI.

### Patch Changes

- Updated dependencies [df685b7]
  - @hubpav/hwio-brand@0.7.0
  - @hubpav/hwio-web-runtime@0.7.0
  - @hubpav/hwio-web-worker@0.7.0

## 0.6.6

### Patch Changes

- 2776cf0: `HWioHeader`: the current-page bar now sits on the header's bottom edge (nav items span the bar's height) and the current label colour wins over the default link colour.
  - @hubpav/hwio-brand@0.6.6
  - @hubpav/hwio-web-runtime@0.6.6
  - @hubpav/hwio-web-worker@0.6.6

## 0.6.5

### Patch Changes

- 2f034d1: `HWioHeader`: the current page's nav item is marked with a coloured label and a 2px bar on the header's bottom edge (`--hwio-nav-active`, default the primary colour; the `er3o` theme uses ENEROOO's blue `#296ea7`). Registry: the HARDWARIO LinkedIn link is `https://www.linkedin.com/company/hardwario/`.
- Updated dependencies [2f034d1]
  - @hubpav/hwio-brand@0.6.5
  - @hubpav/hwio-web-runtime@0.6.5
  - @hubpav/hwio-web-worker@0.6.5

## 0.6.4

### Patch Changes

- 5661ba4: Theme `er3o`: the filled primary button dims on hover (`brightness(0.92)`); DaisyUI's hover only changes `background-color`, which the CTA gradient image covered, so the button showed no hover state.
  - @hubpav/hwio-brand@0.6.4
  - @hubpav/hwio-web-runtime@0.6.4
  - @hubpav/hwio-web-worker@0.6.4

## 0.6.3

### Patch Changes

- 9f0b548: Footer link hover colour is themed: `--hwio-footer-hover` (default the accent). The `er3o` theme sets white, because its accent is a dark teal that vanished on the graphite footer.
- Updated dependencies [9f0b548]
  - @hubpav/hwio-brand@0.6.3
  - @hubpav/hwio-web-runtime@0.6.3
  - @hubpav/hwio-web-worker@0.6.3

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
