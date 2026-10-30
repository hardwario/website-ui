---
name: "HARDWARIO"
description: "Blue for buttons and links, Ink text on a white ground, Red kickers, the Red-to-Sky gradient as the signature; Inter in Regular, Semibold (H2, H3) and Bold; a 12-column 1 280 px grid; hairline structure. Generated from @hubpav/hwio-brand; the source of truth is brand.json."
colors:
  primary: "#016ad4"
  primary-content: "#ffffff"
  secondary: "#06367a"
  secondary-content: "#ffffff"
  accent: "#e30427"
  accent-content: "#ffffff"
  neutral: "#252532"
  neutral-content: "#ffffff"
  base-100: "#ffffff"
  base-200: "#f5f5f5"
  base-300: "#dcdcdc"
  base-content: "#252532"
  info: "#016ad4"
  info-content: "#ffffff"
  success: "#2e7d4f"
  success-content: "#ffffff"
  warning: "#c76a00"
  warning-content: "#252532"
  error: "#e30427"
  error-content: "#ffffff"
typography:
  display:
    fontFamily: "'Inter', 'Inter Fallback', ui-sans-serif, system-ui, sans-serif"
    fontSize: "4.5rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  heading:
    fontFamily: "'Inter', 'Inter Fallback', ui-sans-serif, system-ui, sans-serif"
    fontSize: "3rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.015em"
  subheading:
    fontFamily: "'Inter', 'Inter Fallback', ui-sans-serif, system-ui, sans-serif"
    fontSize: "2rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  title:
    fontFamily: "'Inter', 'Inter Fallback', ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "0"
  lead:
    fontFamily: "'Inter', 'Inter Fallback', ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.1875rem"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "0"
  body:
    fontFamily: "'Inter', 'Inter Fallback', ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0"
  caption:
    fontFamily: "'Inter', 'Inter Fallback', ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0"
  kicker:
    fontFamily: "'Inter', 'Inter Fallback', ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "0.07em"
  chip:
    fontFamily: "'Inter', 'Inter Fallback', ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "0.07em"
  figure:
    fontFamily: "'Inter', 'Inter Fallback', ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.5rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  button:
    fontFamily: "'Inter', 'Inter Fallback', ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0"
rounded:
  selector: "2rem"
  field: "0.5rem"
  box: "1rem"
spacing:
  unit: "8px"
  section: "80px"
  section-lg: "112px"
  section-compact: "40px"
  section-compact-lg: "48px"
  container: "1328px"
  container-pad: "24px"
  grid-columns: "12"
  grid-width: "1280px"
  grid-gutter: "24px"
  control: "48px"
  card-padding: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-content}"
    typography: "{typography.button}"
    rounded: "{rounded.field}"
    height: "48px"
  button-secondary:
    backgroundColor: "{colors.base-100}"
    textColor: "{colors.primary}"
    typography: "{typography.button}"
    rounded: "{rounded.field}"
    height: "48px"
  button-inverse:
    backgroundColor: "{colors.neutral-content}"
    textColor: "{colors.neutral}"
    typography: "{typography.button}"
    rounded: "{rounded.field}"
    height: "48px"
  card:
    backgroundColor: "{colors.base-100}"
    textColor: "{colors.base-content}"
    rounded: "{rounded.box}"
    padding: "32px"
  input:
    backgroundColor: "{colors.base-100}"
    textColor: "{colors.base-content}"
    typography: "{typography.body}"
    rounded: "{rounded.field}"
    height: "48px"
  kicker:
    textColor: "{colors.accent}"
    typography: "{typography.kicker}"
  chip:
    backgroundColor: "{colors.base-200}"
    textColor: "{colors.base-content}"
    typography: "{typography.kicker}"
    rounded: "{rounded.selector}"
---
<!-- Generated from @hubpav/hwio-brand (theme hwio) by packages/brand/scripts/build-design-md.mjs. Do not edit in a site: change packages/brand/src in hardwario/website-ui, publish, then run scripts/design-sync.sh in website-admin. -->

# HARDWARIO design system

## Overview

**Creative North Star: "Devices that bring industrial assets online"**

HARDWARIO designs and manufactures the devices that bring industrial assets online. The web family follows the Brand Guidelines HBG.261028.01 revision 3 (issued 2026-10-30; the rules of revision 2), the master for every HARDWARIO surface: a page is mostly white with Ink type, Blue gives structure (buttons and links), Red marks (kickers) and highlights the one thing per page, and the gradient frames. Web-only rules on top of the guidelines (responsive sizes, breakpoints, states, motion, dark-mode behaviour) are the web layer in website-admin `DESIGN-SYSTEM.md`. This file is regenerated from brand.json, so it matches the shipped tokens.

Key characteristics:

- One type family (Inter), one accent, hairline structure, flat surfaces.
- Sentence case for headings, labels and buttons ([R4](https://github.com/hardwario/website-admin/blob/main/DESIGN-SYSTEM.md)); capitals only for short labels and kickers.
- Light is the default theme on every site; dark is a visitor's choice remembered without a consent gate (R11).
- Copy is the product: components carry the site's own words, never placeholder text.

**The Brand Rule.** The Brand Guidelines HBG.261028.01 are the master: nothing on the web contradicts them. Blue `#016ad4` fills buttons and colours links, Ink `#252532` sets text (never pure black), Red `#e30427` marks kickers and the one highlight, and the gradient `linear-gradient(90deg, #e30427, #009cfa)` frames. A web need the guidelines do not cover is a web-layer rule in website-admin `DESIGN-SYSTEM.md`; one that would contradict them goes back to the guidelines as a change request.

## Colors

Roles follow the DaisyUI 5 vocabulary so every `@hubpav/hwio-ui` component and every site utility resolves the same slot. Values below are the `hwio` light theme; the source of truth is `packages/brand/src/brand.json` in `hardwario/website-ui`.

| Role | Value | Use |
|---|---|---|
| `primary` / `primary-content` | `#ffffff` on `#016ad4` | buttons, the current-page marker, active states (Blue; Sky in dark) |
| `secondary` / `secondary-content` | `#ffffff` on `#06367a` | focus ring, dark grounds (Navy; Sky in dark) |
| `accent` / `accent-content` | `#ffffff` on `#e30427` | kickers and the one highlight per page; never large fills, never small body text |
| `neutral` / `neutral-content` | `#ffffff` on `#252532` | Ink panels and the footer |
| `base-100` / `base-content` | `#252532` on `#ffffff` | page ground |
| `base-200` / `base-content` | `#252532` on `#f5f5f5` | Panel: cards, zones, alternate sections |
| `base-300` / `base-content` | `#252532` on `#dcdcdc` | Hairline: rules and thin frames |
| `info` / `info-content` | `#ffffff` on `#016ad4` | info: a note, nothing to do (Blue, a proposal in the guidelines, D34) |
| `success` / `success-content` | `#ffffff` on `#2e7d4f` | done, passed, in limits |
| `warning` / `warning-content` | `#252532` on `#c76a00` | attention, at risk; never a ground for text (White 3.8:1, Ink 3.9:1) |
| `error` / `error-content` | `#ffffff` on `#e30427` | failed, critical, stop; in charts the only use of Red |

**The Token Rule.** A colour, radius or type change is a `brand.json` edit and a `website-ui` pull request, never site-local CSS. Sites consume roles (`bg-primary`, `text-base-content`) and the `--hwio-*` variables, not hex values.

**The One Accent Rule.** The accent carries the kicker and the one highlight of a page; it never fills large surfaces and never sets small body text (R5). In charts and dashboards Red means a failure and nothing else; a highlight there is Navy, the series Blue, Sky and Gray (`--hwio-chart-*`).

**The Gradient Rule.** `--hwio-gradient` (Red to Sky, 90°) frames: a band along an edge, a short rule under a title, the strip on top of a card. `--hwio-gradient-figure` (its left three quarters) fills the one key figure of a page, 28 pt and up. Never behind body text, tables or photographs, never on icons, never reversed or vertical.

### Dark theme (`hwio-dark`)

The dark mode of the Brand Guidelines (D35, ratified for the web on 2026-10-29): a near-black ground, Ink surfaces, White text, the light gray for secondary text, Sky for buttons and links, the light red for accents and lighter status colours. The dark pair keeps the same roles; light is the default, visitors choose dark with the theme toggle and the choice is remembered (R11).

| Role | Value |
|---|---|
| `primary` / `primary-content` | `#16161d` on `#009cfa` |
| `secondary` / `secondary-content` | `#16161d` on `#009cfa` |
| `accent` / `accent-content` | `#16161d` on `#f43f5e` |
| `neutral` / `neutral-content` | `#ffffff` on `#252532` |
| `base-100` / `base-content` | `#ffffff` on `#16161d` |
| `base-200` / `base-content` | `#ffffff` on `#252532` |
| `base-300` / `base-content` | `#ffffff` on `#3b3b46` |
| `info` / `info-content` | `#16161d` on `#009cfa` |
| `success` / `success-content` | `#16161d` on `#34c47a` |
| `warning` / `warning-content` | `#16161d` on `#f59e0b` |
| `error` / `error-content` | `#16161d` on `#f43f5e` |

## Typography

Inter for everything: display, body, labels and numerals (tabular numerals in stats). The fallback face is metric-matched to Arial so the pre-paint gate (`font-display: block`, R3) never repaints a layout. Each theme file carries its ramp as `--hwio-type-<role>-*` variables.

| Role | Element | Size (large screens) | Weight | Line height | Tracking |
|---|---|---|---|---|---|
| display | `h1` | 4.5rem | 700 | 1.2 | -0.02em |
| heading | `h2` | 3rem | 600 | 1.3 | -0.015em |
| subheading | `h3` | 2rem | 600 | 1.3 | -0.01em |
| title | `h4` | 1.25rem | 700 | 1.3 | 0 |
| lead | `.hwio-lead` | 1.1875rem | 400 | 1.55 | 0 |
| body | `body` | 1rem | 400 | 1.6 | 0 |
| caption | `.hwio-caption` | 0.8125rem | 400 | 1.4 | 0 |
| kicker | `.hwio-kicker` | 0.8125rem | 700 | 1.4 | 0.07em, uppercase |
| chip | `.hwio-chip` | 0.75rem | 700 | 1.4 | 0.07em, uppercase |
| figure | `.hwio-figure` | 2.5rem | 700 | 1.2 | -0.02em |
| button | `.btn` | 0.9375rem | 700 | 1 | 0 |

Smaller screens step the larger roles down (display: 2.5rem below 48rem, 3rem from 48rem, 3.75rem from 64rem, 4.5rem from 80rem; heading: 2rem below 48rem, 2.5rem from 64rem, 3rem from 80rem, line height 1.2 from 64rem; subheading: 1.5rem below 48rem, 1.75rem from 64rem, 2rem from 80rem). Headings use `text-wrap: balance`.

## Layout

Twelve columns, 1280px wide, with 24px gutters (Brand Guidelines chapter 05): the container is 1328px including its 24px margin on each side, so the content box is the guidelines' 1280px grid. Content sits flush to the margins; nothing floats in from them. Sections stack on an 8 px rhythm: 80px (112px from 64rem) of vertical padding, compact bands 40px (48px from 64rem). Section content opens with a `HWioSectionHeader` in `stack` (centred) or `split` (5/7 grid, aligned to the baseline) layout; stats bands and choice cards divide with hairlines, not boxes.

## Elevation & Depth

The system is flat. DaisyUI `depth` and `noise` are `0`; there are no shadow tokens. Structure comes from hairline borders (`base-300`) and surface shifts (`base-100` on `base-200`, Ink panels on `neutral`). A dark-surface panel uses the `neutral` pair and the inverse button; nothing floats.

## Shapes

Corner radii from the theme: fields 0.5rem, boxes 1rem, selectors 2rem. Borders are 1 px hairlines. Media inside cards is clipped to the box radius; hero media keeps its natural edges.

## Components

- **Buttons.** `button-primary` (primary fill, primary-content text), `button-secondary` (primary outline on base-100), `button-inverse` for Ink panels (neutral-content fill), `ghost` and `link`. All 48px tall, 0.9375rem at weight 700, sentence case, 0.5rem radius; large buttons widen padding at the same height.
- **Cards.** `card card-border` on base-100 with a hairline, 32px padding; the lead choice card carries a 3 px accent top border. Cards never nest.
- **Kicker and lead.** The kicker is the accent-coloured 0.8125rem label above a heading, Bold caps (0.07em tracking); the lead is 1.1875rem secondary text below it.
- **Icons.** One colour from `--hwio-icon`; they label, never decorate.
- **Inputs.** Field radius, hairline border, 48px tall; focus ring 2 px `secondary`.
- **Navigation.** `HWioHeader` with mega panels on wide screens (`desktopFrom="xl"` on sites with five or more items); the current page is marked by a 2 px bar on the header's bottom edge.
- **Bands.** `HWioStatsBand` (hairline top and bottom, vertical dividers, count-up with tabular numerals), `HWioCtaBand`, `HWioLogoStrip`.

## Do's and Don'ts

- Do keep Inter as the only text face.
- Do use the theme roles and `--hwio-*` variables for every colour; don't hard-code hex values in a site.
- Do keep buttons sentence case and 48px tall; don't uppercase labels or shrink touch targets below 44 px.
- Do keep dark mode a visitor's choice with the `hwio_theme` memory; don't follow the OS scheme by default (R11).
- Don't add inline styles, `style=` attributes or template-literal class names; `policy-lint` fails them.
- Don't nest cards, add glass, shadows or gradient effects beyond the Gradient Rule, or animate anything above the fold.
- Don't set small body text in the accent colour (R5).
