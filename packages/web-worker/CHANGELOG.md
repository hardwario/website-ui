# @hubpav/hwio-web-worker

## 0.7.6

No changes in this release.

## 0.7.5

### Patch Changes

- 9df9338: `@hubpav/hwio-web-runtime` forms: click ids (`gclid`, `gbraid`, `wbraid`, `fbclid`, `msclkid`, `li_fat_id`) and UTM parameters read from the current page URL are sent with a form submission only when marketing consent is granted (owner decision 2026-10-08). Until now they travelled with every submission, consent or not; the stored `hwio_attribution` copy, the referrer and `hubspotutk` already needed marketing consent and `ga_client_id` statistics consent, and that stays as it was. The gating is a pure, unit-tested `hwioSubmitAttribution()` in `/forms-core`.

## 0.7.4

### Patch Changes

- 8ea4a97: `HWioFooter`: the `social[].icon` type accepts `'facebook'`, which `HWioIcon` has drawn since 0.6.0 (www.enerooo.cz passes it; `astro check` reported ts(2322)). Types only; the rendered output is unchanged.

## 0.7.3

### Patch Changes

- 56cc114: `@hubpav/hwio-ui`: DaisyUI 5.7.47 (0.7.2) fills pressed buttons, so `HWioThemeToggle` (a ghost button with `aria-pressed="true"` in dark mode) showed a filled square on every site's dark theme. Ghost buttons with `aria-pressed` or `aria-checked` keep the transparent ground at rest again; hover and focus tint them as before (computed backgrounds now match DaisyUI 5.7.28 in all four states on `hwio`, `hwio-dark` and `er3o`).

## 0.7.2

### Patch Changes

- 4d16a18: CSP collector, GTM origins and DaisyUI 5.7.47 (found in the 2026-10-01 infrastructure review).

  - `@hubpav/hwio-web-worker`: the `/csp-report` collector cut every body to 8 KB before `JSON.parse`, so Chrome's batched Reporting API posts (`application/reports+json`, up to ~100 KB) were logged as `parse: failed` and lost. It now reads up to 256 KB, accepts both the Reporting API batch and the legacy `report-uri` body (`hwioParseCspReports`), merges identical violations with a count and logs one compact line per distinct violation (`kind: "csp-report"`, directive, blocked, document, source, line, column, disposition, sample, count, ua). URLs keep origin and path only, so query strings (form fields, click ids) never reach Workers Logs.
  - `@hubpav/hwio-web-worker`: the `gtm` CSP preset follows Google's tag CSP guide for GA4 with Ads features: `connect-src` adds `https://*.google.com` (covers `analytics.google.com/g/collect`, which `*.analytics.google.com` does not match), the country Google domains (`googleTlds`, default cz, sk, de, at, ch, pl; `www.google.<tld>/ads/ga-audiences`), `https://*.g.doubleclick.net` and `https://pagead2.googlesyndication.com`. Production reports showed both Google calls blocked.
  - `@hubpav/hwio-ui`: DaisyUI 5.7.28 to 5.7.47. DaisyUI now paints a menu link with `aria-current` like `.menu-active`; the header's current nav item (and the drawer row) keeps its own label colour and bar instead of a dark fill. Buttons with `aria-current` (the current pill in `HWioLanguageSwitcher`'s pills variant) take DaisyUI's pressed state, 5 % darker. Checkbox ticks are re-centred by DaisyUI.

## 0.7.1

## 0.7.0

### Minor Changes

- df685b7: Design context, preview deployments and an accessibility gate for the 2026 redesign program (owner rulings R13 to R16, website-admin `DESIGN-SYSTEM.md`).

  - `@hubpav/hwio-brand`: `typography` and `rhythm` token blocks mirror the ramp implemented in `hwio-ui/styles.css` (a test fails when they drift); `dist/design/<theme>.md` is a generated DESIGN.md (impeccable format) per light theme, exported as `@hubpav/hwio-brand/design/<theme>.md`; the repo root `DESIGN.md` is the `hwio` copy. Dark themes lift `secondary` to the light brand blue like `primary` (R10): prose links on the night ground were 3.7:1. The `er3o` theme gains `--hwio-link` (its text teal) and `--hwio-kicker-on-neutral` (its green) so link buttons, prose links and kickers on neutral panels clear AA.
  - `@hubpav/hwio-ui`: `.label` and inactive `.tab` text at 78 % of the text colour instead of DaisyUI's 60 and 50 % (R5, AA at 14 px); `.btn-link` and `.hwio-prose a` read `--hwio-link` with the previous roles as fallback.
  - `@hubpav/hwio-web-worker`: `hwioWorker` treats `*.workers.dev` hosts (`previewHosts`) as preview deployments: no canonical-host redirect there and `X-Robots-Tag: noindex, nofollow` on every response. `hwioRenderHeadersFile({ previewNoindex: true })` adds the same header as a host-scoped `_headers` rule for sites whose Worker does not run for HTML.
  - Catalog: `preview_urls` on; axe accessibility test (serious and critical fail) and an impeccable detector scan (report-only) in CI.

## 0.6.6

## 0.6.5

## 0.6.4

## 0.6.3

## 0.6.2

## 0.6.1

## 0.6.0

## 0.5.0

## 0.4.0

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
