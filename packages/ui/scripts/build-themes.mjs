// Generates src/styles/themes/<theme>.css (one DaisyUI theme block + theme-scoped extras) from
// the resolved tokens of @hubpav/hwio-brand. Committed output: a token change shows its diff.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const tokens = JSON.parse(readFileSync(join(here, '../../brand/dist/tokens.json'), 'utf8'));
const out = join(here, '../src/styles/themes');
mkdirSync(out, { recursive: true });

// Every theme declares the full set of --hwio-* extras: a theme that does not use one sets it to
// `initial`, so var(--x, fallback) in the components falls back to the pre-guideline look. This keeps
// er3o unchanged when another theme's variables would otherwise reach it by inheritance (the catalog
// renders every theme on one page under a light <html>).
const allExtras = [...new Set(Object.values(tokens.themes).flatMap((t) => Object.keys(t.extras)))].sort();
const BP_ORDER = ['sm', 'md', 'lg', 'xl', '2xl'];

// Typography preset -> custom properties at the base and at each breakpoint where a role steps up.
function typeDecls(preset) {
  const base = [];
  const steps = Object.fromEntries(BP_ORDER.map((bp) => [bp, []]));
  for (const [role, r] of Object.entries(preset.roles)) {
    const v = `--hwio-type-${role}`;
    base.push(`${v}-size: ${r.responsive?.base ?? r.fontSize};`);
    base.push(`${v}-weight: ${r.fontWeight};`);
    if (r.lineHeight !== undefined) base.push(`${v}-leading: ${r.lineHeight};`);
    base.push(`${v}-tracking: ${r.letterSpacing};`);
    if (r.textTransform) base.push(`${v}-case: ${r.textTransform};`);
    for (const bp of BP_ORDER) {
      if (r.responsive?.[bp]) steps[bp].push(`${v}-size: ${r.responsive[bp]};`);
      if (r.from === bp) steps[bp].push(`${v}-size: ${r.fontSize};`);
      if (r.lineHeightSteps?.[bp] !== undefined) steps[bp].push(`${v}-leading: ${r.lineHeightSteps[bp]};`);
    }
  }
  const w = preset.weights;
  base.push(`--hwio-weight-nav: ${w.nav};`, `--hwio-weight-label: ${w.label};`, `--hwio-weight-strong: ${w.strong};`, `--hwio-weight-footer-title: ${w.footerTitle};`);
  for (const [k, v] of Object.entries(preset.vars ?? {})) base.push(`${k}: ${v};`);
  return { base, steps };
}

for (const t of Object.values(tokens.themes)) {
  const font = tokens.fonts.families[t.font];
  const layout = t.layout;
  const roles = Object.entries(t.roles).map(([k, v]) => `  --color-${k}: ${v};`).join('\n');
  const shape = Object.entries(t.shape).map(([k, v]) => `  --${k}: ${v};`).join('\n');
  const scoped = t.default ? `:root, [data-theme="${t.name}"]` : `[data-theme="${t.name}"]`;
  const extras = allExtras.map((k) => `  ${k}: ${t.extras[k] ?? 'initial'};`).join('\n');
  const type = typeDecls(tokens.typography.presets[t.typographyKey]);
  const grid = layout.columns ? `  --hwio-grid-columns: ${layout.columns};\n  --hwio-grid-width: ${layout.width};\n  --hwio-grid-gutter: ${layout.gutter};\n` : '';
  const media = BP_ORDER.filter((bp) => type.steps[bp].length)
    .map((bp) => `@media (width >= ${tokens.breakpoints[bp]}) {\n  ${scoped} {\n${type.steps[bp].map((d) => `    ${d}`).join('\n')}\n  }\n}\n`).join('');
  let css = `/* Generated from brand.json by @hubpav/hwio-ui (scripts/build-themes.mjs). Theme "${t.name}". */
@plugin "daisyui/theme" {
  name: "${t.name}";
  default: ${t.default};
  prefersdark: ${t.prefersdark};
  color-scheme: ${t.scheme};
${roles}
${shape}
}

${scoped} {
  --hwio-font-sans: ${font.stack};
  --hwio-container: ${layout.container};
  --hwio-container-pad: ${layout.pad};
${grid}${extras ? extras + '\n' : ''}  /* Type preset "${t.typographyKey}" */
${type.base.map((d) => `  ${d}`).join('\n')}
}
${media ? '\n' + media : ''}`;
  if (t.prefersdark) {
    css += `
@media (prefers-color-scheme: dark) {
  :root:not([data-theme]) {
    --hwio-font-sans: ${font.stack};
${extras ? extras + '\n' : ''}  }
}
`;
  }
  if (t.name === 'er3o') {
    css += `
/* ENEROOO carries its gradient as a theme rule: DaisyUI slots are single colours. Only the filled
   button gets it; outline, ghost and link variants keep their transparent background. */
[data-theme="er3o"] .btn-primary:not(.btn-outline):not(.btn-ghost):not(.btn-link) {
  background-image: linear-gradient(90deg, var(--er3o-gradient-from), var(--er3o-gradient-to));
  border-color: transparent;
}
/* DaisyUI's hover darkens background-color, which the gradient image covers; dim the gradient instead. */
[data-theme="er3o"] .btn-primary:not(.btn-outline):not(.btn-ghost):not(.btn-link):hover {
  filter: brightness(0.92);
}
/* The outline button reads in the AA teal (the theme's accent, 6.6:1); the filled primary teal is 2.9:1 as text. */
[data-theme="er3o"] .btn-outline.btn-primary:not(:hover):not(:active) {
  color: var(--color-accent);
  border-color: var(--color-accent);
}
[data-theme="er3o"] .er3o-gradient-text {
  background-image: linear-gradient(90deg, var(--er3o-gradient-from), var(--er3o-gradient-to));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
`;
  }
  writeFileSync(join(out, `${t.name}.css`), css);
}
console.log(`ui: ${Object.keys(tokens.themes).length} theme files -> src/styles/themes/`);
