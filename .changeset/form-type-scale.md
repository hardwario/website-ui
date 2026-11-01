---
"@hubpav/hwio-ui": patch
---

Forms on the brand type scale: field labels (`.fieldset-legend`, as HWioFormField renders them) 15 px in the label weight (Bold), field text (`.input`, `.select`, `.textarea`) 16 px, instead of DaisyUI's 12 px Semibold labels and 14 px fields, which sat below the body text and let iPhones zoom into a focused field (owner, 2026-11-01). Sites that carried this rule locally can drop it.
