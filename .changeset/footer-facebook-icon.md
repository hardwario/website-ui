---
"@hubpav/hwio-ui": patch
"@hubpav/hwio-brand": patch
"@hubpav/hwio-web-runtime": patch
"@hubpav/hwio-web-worker": patch
---

`HWioFooter`: the `social[].icon` type accepts `'facebook'`, which `HWioIcon` has drawn since 0.6.0 (www.enerooo.cz passes it; `astro check` reported ts(2322)). Types only; the rendered output is unchanged.
