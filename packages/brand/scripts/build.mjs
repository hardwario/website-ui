// Generates every derived brand artifact from src/brand.json into dist/.
// Outputs: tokens.json (resolved themes), vars.css (plain --hwio-* custom properties),
// docusaurus.css (--ifm-* mapping), fonts/*.css + copied woff2, sites.js (+ .d.ts).
import { mkdirSync, readFileSync, writeFileSync, copyFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const brand = JSON.parse(readFileSync(join(root, 'src/brand.json'), 'utf8'));
const dist = join(root, 'dist');
mkdirSync(join(dist, 'fonts'), { recursive: true });

// ---- colour helpers -------------------------------------------------------
const hexToRgb = (hex) => {
  const h = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
};
const rgbToHex = (rgb) => '#' + rgb.map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')).join('');
const mix = (hex, target, amount) => {
  const a = hexToRgb(hex), b = hexToRgb(target);
  return rgbToHex(a.map((v, i) => v + (b[i] - v) * amount));
};

// ---- resolve themes (inheritance + palette lookups) -----------------------
export function resolveTheme(name, themes = brand.themes, palette = brand.palette, seen = []) {
  const t = themes[name];
  if (!t) throw new Error(`unknown theme ${name}`);
  if (seen.includes(name)) throw new Error(`theme cycle at ${name}`);
  const base = t.extends ? resolveTheme(t.extends, themes, palette, [...seen, name]) : { roles: {}, extras: {} };
  const roles = { ...base.roles };
  for (const [slot, key] of Object.entries(t.roles ?? {})) {
    if (!(key in palette)) throw new Error(`theme ${name}: role ${slot} references unknown palette key ${key}`);
    roles[slot] = palette[key];
  }
  const required = ['base-100', 'base-200', 'base-300', 'base-content', 'primary', 'primary-content', 'secondary', 'secondary-content', 'accent', 'accent-content', 'neutral', 'neutral-content', 'info', 'info-content', 'success', 'success-content', 'warning', 'warning-content', 'error', 'error-content'];
  for (const slot of required) if (!roles[slot]) throw new Error(`theme ${name}: missing role ${slot}`);
  return {
    name,
    scheme: t.scheme ?? base.scheme ?? 'light',
    default: t.default ?? false,
    prefersdark: t.prefersdark ?? false,
    font: t.font ?? base.font,
    shape: brand.shape[t.shape ?? base.shapeKey ?? 'hwio'],
    shapeKey: t.shape ?? base.shapeKey ?? 'hwio',
    roles,
    extras: { ...base.extras, ...(t.extras ?? {}) },
  };
}

const themes = Object.fromEntries(Object.keys(brand.themes).map((n) => [n, resolveTheme(n)]));

// ---- tokens.json ----------------------------------------------------------
writeFileSync(join(dist, 'tokens.json'), JSON.stringify({
  palette: brand.palette,
  themes,
  layout: brand.layout,
  fonts: brand.fonts,
  logos: brand.logos,
  footerSites: brand.footerSites,
  sites: brand.sites,
  social: brand.social,
  branches: brand.branches,
}, null, 2) + '\n');

// ---- vars.css: plain custom properties for non-Tailwind consumers ----------
let vars = '/* Generated from brand.json by @hubpav/hwio-brand. Plain --hwio-* custom properties per theme. */\n';
for (const t of Object.values(themes)) {
  const font = brand.fonts.families[t.font];
  const decls = [
    `color-scheme: ${t.scheme};`,
    ...Object.entries(t.roles).map(([k, v]) => `--hwio-color-${k}: ${v};`),
    ...Object.entries(t.shape).map(([k, v]) => `--hwio-${k}: ${v};`),
    `--hwio-font-sans: ${font.stack};`,
    ...Object.entries(t.extras).map(([k, v]) => `${k}: ${v};`),
  ];
  const selector = t.default ? `:root, [data-theme="${t.name}"]` : `[data-theme="${t.name}"]`;
  vars += `${selector} {\n  ${decls.join('\n  ')}\n}\n`;
}
writeFileSync(join(dist, 'vars.css'), vars);

// ---- docusaurus.css: Infima mapping (tokens-only adoption for docs/stem) ---
{
  const light = themes.hwio, dark = themes['hwio-dark'];
  const font = brand.fonts.families.inter;
  const shades = (p) => [
    `--ifm-color-primary: ${p};`,
    `--ifm-color-primary-dark: ${mix(p, '#000000', 0.1)};`,
    `--ifm-color-primary-darker: ${mix(p, '#000000', 0.15)};`,
    `--ifm-color-primary-darkest: ${mix(p, '#000000', 0.25)};`,
    `--ifm-color-primary-light: ${mix(p, '#ffffff', 0.1)};`,
    `--ifm-color-primary-lighter: ${mix(p, '#ffffff', 0.15)};`,
    `--ifm-color-primary-lightest: ${mix(p, '#ffffff', 0.3)};`,
  ];
  // Docs keep brand red as the Infima primary (links, active sidebar item), which is the
  // status quo there; the six shade variants were Docusaurus teal before this file existed.
  const css = `/* Generated from brand.json by @hubpav/hwio-brand: Infima variables for the Docusaurus sites. */
:root {
  ${shades(light.roles.accent).join('\n  ')}
  --ifm-color-secondary: ${light.roles.secondary};
  --ifm-font-family-base: ${font.stack};
  --ifm-font-color-base: ${light.roles['base-content']};
  --ifm-background-color: ${light.roles['base-100']};
  --ifm-code-font-size: 95%;
  --hwio-color-ink: ${brand.palette.ink};
  --hwio-color-muted: ${brand.palette.muted};
}
[data-theme='dark'] {
  ${shades(dark.roles.accent).join('\n  ')}
  --ifm-background-color: ${dark.roles['base-100']};
  --ifm-background-surface-color: ${dark.roles['base-200']};
  --ifm-font-color-base: ${dark.roles['base-content']};
}
`;
  writeFileSync(join(dist, 'docusaurus.css'), css);
}

// ---- fonts: @font-face CSS + woff2 copies ----------------------------------
for (const [key, f] of Object.entries(brand.fonts.families)) {
  const faces = f.faces.map((face) => {
    const src = join(root, 'fonts', face.file);
    if (!existsSync(src)) throw new Error(`font file missing: fonts/${face.file}`);
    copyFileSync(src, join(dist, 'fonts', face.file));
    return `@font-face {
  font-family: '${f.family}';
  font-style: normal;
  font-weight: ${face.weight ?? f.weight};
  font-display: ${brand.fonts.display};
  src: url('/fonts/${face.file}') format('${f.format}');
  unicode-range: ${face.unicodeRange};
}`;
  });
  const fb = f.fallback;
  const overrides = [['size-adjust', fb.sizeAdjust], ['ascent-override', fb.ascent], ['descent-override', fb.descent], ['line-gap-override', fb.lineGap]]
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join('\n');
  const fallback = `@font-face {
  font-family: '${fb.family}';
  src: local('${fb.local}');
${overrides}
}`;
  writeFileSync(join(dist, 'fonts', `${key}.css`), `/* Generated from brand.json. Owner ruling R3 (2026-09-05): font-display ${brand.fonts.display}; the pre-paint gate (HWioFontGate) keeps text invisible until the face decodes. Files live at /fonts/ in every site. */\n${faces.join('\n')}\n${fallback}\n`);
}

// ---- sites.js: registry + footer strip helpers -----------------------------
copyFileSync(join(root, 'src/sites.js'), join(dist, 'sites.js'));
copyFileSync(join(root, 'src/sites.d.ts'), join(dist, 'sites.d.ts'));
writeFileSync(join(dist, 'sites-data.js'), `// Generated from brand.json.\nexport const sites = ${JSON.stringify(brand.sites)};\nexport const footerSites = ${JSON.stringify(brand.footerSites)};\nexport const social = ${JSON.stringify(brand.social)};\nexport const branches = ${JSON.stringify(brand.branches)};\n`);

console.log(`brand: ${Object.keys(themes).length} themes, ${Object.keys(brand.fonts.families).length} font families, ${brand.sites.length} sites -> dist/`);
