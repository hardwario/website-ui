---
'@hubpav/hwio-web-runtime': patch
---

Font gate: the page stays behind the gate until its faces have really loaded. The bootstrap runs in `<head>` before the page's styles, so it asked `document.fonts` for a family whose `@font-face` rules were not parsed yet; that resolves at once with nothing, and the gate opened about a second before the faces arrived on a slow connection (the page's boxes and pictures painted first, the text appeared later, and a face slower than three seconds would have shown the fallback and then swapped). It now waits until the family is declared (or the document has loaded), then asks for both samples; one timer of five seconds bounds the whole wait and pins the fallback as before. Sites with their own gate (www) are not affected. It also asks for every weight a family ships as a file of its own (enerooo's Poppins 400, 600 and 700), not only for 400, so a heading in a later weight no longer re-wraps the page.
