# website-ui

The HARDWARIO web design system. Public repo; four npm packages under the owner's scope plus a
private catalog. The program plan, owner rulings and rollout phases live in the private
`website-admin` repository (`DESIGN-SYSTEM.md`); this file is what an agent needs to work here.

## Packages

| Path | Package | What it owns |
|---|---|---|
| `packages/brand` | `@hubpav/hwio-brand` | `src/brand.json` is the source of truth: palette, theme roles (DaisyUI slots), shape, fonts, layout presets, sites registry, footer-strip rules. `npm run build` generates `dist/` (tokens.json, vars.css, docusaurus.css, fonts/*.css + woff2, sites.js). Zero dependencies. |
| `packages/ui` | `@hubpav/hwio-ui` | Astro components `src/components/HWio*.astro`, `styles.css` (Tailwind 4 entry with the DaisyUI plugin and `@source` for the components), `prose.css`, generated `themes/*.css`, `types.ts`, `schemas.ts`, `html.ts`, `integration.mjs` (`hwioUi()`). |
| `packages/web-runtime` | `@hubpav/hwio-web-runtime` | Framework-free browser modules (consent, forms, turnstile, attribution, theme, track, reveal, counter, nav, accordion) and `inline` (static bootstrap scripts + SHA-256 hashes). Pure logic in `*-core.ts` is unit-tested with `node --test`. |
| `packages/web-worker` | `@hubpav/hwio-web-worker` | `hwioWorker()` fetch handler and the security-header / `_headers` builder. |
| `catalog` | private | Every component under every theme (`/<theme>/`, `/<theme>/<fixture>/`), Playwright visual regression, deployed noindex to ui.hardwario.com. |

Generated files are committed (`packages/brand/dist` is not; it is rebuilt), so a token change
shows its downstream diff in `packages/ui/src/styles/themes/*.css`.

## Rules

- **Naming.** The HARDWARIO abbreviation is `hwio` (`HWio` in PascalCase), never `hw`. ENEROOO
  names use `er3o` / `ER3o`. Prefix component files and tags, exported types and functions,
  our CSS variables and classes (`--hwio-*`, `.hwio-*`), theme names, `data-hwio-*` attributes,
  globals and storage keys. Do not prefix props and slots. Kept as external contracts:
  `data-track` / `data-track-location`, `data-hs-*` form hooks, the dataLayer event names.
  Legacy `hw_` reads are allowed only on lines marked `legacy-ok`; `npm run lint` enforces it.
- **Components carry no copy.** Every visible string, aria label included, is a prop or slot.
  Sites own their dictionaries. Button labels follow the owner rule (imperative verb, no
  article) but that is the site's job.
- **Build-time CSS only.** No `style=` attributes, no `define:vars`, no inline `<style>` outside
  `HWioSeoHead` / `HWioFontGate`. Literal class strings selected from `as const` lookup maps,
  never template-literal class names (Tailwind must see them). The lint checks all of this.
- **Runtime behaviours** register through `hwioMount(name, { bind, cleanup })`, mark bound
  nodes with `data-hwio-<name>-bound`, and never touch `window` at import time.
- **Inline bootstraps** (`packages/web-runtime/scripts/inline-scripts.mjs`) must stay static:
  anything per site is read from `data-hwio-*` attributes on `<html>` (see `hwioHtmlAttrs`).
- **Owner rulings baked in** (2026-09-05): navy `#06367a` primary with red `#e30427` accent;
  dark mode as `hwio-dark` on the Zola neutral palette; `font-display: block` plus the
  pre-paint font gate; sentence-case buttons; enerooo keeps its palette and Poppins on `er3o`.
  Changing any of these is a `brand.json` edit plus an owner ruling in `website-admin`.

## Working here

- `npm ci`, then `npm run check` (lint, build, tests). `npm run dev -w catalog` for the catalog.
- Update VRT baselines after a deliberate visual change: push a commit whose message contains
  `[vrt-update]`; CI regenerates the screenshots in its Linux image and uploads them as the
  `vrt-baselines` artifact; download it into `catalog/tests/__screenshots__` and commit
  (`gh run download <run id> -n vrt-baselines -D catalog/tests/__screenshots__`). Never generate
  baselines on macOS. The `VRT baselines` dispatch workflow becomes usable once it is on `main`.
- Add a component: `packages/ui/src/components/HWioName.astro` + a fixture in
  `catalog/src/fixtures/` registered in `catalog/src/fixtures/index.ts`; run `astro check` in
  the catalog and the VRT before opening a PR.
- Add or change a token: edit `packages/brand/src/brand.json`, `npm run build`, commit the
  regenerated theme files with it.
- Release: `npm run changeset` (the four packages are a fixed version group), merge to `main`,
  merge the "Version Packages" PR; the release workflow publishes with npm trusted publishing.
- Program work lands on `design-system` branches; nothing merges to `main` without the owner.
