## Overview

**Creative North Star: "{{northStar}}"**

{{overview}}

Key characteristics:

- One type family ({{fontFamily}}), one accent, hairline structure, flat surfaces.
- Sentence-case labels and buttons everywhere ([R4](https://github.com/hardwario/website-admin/blob/main/DESIGN-SYSTEM.md)); kickers instead of uppercase eyebrows.
- Light is the default theme on every site; dark is a visitor's choice remembered without a consent gate (R11).
- Copy is the product: components carry the site's own words, never placeholder text.

{{brandRules}}

## Colors

Roles follow the DaisyUI 5 vocabulary so every `@hubpav/hwio-ui` component and every site utility resolves the same slot. Values below are the `{{themeName}}` light theme; the source of truth is `packages/brand/src/brand.json` in `hardwario/website-ui`.

{{colorsTable}}

**The Token Rule.** A colour, radius or type change is a `brand.json` edit and a `website-ui` pull request, never site-local CSS. Sites consume roles (`bg-primary`, `text-base-content`), not hex values.

**The One Accent Rule.** The accent carries the kicker, the current-page marker and inline links; it never fills large surfaces and never sets small body text (R5).

{{darkSection}}

## Typography

{{fontFamily}} for everything: display, body, labels and numerals (tabular numerals in stats). The fallback face is metric-matched to Arial so the pre-paint gate (`font-display: block`, R3) never repaints a layout. The ramp tightens tracking as size grows.

| Role | Element | Size (large screens) | Weight | Line height | Tracking |
|---|---|---|---|---|---|
{{typeTable}}

Smaller screens step the display and heading roles down ({{responsiveNote}}). Headings use `text-wrap: balance`.

## Layout

Two container presets from the theme: the hub width ({{containerHub}}) for content-rich sites and the landing width ({{containerLanding}}) for the single-page marketing sites, both with {{containerPad}} side padding. Sections stack on an 8 px rhythm: {{sectionRhythm}} of vertical padding, compact bands {{sectionCompact}}. Section content opens with a `HWioSectionHeader` in `stack` (centred) or `split` (5/7 grid, aligned to the baseline) layout; stats bands and choice cards divide with hairlines, not boxes.

## Elevation & Depth

The system is flat. DaisyUI `depth` and `noise` are `0`; there are no shadow tokens. Structure comes from hairline borders (`base-300`) and surface shifts (`base-100` on `base-200`, ink panels on `neutral`). A dark-surface panel uses the `neutral` pair and the inverse button; nothing floats.

## Shapes

Corner radii from the theme: fields {{radiusField}}, boxes {{radiusBox}}, selectors {{radiusSelector}}. Borders are 1 px hairlines. Media inside cards is clipped to the box radius; hero media keeps its natural edges.

## Components

- **Buttons.** `button-primary` (primary fill, primary-content text), `button-secondary` (primary outline on base-100), `button-inverse` for ink panels (neutral-content fill), `ghost` and `link`. All {{control}} tall, {{buttonSize}} at weight {{buttonWeight}}, sentence case, {{radiusField}} radius; large buttons widen padding at the same height.
- **Cards.** `card card-border` on base-100 with a hairline, {{cardPadding}} padding; the lead choice card carries a 3 px accent top border. Cards never nest.
- **Kicker and lead.** The kicker is the accent-coloured {{kickerSize}} label above a heading; the lead is {{leadSize}} muted text below it.
- **Inputs.** Field radius, hairline border, {{control}} tall; focus ring 2 px `secondary`.
- **Navigation.** `HWioHeader` with mega panels on wide screens (`desktopFrom="xl"` on sites with five or more items); the current page is marked by a 2 px bar on the header's bottom edge.
- **Bands.** `HWioStatsBand` (hairline top and bottom, vertical dividers, count-up with tabular numerals), `HWioCtaBand`, `HWioLogoStrip`.

## Do's and Don'ts

- Do keep {{fontFamily}} as the only text face; the detector's `overused-font` finding for Inter is waived by owner ruling R14 in `.impeccable/config.json`.
- Do use the theme roles for every colour; don't hard-code hex values in a site.
- Do keep buttons sentence case and {{control}} tall; don't uppercase labels or shrink touch targets below 44 px.
- Do keep dark mode a visitor's choice with the `hwio_theme` memory; don't follow the OS scheme by default (R11).
- Don't add inline styles, `style=` attributes or template-literal class names; `policy-lint` fails them.
- Don't nest cards, add glass or gradient effects, or animate anything above the fold.
- Don't set small body text in the accent colour (R5).
