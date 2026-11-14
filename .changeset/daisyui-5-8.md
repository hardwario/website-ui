---
'@hubpav/hwio-ui': patch
---

DaisyUI 5.7.47 to 5.8.0 (owner ruling 2026-11-14: every package on its latest stable release). The themes and the components are unchanged; what changes is the CSS DaisyUI itself writes for the classes the components use (cards, inputs, toggles, tabs, dropdowns, the forced-colors rules). No visible change: the catalog's screenshots of every component under every theme match the baselines, and the accessibility and behaviour tests pass. Sites need no change beyond the version: bump the four packages, build and compare screenshots.
