# website-ui

Design system for the HARDWARIO websites: brand tokens, DaisyUI 5 themes, Astro components and
the shared web runtime, published as `@hubpav/hwio-*` npm packages.

| Package | Purpose |
|---|---|
| `@hubpav/hwio-brand` | brand.json source of truth → tokens, CSS variables, Docusaurus mapping, fonts, logos, sites registry |
| `@hubpav/hwio-ui` | Tailwind 4 + DaisyUI 5 entry stylesheet, generated themes, `HWio*` Astro components, `hwioUi()` integration |
| `@hubpav/hwio-web-runtime` | consent (Consent Mode v2, GTM), HubSpot forms with Turnstile, attribution, theme, tracking, behaviours |
| `@hubpav/hwio-web-worker` | Cloudflare Worker handler and `_headers` / CSP builder |

Catalog: every component under every theme, at ui.hardwario.com (noindex).

Status: scaffolding on the `design-system` branch; not yet released. Conventions for
contributors and agents are in `AGENTS.md`. Code is MIT; HARDWARIO brand assets are trademarks
(see `LICENSE`).
