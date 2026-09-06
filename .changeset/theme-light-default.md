---
"@hubpav/hwio-web-runtime": minor
"@hubpav/hwio-ui": minor
"@hubpav/hwio-brand": minor
---

Owner decision 2026-09-06: light is the default theme on every site regardless of the OS setting; dark applies only when the visitor chose it. The choice is remembered without a consent gate (a user-requested display preference): localStorage on every site and, where the site declares `themeCookieDomain` in `hwioHtmlAttrs`, a first-party `hwio_theme` cookie shared across that domain (www, docs, stem on .hardwario.com). The consent runtime no longer clears theme keys; `hwio-dark` no longer claims `prefersdark`; the system-scheme media twins are gone.
