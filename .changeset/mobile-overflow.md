---
'@hubpav/hwio-ui': patch
'@hubpav/hwio-web-runtime': patch
---

Mobile overflow fixes. HWioFooter: long words in the link columns hyphenate instead of overflowing (German labels such as "Datenschutzerklärung" and "Rechtsdokumente" were wider than a column on phones and at 1024 px, which scrolled the page sideways on www, engineering, studio and academy). Turnstile runtime: a slot narrower than 300 px gets the compact widget (150 × 140 px) instead of the fixed 300 px one, which ran past the screen in phone-width cards and columns; a `data-size` on the container still wins.
