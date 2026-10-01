---
"@hubpav/hwio-web-worker": patch
"@hubpav/hwio-ui": patch
"@hubpav/hwio-brand": patch
"@hubpav/hwio-web-runtime": patch
---

CSP collector, GTM origins and DaisyUI 5.7.47 (found in the 2026-10-01 infrastructure review).

- `@hubpav/hwio-web-worker`: the `/csp-report` collector cut every body to 8 KB before `JSON.parse`, so Chrome's batched Reporting API posts (`application/reports+json`, up to ~100 KB) were logged as `parse: failed` and lost. It now reads up to 256 KB, accepts both the Reporting API batch and the legacy `report-uri` body (`hwioParseCspReports`), merges identical violations with a count and logs one compact line per distinct violation (`kind: "csp-report"`, directive, blocked, document, source, line, column, disposition, sample, count, ua). URLs keep origin and path only, so query strings (form fields, click ids) never reach Workers Logs.
- `@hubpav/hwio-web-worker`: the `gtm` CSP preset follows Google's tag CSP guide for GA4 with Ads features: `connect-src` adds `https://*.google.com` (covers `analytics.google.com/g/collect`, which `*.analytics.google.com` does not match), the country Google domains (`googleTlds`, default cz, sk, de, at, ch, pl; `www.google.<tld>/ads/ga-audiences`), `https://*.g.doubleclick.net` and `https://pagead2.googlesyndication.com`. Production reports showed both Google calls blocked.
- `@hubpav/hwio-ui`: DaisyUI 5.7.28 to 5.7.47. DaisyUI now paints a menu link with `aria-current` like `.menu-active`; the header's current nav item (and the drawer row) keeps its own label colour and bar instead of a dark fill. Buttons with `aria-current` (the current pill in `HWioLanguageSwitcher`'s pills variant) take DaisyUI's pressed state, 5 % darker. Checkbox ticks are re-centred by DaisyUI.
