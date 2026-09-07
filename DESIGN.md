---
name: "HARDWARIO"
description: "Navy and red on white with sky panels, Inter, hairline borders, 8 px rhythm, 48 px controls, sentence-case red kickers. Generated from @hubpav/hwio-brand; the source of truth is brand.json."
colors:
  primary: "#06367a"
  primary-content: "#ffffff"
  secondary: "#016ad4"
  secondary-content: "#ffffff"
  accent: "#e30427"
  accent-content: "#ffffff"
  neutral: "#252532"
  neutral-content: "#f3f4f6"
  base-100: "#ffffff"
  base-200: "#F1FAFF"
  base-300: "#e5e7eb"
  base-content: "#252532"
  info: "#009cfa"
  info-content: "#06367a"
  success: "#15803d"
  success-content: "#ffffff"
  warning: "#b45309"
  warning-content: "#ffffff"
  error: "#dc2626"
  error-content: "#ffffff"
typography:
  display:
    fontFamily: "'Inter', 'Inter Fallback', ui-sans-serif, system-ui, sans-serif"
    fontSize: "3.5rem"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.03em"
  heading:
    fontFamily: "'Inter', 'Inter Fallback', ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.5rem"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  subheading:
    fontFamily: "'Inter', 'Inter Fallback', ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  title:
    fontFamily: "'Inter', 'Inter Fallback', ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.005em"
  lead:
    fontFamily: "'Inter', 'Inter Fallback', ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.1875rem"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "0"
  body:
    fontFamily: "'Inter', 'Inter Fallback', ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0"
  kicker:
    fontFamily: "'Inter', 'Inter Fallback', ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0"
  button:
    fontFamily: "'Inter', 'Inter Fallback', ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 600
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
  container-hub: "1275px"
  container-landing: "1640px"
  container-pad: "27px"
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

**Creative North Star: "The instrument panel"**

HARDWARIO sells industrial IoT hardware to system integrators, engineers, schools and plant operators. The web family reads like a well-made instrument: calm white ground, navy for what acts, one red mark for what matters, generous measure and no decoration that does not carry information. This file documents the system as built on 2026-09-07 (direction A, "www systematised"); the 2026 redesign evolves everything but the fixed constraints below and rewrites this file from the built world.

Key characteristics:

- One type family (Inter), one accent, hairline structure, flat surfaces.
- Sentence-case labels and buttons everywhere ([R4](https://github.com/hardwario/website-admin/blob/main/DESIGN-SYSTEM.md)); kickers instead of uppercase eyebrows.
- Light is the default theme on every site; dark is a visitor's choice remembered without a consent gate (R11).
- Copy is the product: components carry the site's own words, never placeholder text.

**The Fixed Four Rule.** The HARDWARIO logo, red `#e30427`, navy `#06367a` and Inter do not change (owner ruling R14, 2026-09-07). Every other token, surface, composition and motion decision is open to the redesign.

## Colors

Roles follow the DaisyUI 5 vocabulary so every `@hubpav/hwio-ui` component and every site utility resolves the same slot. Values below are the `hwio` light theme; the source of truth is `packages/brand/src/brand.json` in `hardwario/website-ui`.

| Role | Value | Use |
|---|---|---|
| `primary` / `primary-content` | `#06367a` on `#ffffff` | buttons, active states, links in navigation |
| `secondary` / `secondary-content` | `#016ad4` on `#ffffff` | focus ring, secondary emphasis |
| `accent` / `accent-content` | `#e30427` on `#ffffff` | kicker, current-page marker, inline links; never large fills |
| `neutral` / `neutral-content` | `#252532` on `#f3f4f6` | ink panels and the footer |
| `base-100` / `base-100-content` | `#ffffff` on `undefined` | page ground |
| `base-200` / `base-200-content` | `#F1FAFF` on `undefined` | alternate section surface |
| `base-300` / `base-300-content` | `#e5e7eb` on `undefined` | hairline borders |
| `info` / `info-content` | `#009cfa` on `#06367a` | informational badges |
| `success` / `success-content` | `#15803d` on `#ffffff` | form success |
| `warning` / `warning-content` | `#b45309` on `#ffffff` | warnings |
| `error` / `error-content` | `#dc2626` on `#ffffff` | form errors |

**The Token Rule.** A colour, radius or type change is a `brand.json` edit and a `website-ui` pull request, never site-local CSS. Sites consume roles (`bg-primary`, `text-base-content`), not hex values.

**The One Accent Rule.** The accent carries the kicker, the current-page marker and inline links; it never fills large surfaces and never sets small body text (R5).

### Dark theme (`hwio-dark`)

The dark pair keeps the same roles; visitors choose it with the theme toggle and the choice is remembered (R11). The primary lifts to the light brand blue with dark content so filled and outline buttons stay legible (R10).

| Role | Value |
|---|---|
| `primary` / `primary-content` | `#009cfa` on `#0f0f14` |
| `secondary` / `secondary-content` | `#009cfa` on `#0f0f14` |
| `accent` / `accent-content` | `#f43f5e` on `#0f0f14` |
| `neutral` / `neutral-content` | `#23232f` on `#e7e7ee` |
| `base-100` / `base-100-content` | `#0f0f14` on `undefined` |
| `base-200` / `base-200-content` | `#1a1a22` on `undefined` |
| `base-300` / `base-300-content` | `#23232f` on `undefined` |
| `info` / `info-content` | `#009cfa` on `#06367a` |
| `success` / `success-content` | `#15803d` on `#ffffff` |
| `warning` / `warning-content` | `#b45309` on `#ffffff` |
| `error` / `error-content` | `#dc2626` on `#ffffff` |

## Typography

Inter for everything: display, body, labels and numerals (tabular numerals in stats). The fallback face is metric-matched to Arial so the pre-paint gate (`font-display: block`, R3) never repaints a layout. The ramp tightens tracking as size grows.

| Role | Element | Size (large screens) | Weight | Line height | Tracking |
|---|---|---|---|---|---|
| display | `h1` | 3.5rem | 700 | 1.05 | -0.03em |
| heading | `h2` | 2.5rem | 700 | 1.1 | -0.025em |
| subheading | `h3` | 1.375rem | 700 | 1.2 | -0.01em |
| title | `h4` | 1.125rem | 700 | 1.3 | -0.005em |
| lead | `.hwio-lead` | 1.1875rem | 400 | 1.55 | 0 |
| body | `body` | 1.0625rem | 400 | 1.6 | 0 |
| kicker | `.hwio-kicker` | 0.875rem | 600 | 1.4 | 0 |
| button | `.btn` | 0.9375rem | 600 | 1 | 0 |

Smaller screens step the display and heading roles down (display: 2.5rem at base, 3rem at md, 3.5rem from 64rem; heading: 2rem at base, 2.5rem from 64rem). Headings use `text-wrap: balance`.

## Layout

Two container presets from the theme: the hub width (1275px) for content-rich sites and the landing width (1640px) for the single-page marketing sites, both with 27px side padding. Sections stack on an 8 px rhythm: 80px (112px from 64rem) of vertical padding, compact bands 40px (48px from 64rem). Section content opens with a `HWioSectionHeader` in `stack` (centred) or `split` (5/7 grid, aligned to the baseline) layout; stats bands and choice cards divide with hairlines, not boxes.

## Elevation & Depth

The system is flat. DaisyUI `depth` and `noise` are `0`; there are no shadow tokens. Structure comes from hairline borders (`base-300`) and surface shifts (`base-100` on `base-200`, ink panels on `neutral`). A dark-surface panel uses the `neutral` pair and the inverse button; nothing floats.

## Shapes

Corner radii from the theme: fields 0.5rem, boxes 1rem, selectors 2rem. Borders are 1 px hairlines. Media inside cards is clipped to the box radius; hero media keeps its natural edges.

## Components

- **Buttons.** `button-primary` (primary fill, primary-content text), `button-secondary` (primary outline on base-100), `button-inverse` for ink panels (neutral-content fill), `ghost` and `link`. All 48px tall, 0.9375rem at weight 600, sentence case, 0.5rem radius; large buttons widen padding at the same height.
- **Cards.** `card card-border` on base-100 with a hairline, 32px padding; the lead choice card carries a 3 px accent top border. Cards never nest.
- **Kicker and lead.** The kicker is the accent-coloured 0.875rem label above a heading; the lead is 1.1875rem muted text below it.
- **Inputs.** Field radius, hairline border, 48px tall; focus ring 2 px `secondary`.
- **Navigation.** `HWioHeader` with mega panels on wide screens (`desktopFrom="xl"` on sites with five or more items); the current page is marked by a 2 px bar on the header's bottom edge.
- **Bands.** `HWioStatsBand` (hairline top and bottom, vertical dividers, count-up with tabular numerals), `HWioCtaBand`, `HWioLogoStrip`.

## Do's and Don'ts

- Do keep Inter as the only text face; the detector's `overused-font` finding for Inter is waived by owner ruling R14 in `.impeccable/config.json`.
- Do use the theme roles for every colour; don't hard-code hex values in a site.
- Do keep buttons sentence case and 48px tall; don't uppercase labels or shrink touch targets below 44 px.
- Do keep dark mode a visitor's choice with the `hwio_theme` memory; don't follow the OS scheme by default (R11).
- Don't add inline styles, `style=` attributes or template-literal class names; `policy-lint` fails them.
- Don't nest cards, add glass or gradient effects, or animate anything above the fold.
- Don't set small body text in the accent colour (R5).
