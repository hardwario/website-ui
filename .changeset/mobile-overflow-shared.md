---
'@hubpav/hwio-ui': patch
---

Phone overflow safety net for every site. Grids in HWioHeroSplit, HWioContactSection, HWioSectionHeader, HWioChoiceCards, HWioFeatureGrid, HWioPricingTiers, HWioProcessSteps, HWioStatsBand and the HWioHubSpotForm grid get an explicit one-column phone track (an implicit track grew to its widest unbreakable content and pushed the page sideways) and `minmax(0, …)` desktop tracks. Below 40rem, h1–h3 hyphenate long words, `main` breaks tokens longer than the line, and a `.btn` label wider than its column wraps onto a second line. New utility `hwio-hyphenate` for narrow cells (hyphenation for words of 10+ letters, `overflow-wrap: anywhere` as the fallback). The utility needs five letters on each side of a hyphen (`hyphenate-limit-chars: 10 5 5` plus the `-webkit-hyphenate-limit-*` pair Safari reads), so brand names under 10 letters never split; with 0.7.7's 4-letter WebKit minimum Safari could render "HARD-WARIO". HWioFooter uses the utility.
