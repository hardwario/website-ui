// Generates dist/design/<theme>.md, a DESIGN.md (YAML frontmatter with machine-readable tokens,
// then the eight canonical sections) for every light theme, from
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
    description: 'Blue for buttons and links, Ink text on a white ground, Red kickers, the Red-to-Sky gradient as the signature; Inter in Regular, Semibold (H2, H3) and Bold; a 12-column 1 280 px grid; hairline structure.',
    northStar: 'Devices that bring industrial assets online',
    overview: 'HARDWARIO designs and manufactures the devices that bring industrial assets online. The web family follows the Brand Guidelines HBG.261028.01 revision 3 (issued 2026-10-30; the rules of revision 2), the master for every HARDWARIO surface: a page is mostly white with Ink type, Blue gives structure (buttons and links), Red marks (kickers) and highlights the one thing per page, and the gradient frames. Web-only rules on top of the guidelines (responsive sizes, breakpoints, states, motion, dark-mode behaviour) are the web layer in website-admin `DESIGN-SYSTEM.md`. This file is regenerated from brand.json, so it matches the shipped tokens.',
    brandRules: '**The Brand Rule.** The Brand Guidelines HBG.261028.01 are the master: nothing on the web contradicts them. Blue `#016ad4` fills buttons and colours links, Ink `#252532` sets text (never pure black), Red `#e30427` marks kickers and the one highlight, and the gradient `linear-gradient(90deg, #e30427, #009cfa)` frames. A web need the guidelines do not cover is a web-layer rule in website-admin `DESIGN-SYSTEM.md`; one that would contradict them goes back to the guidelines as a change request.',
  },
  'hwio-forestry': {
    title: 'HARDWARIO (forestry.report)',
    description: 'The HARDWARIO system with the forestry green as primary and accent; Inter, hairline borders, the 1 280 px grid.',
    northStar: 'Devices that bring industrial assets online, in the forest',
    overview: 'forestry.report is a HARDWARIO landing page for forestry managers. It shares every component, neutral and type rule with the family and swaps the primary and accent roles to the forestry green. The guidelines have no forestry colour and D29 retired the green Forestry Report logo, so whether the report keeps its green is an owner question for its relaunch (PLAN 6.3). This file documents the theme as built and is regenerated from brand.json.',
    brandRules: '**The Brand Rule.** The HARDWARIO logo, Inter and the Brand Guidelines HBG.261028.01 are the identity. The forestry green is a theme role for this vertical (primary and accent), not a brand colour.',
  },
  er3o: {
    title: 'ENEROOO',
    description: 'Teal and green on white with graphite footer, Poppins, pill fields, 24 px card radius.',
    northStar: 'The energy dashboard',
    overview: 'ENEROOO is a separate brand on the shared component system: its palette and Poppins are preserved by owner ruling R7, its footer graphite by R12, and its type ramp is direction A (R9) until its own brand manual is applied (PLAN 4.7). This file records the theme as built.',
    brandRules: '**The Own-Brand Rule.** ENEROOO keeps its palette and Poppins (R7) and its footer graphite (R12). Changes need a screenshot sign-off by the owner.',
  },
};

const ROLE_ORDER = ['primary', 'primary-content', 'secondary', 'secondary-content', 'accent', 'accent-content', 'neutral', 'neutral-content', 'base-100', 'base-200', 'base-300', 'base-content', 'info', 'info-content', 'success', 'success-content', 'warning', 'warning-content', 'error', 'error-content'];

const contentOf = (roles, r) => roles[r.startsWith('base-') ? 'base-content' : `${r}-content`];
const pairName = (r) => (r.startsWith('base-') ? `\`${r}\` / \`base-content\`` : `\`${r}\` / \`${r}-content\``);
const yamlStr = (v) => `"${String(v).replace(/"/g, '\\"')}"`;

export function renderDesignMd(brand, themes, themeName) {
  const t = themes[themeName];
  const meta = PER_THEME[themeName] ?? { title: themeName, description: `${themeName} theme`, northStar: '', overview: '', brandRules: '' };
  const font = brand.fonts.families[t.font];
  const dark = themes[`${themeName}-dark`];
  const type = brand.typography.presets[t.typographyKey].roles;
  const rhythm = brand.rhythm;
  const layout = t.layout;
  const bps = brand.breakpoints;

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
    if (v.lineHeight !== undefined) fm.push(`    lineHeight: ${v.lineHeight}`);
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
  fm.push(`  container: ${yamlStr(layout.container)}`);
  fm.push(`  container-pad: ${yamlStr(layout.pad)}`);
  if (layout.columns) {
    fm.push(`  grid-columns: ${yamlStr(layout.columns)}`);
    fm.push(`  grid-width: ${yamlStr(layout.width)}`);
    fm.push(`  grid-gutter: ${yamlStr(layout.gutter)}`);
  }
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
  const colorsTable = ['| Role | Value | Use |', '|---|---|---|', ...ROLE_ORDER.filter((r) => !r.endsWith('-content')).map((r) => `| ${pairName(r)} | \`${contentOf(t.roles, r)}\` on \`${t.roles[r]}\` | ${(t.guidelines ? ROLE_USE_GUIDELINES : ROLE_USE)[r]} |`)].join('\n');
  const darkSection = dark
    ? `### Dark theme (\`${dark.name}\`)\n\n${t.guidelines ? 'The dark mode of the Brand Guidelines (D35, ratified for the web on 2026-10-29): a near-black ground, Ink surfaces, White text, the light gray for secondary text, Sky for buttons and links, the light red for accents and lighter status colours. ' : ''}The dark pair keeps the same roles; light is the default, visitors choose dark with the theme toggle and the choice is remembered (R11).\n\n${['| Role | Value |', '|---|---|', ...ROLE_ORDER.filter((r) => !r.endsWith('-content')).map((r) => `| ${pairName(r)} | \`${contentOf(dark.roles, r)}\` on \`${dark.roles[r]}\` |`)].join('\n')}`
    : '';
  const typeTable = Object.entries(type).map(([role, v]) => `| ${role} | \`${v.element ?? v.selector}\` | ${v.fontSize} | ${v.fontWeight} | ${v.lineHeight ?? 'inherited'} | ${v.letterSpacing}${v.textTransform && v.textTransform !== 'none' ? `, ${v.textTransform}` : ''} |`).join('\n');
  const at = (bp) => (bp === 'base' ? 'below 48rem' : `from ${bps[bp]}`);
  const responsiveNote = Object.entries(type).filter(([, v]) => v.responsive).map(([role, v]) => `${role}: ${Object.entries(v.responsive).map(([bp, s]) => `${s} ${at(bp)}`).join(', ')}, ${v.fontSize} from ${bps[v.from]}${v.lineHeightSteps ? Object.entries(v.lineHeightSteps).map(([bp, l]) => `, line height ${l} from ${bps[bp]}`).join('') : ''}`).join('; ');
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
    accentData: t.guidelines ? ' In charts and dashboards Red means a failure and nothing else; a highlight there is Navy, the series Blue, Sky and Gray (`--hwio-chart-*`).' : '',
    gradientRule: t.guidelines ? '\n**The Gradient Rule.** `--hwio-gradient` (Red to Sky, 90°) frames: a band along an edge, a short rule under a title, the strip on top of a card. `--hwio-gradient-figure` (its left three quarters) fills the one key figure of a page, 28 pt and up. Never behind body text, tables or photographs, never on icons, never reversed or vertical.\n' : '',
    layoutNote: layout.columns
      ? `Twelve columns, ${layout.width} wide, with ${layout.gutter} gutters (Brand Guidelines chapter 05): the container is ${layout.container} including its ${layout.pad} margin on each side, so the content box is the guidelines' ${layout.width} grid. Content sits flush to the margins; nothing floats in from them.`
      : `One container, ${layout.container} wide with ${layout.pad} side padding.`,
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
    kickerStyle: type.kicker.textTransform === 'uppercase' ? `Bold caps (${type.kicker.letterSpacing} tracking)` : 'sentence case',
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

const ROLE_USE_GUIDELINES = {
  primary: 'buttons, the current-page marker, active states (Blue; Sky in dark)',
  secondary: 'focus ring, dark grounds (Navy; Sky in dark)',
  accent: 'kickers and the one highlight per page; never large fills, never small body text',
  neutral: 'Ink panels and the footer',
  'base-100': 'page ground',
  'base-200': 'Panel: cards, zones, alternate sections',
  'base-300': 'Hairline: rules and thin frames',
  info: 'info: a note, nothing to do (Blue, a proposal in the guidelines, D34)',
  success: 'done, passed, in limits',
  warning: 'attention, at risk; never a ground for text (White 3.8:1, Ink 3.9:1)',
  error: 'failed, critical, stop; in charts the only use of Red',
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
