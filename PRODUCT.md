<!-- impeccable:product-schema 1 -->
# PRODUCT.md: the HARDWARIO web design system

Durable product truth for `hardwario/website-ui`, read by the impeccable design plugin before any design work. The system is a product whose users are the people and agents who build the HARDWARIO websites; the sites themselves carry their own `PRODUCT.md` with the division's audience.

## Platform

Web. Astro 7 static sites on Cloudflare Workers with static assets, Tailwind 4 and DaisyUI 5. Packages: `@hubpav/hwio-brand` (tokens, fonts, logos, sites registry, generated DESIGN.md), `@hubpav/hwio-ui` (Astro components and themes), `@hubpav/hwio-web-runtime` (consent, forms, theme, behaviours), `@hubpav/hwio-web-worker` (Worker handler and `_headers`). Component catalog at https://ui.hardwario.com (noindex).

## Users

Website administrators and coding agents working from the `hardwario/website-admin` control repository, and the HARDWARIO team reviewing the result. They build and maintain nine public sites in five languages (EN, CS, DE, SK, PL) from one shared vocabulary. They are engineers, not designers; the system has to make the good choice the default one.

## Product Purpose

One visual and behavioural system for every HARDWARIO-branded site, so a change is made once (a token or a component) and reaches the whole family, and so every site reads as the same company: industrial IoT hardware designed and built in Europe.

## Positioning

Not a generic UI kit. The components carry HARDWARIO's own compositions (hero, stats band, choice cards, process steps, contact with HubSpot and Turnstile) and its rules (font gate, consent, theme memory, security headers). The 2026 redesign replaces the visual world of these components; it does not replace the system.

## Operating Context

Sites are read on the desk of a system integrator, a plant or facility manager, an engineering buyer, a teacher, mostly on desktop in daylight, often on mobile from a plant floor or a classroom. Reading, comparing and deciding whether to contact HARDWARIO are the tasks; forms are the conversion. Real-user Core Web Vitals are "good" on every site and must stay so.

## Capabilities and Constraints

- Fixed by owner ruling R14 (2026-09-07): the HARDWARIO logo, red `#e30427`, navy `#06367a`, Inter. Everything else is open to the redesign.
- Binding rules: `font-display: block` with the pre-paint font gate (R3); sentence-case buttons (R4); muted text darkened only, red never for small body text (R5); light is the default theme, dark by choice with `hwio_theme` memory (R11); WCAG AA contrast; the dash rule and brand naming in copy; analytics only on the four sites that have it.
- Copy is open to rewriting within `PRODUCT-CLAIMS.md`, `ENGINEERING-CLAIMS.md` and `BRAND-VOICE.md` (R15); press releases are content-immutable; every EN change lands in all locales in the same commit.
- Naming: `hwio` / `HWio` prefixes on shared names, `er3o` for ENEROOO; no `hw-`; no inline styles or template-literal class names (`policy-lint`).
- ENEROOO (`er3o` theme) is a separate brand on the same components: palette and Poppins preserved (R7), footer graphite (R12); out of the 2026 redesign (R13).

## Brand Commitments

Expert, clear, straight, enabling voice (`BRAND-VOICE.md`); serious register, warmth only on Academy; factual self-description, never self-awarded rank; "Designed and built in Europe" as the footer line. Logo: the red H mark with the HARDWARIO wordmark; division sites add a spaced word (ENGINEERING, STUDIO, ACADEMY).

## Evidence on Hand

Live sites at www.hardwario.com, hardwario.engineering, hardwario.studio, hardwario.academy, energeticky.report, facility.report, factory.report, forestry.report; the catalog at ui.hardwario.com; the program record in `website-admin/DESIGN-SYSTEM.md`; today's detector baselines and screenshots in `website-admin/design/redesign/before/`.

## Product Principles

- Structure over decoration: hairlines, surface shifts and type carry hierarchy.
- Copy is the product: components show the site's own words.
- One change, every site: tokens and components live here, never site-local.
- Nothing merges to a site's `main` without the owner's word.

## Accessibility & Inclusion

WCAG 2.2 AA contrast on every theme including dark; keyboard-complete header and forms; visible focus ring; reduced-motion respected; five languages with long CS/DE/PL strings tested in every component; touch targets 44 px or larger.
