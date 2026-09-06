---
"@hubpav/hwio-ui": patch
"@hubpav/hwio-web-runtime": patch
---

- `hwioUi()` copies only the font families the site uses into `/fonts` (`fonts` option, default `['inter']`); the Poppins files no longer ship with every HARDWARIO site.
- A form whose Turnstile widget produced no token (blocked script, unsupported browser, timeout) shows the error status and does not send the request; `HWioHubSpotForm` accepts an optional `labels.turnstile` message for it.
- `HWioContactSection`: the phone number never breaks across lines on narrow screens.
