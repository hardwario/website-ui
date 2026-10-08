---
"@hubpav/hwio-web-runtime": patch
"@hubpav/hwio-ui": patch
"@hubpav/hwio-brand": patch
"@hubpav/hwio-web-worker": patch
---

`@hubpav/hwio-web-runtime` forms: click ids (`gclid`, `gbraid`, `wbraid`, `fbclid`, `msclkid`, `li_fat_id`) and UTM parameters read from the current page URL are sent with a form submission only when marketing consent is granted (owner decision 2026-10-08). Until now they travelled with every submission, consent or not; the stored `hwio_attribution` copy, the referrer and `hubspotutk` already needed marketing consent and `ga_client_id` statistics consent, and that stays as it was. The gating is a pure, unit-tested `hwioSubmitAttribution()` in `/forms-core`.
