---
"@hubpav/hwio-web-runtime": minor
"@hubpav/hwio-ui": patch
---

The theme bootstrap always stamps `data-theme` (stored choice, else the system scheme) so non-default DaisyUI themes such as `hwio-forestry` apply and dark rules match on the attribute alone; the runtime follows `prefers-color-scheme` changes when no choice is stored. Pricing badges stay on one line.
