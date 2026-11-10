---
'@hubpav/hwio-ui': patch
'@hubpav/hwio-web-runtime': patch
---

HWioCookieConsent: on a visit without a stored choice the banner is part of the page's first paint. A static inline bootstrap (`consentReveal`, hashed like the others, in `hwioInlineHashes`) right behind the banner's markup lifts `hidden` when neither consent cookie exists; until now the consent runtime did it after its module requests, so the banner (on a phone the page's largest block of text, and with it the LCP) appeared late. The runtime still decides everything else and carries the state across a view-transition swap. The banner is no longer exempt from the font gate, so it never shows before its font is ready.
