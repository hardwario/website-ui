---
"@hubpav/hwio-brand": minor
"@hubpav/hwio-ui": minor
"@hubpav/hwio-web-runtime": minor
"@hubpav/hwio-web-worker": minor
---

The `er3o` theme follows the ENEROOO brand guidelines HBG.261029.01 (owner, 2026-11-24). Only `er3o` changes; the HARDWARIO themes render as before.

- Palette on the guidelines' names: Limetka `#7DE314`, Máta `#01CC9B`, Tyrkys `#14A0C0`, Modrá `#296EA7`, Noc `#00171F`, Šedá `#999999`, Petrolej `#0C6678`, Grafit `#5B5B5B`, Panel `#F4F4F4`, Linka `#DDDDDD` (`er3o-<name>` keys; brand-drift checks them against company/docs `templates/enerooo-brandbook.typ`).
- Roles: text and the footer on Noc, buttons in Modrá with White SemiBold caps (5.4:1; the gradient button was 2.0:1), links and kickers in Petrolej, secondary text in Grafit, Panel and Linka grounds, focus ring in Tyrkys. Every contrast pair passes; the five er3o exceptions are gone.
- The gradient is the three ring colours (`--er3o-gradient`, `.er3o-gradient`) and never stands behind type. Removed: the gradient fill of `.btn-primary`, `.er3o-gradient-text`, `--er3o-gradient-from` and `--er3o-gradient-to`.
- Type on the guidelines' web column: H1 40 / 56 / 70 px, H2 30 / 40 / 48 px, H3 20 / 24 px, body 17 px at 1.625, captions at 1.55, kickers and chips SemiBold caps; Regular, SemiBold and Bold only (navigation and footer titles leave Medium).
- `.btn` reads `--hwio-type-button-case` and `--hwio-type-button-tracking` (caps with 0.06 em on er3o; unchanged elsewhere). er3o sets plain inline links in copy in Petrolej, underlined, and `strong` in SemiBold, both in the base layer.
