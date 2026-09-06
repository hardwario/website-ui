// Generates src/styles/themes/<theme>.css (one DaisyUI theme block + theme-scoped extras) from
// the resolved tokens of @hubpav/hwio-brand. Committed output: a token change shows its diff.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const tokens = JSON.parse(readFileSync(join(here, '../../brand/dist/tokens.json'), 'utf8'));
const out = join(here, '../src/styles/themes');
mkdirSync(out, { recursive: true });

for (const t of Object.values(tokens.themes)) {
  const font = tokens.fonts.families[t.font];
  const layout = tokens.layout.hub;
  const roles = Object.entries(t.roles).map(([k, v]) => `  --color-${k}: ${v};`).join('\n');
  const shape = Object.entries(t.shape).map(([k, v]) => `  --${k}: ${v};`).join('\n');
  const scoped = t.default ? `:root, [data-theme="${t.name}"]` : `[data-theme="${t.name}"]`;
  const extras = Object.entries(t.extras).map(([k, v]) => `  ${k}: ${v};`).join('\n');
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
${extras ? extras + '\n' : ''}}
`;
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
