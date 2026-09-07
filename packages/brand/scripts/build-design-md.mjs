// Generates dist/design/<theme>.md, a DESIGN.md (https://impeccable.style format: YAML frontmatter
// with machine-readable tokens, then the eight canonical sections) for every light theme, from
// brand.json and the prose template src/design/body.md. Also copies the default theme's file to
// the repo root DESIGN.md. Sites copy their theme's file with website-admin's scripts/design-sync.sh.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const repoRoot = join(root, '..', '..');

const PER_THEME = {
  hwio: {
    title: 'HARDWARIO',
    description: 'Navy and red on white with sky panels, Inter, hairline borders, 8 px rhythm, 48 px controls, sentence-case red kickers.',
    northStar: 'The instrument panel',
    overview: 'HARDWARIO sells industrial IoT hardware to system integrators, engineers, schools and plant operators. The web family reads like a well-made instrument: calm white ground, navy for what acts, one red mark for what matters, generous measure and no decoration that does not carry information. This file documents the system as built on 2026-09-07 (direction A, "www systematised"); the 2026 redesign evolves everything but the fixed constraints below and rewrites this file from the built world.',
    brandRules: '**The Fixed Four Rule.** The HARDWARIO logo, red `#e30427`, navy `#06367a` and Inter do not change (owner ruling R14, 2026-09-07). Every other token, surface, composition and motion decision is open to the redesign.',
  },
  'hwio-forestry': {
    title: 'HARDWARIO (forestry.report)',
    description: 'The HARDWARIO system with the forestry green as primary and accent; Inter, hairline borders, 8 px rhythm, 48 px controls.',
    northStar: 'The instrument panel, in the forest',
    overview: 'forestry.report is a HARDWARIO landing page for forestry managers. It shares every component and rule with the family and swaps the primary and accent roles to the forestry green so the vertical is recognisable at a glance. This file documents the system as built on 2026-09-07; the 2026 redesign evolves everything but the fixed constraints below.',
    brandRules: '**The Fixed Four Rule.** The HARDWARIO logo, red `#e30427` (kept in the brand mark), navy `#06367a` and Inter do not change (owner ruling R14, 2026-09-07). The forestry green is a theme role, not a brand colour, and may be re-weighted by the redesign.',
  },
  er3o: {
    title: 'ENEROOO',
    description: 'Teal and green on white with graphite footer, Poppins, pill fields, 24 px card radius.',
    northStar: 'The energy dashboard',
    overview: 'ENEROOO is a separate brand on the shared component system: its palette and Poppins are preserved by owner ruling R7 and its footer graphite by R12. It is not part of the 2026 HARDWARIO redesign (R13); this file records the theme as built.',
    brandRules: '**The Own-Brand Rule.** ENEROOO keeps its palette and Poppins (R7) and its footer graphite (R12). Changes need a screenshot sign-off by the owner.',
  },
};

const ROLE_ORDER = ['primary', 'primary-content', 'secondary', 'secondary-content', 'accent', 'accent-content', 'neutral', 'neutral-content', 'base-100', 'base-200', 'base-300', 'base-content', 'info', 'info-content', 'success', 'success-content', 'warning', 'warning-content', 'error', 'error-content'];

const yamlStr = (v) => `"${String(v).replace(/"/g, '\\"')}"`;

export function renderDesignMd(brand, themes, themeName) {
  const t = themes[themeName];
  const meta = PER_THEME[themeName] ?? { title: themeName, description: `${themeName} theme`, northStar: '', overview: '', brandRules: '' };
  const font = brand.fonts.families[t.font];
  const dark = themes[`${themeName}-dark`];
  const type = brand.typography.roles;
  const rhythm = brand.rhythm;
  const layout = brand.layout;

  // ---- frontmatter ----
  const fm = [];
  fm.push('---');
  fm.push(`name: ${yamlStr(meta.title)}`);
  fm.push(`description: ${yamlStr(meta.description + ' Generated from @hubpav/hwio-brand; the source of truth is brand.json.')}`);
  fm.push('colors:');
  for (const r of ROLE_ORDER) fm.push(`  ${r}: ${yamlStr(t.roles[r])}`);
  fm.push('typography:');
  for (const [role, v] of Object.entries(type)) {
    fm.push(`  ${role}:`);
    fm.push(`    fontFamily: ${yamlStr(font.stack)}`);
    fm.push(`    fontSize: ${yamlStr(v.fontSize)}`);
    fm.push(`    fontWeight: ${v.fontWeight}`);
    fm.push(`    lineHeight: ${v.lineHeight}`);
    fm.push(`    letterSpacing: ${yamlStr(v.letterSpacing)}`);
  }
  fm.push('rounded:');
  fm.push(`  selector: ${yamlStr(t.shape['radius-selector'])}`);
  fm.push(`  field: ${yamlStr(t.shape['radius-field'])}`);
  fm.push(`  box: ${yamlStr(t.shape['radius-box'])}`);
  fm.push('spacing:');
  fm.push(`  unit: ${yamlStr(rhythm.unit)}`);
  fm.push(`  section: ${yamlStr(rhythm.section.base)}`);
  fm.push(`  section-lg: ${yamlStr(rhythm.section.lg)}`);
  fm.push(`  section-compact: ${yamlStr(rhythm.sectionCompact.base)}`);
  fm.push(`  section-compact-lg: ${yamlStr(rhythm.sectionCompact.lg)}`);
  fm.push(`  container-hub: ${yamlStr(layout.hub.container)}`);
  fm.push(`  container-landing: ${yamlStr(layout.landing.container)}`);
  fm.push(`  container-pad: ${yamlStr(layout.hub.pad)}`);
  fm.push(`  control: ${yamlStr(rhythm.control)}`);
  fm.push(`  card-padding: ${yamlStr(rhythm.cardPadding)}`);
  fm.push('components:');
  const comp = (name, props) => { fm.push(`  ${name}:`); for (const [k, v] of Object.entries(props)) fm.push(`    ${k}: ${yamlStr(v)}`); };
  comp('button-primary', { backgroundColor: '{colors.primary}', textColor: '{colors.primary-content}', typography: '{typography.button}', rounded: '{rounded.field}', height: rhythm.control });
  comp('button-secondary', { backgroundColor: '{colors.base-100}', textColor: '{colors.primary}', typography: '{typography.button}', rounded: '{rounded.field}', height: rhythm.control });
  comp('button-inverse', { backgroundColor: '{colors.neutral-content}', textColor: '{colors.neutral}', typography: '{typography.button}', rounded: '{rounded.field}', height: rhythm.control });
  comp('card', { backgroundColor: '{colors.base-100}', textColor: '{colors.base-content}', rounded: '{rounded.box}', padding: rhythm.cardPadding });
  comp('input', { backgroundColor: '{colors.base-100}', textColor: '{colors.base-content}', typography: '{typography.body}', rounded: '{rounded.field}', height: rhythm.control });
  comp('kicker', { textColor: '{colors.accent}', typography: '{typography.kicker}' });
  comp('chip', { backgroundColor: '{colors.base-200}', textColor: '{colors.base-content}', typography: '{typography.kicker}', rounded: '{rounded.selector}' });
  fm.push('---');

  // ---- body ----
  const colorsTable = ['| Role | Value | Use |', '|---|---|---|', ...ROLE_ORDER.filter((r) => !r.endsWith('-content')).map((r) => `| \`${r}\` / \`${r}-content\` | \`${t.roles[r]}\` on \`${t.roles[`${r}-content`]}\` | ${ROLE_USE[r]} |`)].join('\n');
  const darkSection = dark
    ? `### Dark theme (\`${dark.name}\`)\n\nThe dark pair keeps the same roles; visitors choose it with the theme toggle and the choice is remembered (R11). The primary lifts to the light brand blue with dark content so filled and outline buttons stay legible (R10).\n\n${['| Role | Value |', '|---|---|', ...ROLE_ORDER.filter((r) => !r.endsWith('-content')).map((r) => `| \`${r}\` / \`${r}-content\` | \`${dark.roles[r]}\` on \`${dark.roles[`${r}-content`]}\` |`)].join('\n')}`
    : '';
  const typeTable = Object.entries(type).map(([role, v]) => `| ${role} | \`${v.element ?? v.selector}\` | ${v.fontSize} | ${v.fontWeight} | ${v.lineHeight} | ${v.letterSpacing} |`).join('\n');
  const responsiveNote = Object.entries(type).filter(([, v]) => v.responsive).map(([role, v]) => `${role}: ${Object.entries(v.responsive).map(([bp, s]) => `${s} at ${bp}`).join(', ')}, ${v.fontSize} from 64rem`).join('; ');
  const vars = {
    name: meta.title,
    themeName,
    northStar: meta.northStar,
    overview: meta.overview,
    brandRules: meta.brandRules,
    fontFamily: font.family,
    colorsTable,
    darkSection,
    typeTable,
    responsiveNote,
    containerHub: layout.hub.container,
    containerLanding: layout.landing.container,
    containerPad: layout.hub.pad,
    sectionRhythm: `${rhythm.section.base} (${rhythm.section.lg} from 64rem)`,
    sectionCompact: `${rhythm.sectionCompact.base} (${rhythm.sectionCompact.lg} from 64rem)`,
    radiusField: t.shape['radius-field'],
    radiusBox: t.shape['radius-box'],
    radiusSelector: t.shape['radius-selector'],
    control: rhythm.control,
    cardPadding: rhythm.cardPadding,
    buttonSize: type.button.fontSize,
    buttonWeight: String(type.button.fontWeight),
    kickerSize: type.kicker.fontSize,
    leadSize: type.lead.fontSize,
  };
  const body = readFileSync(join(root, 'src/design/body.md'), 'utf8').replace(/\{\{(\w+)\}\}/g, (m, k) => {
    if (!(k in vars)) throw new Error(`design body.md: unknown placeholder ${k}`);
    return vars[k];
  });
  const header = `<!-- Generated from @hubpav/hwio-brand (theme ${themeName}) by packages/brand/scripts/build-design-md.mjs. Do not edit in a site: change packages/brand/src in hardwario/website-ui, publish, then run scripts/design-sync.sh in website-admin. -->\n`;
  return `${fm.join('\n')}\n${header}\n# ${meta.title} design system\n\n${body}`;
}

const ROLE_USE = {
  primary: 'buttons, active states, links in navigation',
  secondary: 'focus ring, secondary emphasis',
  accent: 'kicker, current-page marker, inline links; never large fills',
  neutral: 'ink panels and the footer',
  'base-100': 'page ground',
  'base-200': 'alternate section surface',
  'base-300': 'hairline borders',
  info: 'informational badges',
  success: 'form success',
  warning: 'warnings',
  error: 'form errors',
};

export function buildDesignMd(brand, themes, dist) {
  mkdirSync(join(dist, 'design'), { recursive: true });
  const written = [];
  for (const name of Object.keys(themes)) {
    if (themes[name].scheme !== 'light') continue;
    const md = renderDesignMd(brand, themes, name);
    writeFileSync(join(dist, 'design', `${name}.md`), md);
    written.push(name);
    if (themes[name].default) writeFileSync(join(repoRoot, 'DESIGN.md'), md);
  }
  return written;
}
