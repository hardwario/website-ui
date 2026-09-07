---
"@hubpav/hwio-ui": patch
"@hubpav/hwio-web-runtime": patch
---

HWioHeader accessibility and reflow fixes (defects verified on www.hardwario.com, 2026-09-07). The drawer trigger and its close control are real buttons (`data-hwio-drawer-toggle`) instead of `label[role=button]`, so Enter and Space open and close the menu (WCAG 2.1.1); the nav runtime keeps `aria-expanded` in sync, moves focus to the panel's first control on open and back to the trigger on close, Escape closes, and the CSS-only checkbox leaves the tab order and the accessibility tree. Focusable items inside `.menu` (header nav, drawer, the language dropdown) get the system's 2 px `secondary` focus ring back, which DaisyUI had set to `outline-style: none` (WCAG 2.4.7). Below `sm` the bar hides the language dropdown (the drawer already carries the pills), so logo, theme toggle and the 48 px trigger fit a 320 px viewport with no horizontal overflow or clipped hamburger (WCAG 1.4.10).
