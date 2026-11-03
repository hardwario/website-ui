---
"@hubpav/hwio-web-runtime": patch
---

Mega panels follow the pointer more forgivingly (owner, 2026-11-03: the panel hid when leaving the bar slowly, and moving from Products to Applications hid it in between). Hover is tracked on the trigger's whole nav item, which spans the bar's full height down to the panel, instead of on the label button alone (34 px of a 72 px bar on www), and the grace period before a panel closes is 300 ms instead of 180 ms. Sites whose nav items meet (padding only, no gap between them) switch panels along the nav without ever closing one.
