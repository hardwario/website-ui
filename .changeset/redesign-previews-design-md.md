---
"@hubpav/hwio-brand": minor
"@hubpav/hwio-ui": minor
"@hubpav/hwio-web-runtime": minor
"@hubpav/hwio-web-worker": minor
---

Design context, preview deployments and an accessibility gate for the 2026 redesign program (owner rulings R13 to R16, website-admin `DESIGN-SYSTEM.md`).

- `@hubpav/hwio-brand`: `typography` and `rhythm` token blocks mirror the ramp implemented in `hwio-ui/styles.css` (a test fails when they drift); `dist/design/<theme>.md` is a generated DESIGN.md (impeccable format) per light theme, exported as `@hubpav/hwio-brand/design/<theme>.md`; the repo root `DESIGN.md` is the `hwio` copy. Dark themes lift `secondary` to the light brand blue like `primary` (R10): prose links on the night ground were 3.7:1. The `er3o` theme gains `--hwio-link` (its text teal) and `--hwio-kicker-on-neutral` (its green) so link buttons, prose links and kickers on neutral panels clear AA.
- `@hubpav/hwio-ui`: `.label` and inactive `.tab` text at 78 % of the text colour instead of DaisyUI's 60 and 50 % (R5, AA at 14 px); `.btn-link` and `.hwio-prose a` read `--hwio-link` with the previous roles as fallback.
- `@hubpav/hwio-web-worker`: `hwioWorker` treats `*.workers.dev` hosts (`previewHosts`) as preview deployments: no canonical-host redirect there and `X-Robots-Tag: noindex, nofollow` on every response. `hwioRenderHeadersFile({ previewNoindex: true })` adds the same header as a host-scoped `_headers` rule for sites whose Worker does not run for HTML.
- Catalog: `preview_urls` on; axe accessibility test (serious and critical fail) and an impeccable detector scan (report-only) in CI.
