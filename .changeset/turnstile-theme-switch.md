---
"@hubpav/hwio-web-runtime": patch
---

Turnstile follows a switch of the site theme: a widget rendered in light mode stayed light after the visitor
switched to dark (and the other way round), because Turnstile cannot change a rendered widget's theme. The
runtime now redraws every widget in the new scheme on `hwio:themechange`; the redrawn widget issues a fresh token.
