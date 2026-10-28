---
"@hubpav/hwio-web-runtime": patch
---

The landing page's ad click ids and UTM parameters are remembered in memory (never written to the device) across Astro ClientRouter navigations, so a visitor who grants marketing consent on a later page, or sends a form there with marketing consent, keeps the ad attribution. `hwioRememberLandingAttribution()` runs in the forms runtime's bind; `hwioGetPageAttribution()` and `hwioCaptureAttribution()` include the remembered values first. Consent gating is unchanged.
