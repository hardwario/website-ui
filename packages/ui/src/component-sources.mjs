// Tailwind scans the package's components through `@source "../components"` in styles.css, so a
// page used to carry DaisyUI and utility rules for every HWio component, rendered or not. The
// Vite plugin below appends `@source not` lines for the components a site never imports to the
// site's entry stylesheet (the one that imports `@hubpav/hwio-ui/styles.css`). It keeps every
// component when it cannot be sure: no import found, or an import it cannot read literally.
import { existsSync, readdirSync, readFileSync, realpathSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export const HWIO_COMPONENTS_DIR = fileURLToPath(new URL('./components/', import.meta.url));

const ENTRY_IMPORT = /@import\s+(?:url\()?["']@hubpav\/hwio-ui\/styles\.css["']/;
const LITERAL_IMPORT = /@hubpav\/hwio-ui\/components\/(HWio[A-Za-z0-9]+)\.astro/g;
const ANY_IMPORT = /@hubpav\/hwio-ui\/components\//g;
const LOCAL_IMPORT = /from\s+["']\.\/(HWio[A-Za-z0-9]+)\.astro["']/g;
// Plain Markdown cannot import a component; MDX can.
const SCAN_EXT = /\.(astro|[cm]?[jt]sx?|mdx|svelte|vue)$/;
const SKIP_DIRS = new Set(['node_modules', 'dist', '.astro', '.git', '.wrangler', 'public']);

/** Component name -> the components it imports, read from the package's own sources. */
export function hwioComponentGraph(dir = HWIO_COMPONENTS_DIR) {
  const graph = new Map();
  for (const file of readdirSync(dir)) {
    if (!file.endsWith('.astro')) continue;
    const source = readFileSync(join(dir, file), 'utf8');
    graph.set(file.slice(0, -'.astro'.length), new Set(Array.from(source.matchAll(LOCAL_IMPORT), (m) => m[1])));
  }
  return graph;
}

/**
 * The components to leave out of the scan, given the text of every file that may import one.
 * Returns null (scan everything) when nothing imports a component or an import is not a literal
 * `@hubpav/hwio-ui/components/HWioName.astro` path (a computed path could name any of them).
 */
export function hwioUnusedComponents(texts, graph = hwioComponentGraph()) {
  const used = new Set();
  for (const text of texts) {
    const literal = Array.from(text.matchAll(LITERAL_IMPORT), (m) => m[1]);
    if (Array.from(text.matchAll(ANY_IMPORT)).length !== literal.length) return null;
    literal.forEach((name) => used.add(name));
  }
  if (!used.size || [...used].some((name) => !graph.has(name))) return null;
  const stack = [...used];
  while (stack.length) {
    for (const dep of graph.get(stack.pop()) ?? []) {
      if (!used.has(dep)) { used.add(dep); stack.push(dep); }
    }
  }
  return [...graph.keys()].filter((name) => !used.has(name)).sort();
}

function walk(dir, out) {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walk(path, out);
    else if (entry.isFile() && SCAN_EXT.test(entry.name)) out.push(path);
  }
  return out;
}

/** Real directory of an installed dependency, looked up the way Node does (walking up). */
function packageDir(name, from) {
  for (let dir = from; ; dir = dirname(dir)) {
    const candidate = join(dir, 'node_modules', name);
    if (existsSync(candidate)) return realpathSync(candidate);
    if (dirname(dir) === dir) return null;
  }
}

/**
 * Where a site's component imports can live: the project, every local (workspace or `file:`)
 * dependency, and every directory the entry stylesheet itself registers with `@source`.
 */
export function hwioScanRoots(root, cssFile, css) {
  const roots = new Set([root]);
  try {
    const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
    for (const name of Object.keys({ ...pkg.dependencies, ...pkg.devDependencies })) {
      if (name.startsWith('@hubpav/hwio-')) continue; // the design system itself (linked in its own workspace)
      const dir = packageDir(name, root);
      if (dir && !dir.split(sep).includes('node_modules')) roots.add(dir);
    }
  } catch { /* no package.json: the project alone */ }
  for (const m of css.matchAll(/@source\s+(?!not\b)(?!inline\()["']([^"']+)["']/g)) {
    const dir = resolve(dirname(cssFile), m[1]);
    if (!dir.split(sep).includes('node_modules') && existsSync(dir)) roots.add(statSync(dir).isDirectory() ? dir : dirname(dir));
  }
  return [...roots];
}

/**
 * Vite plugin: a `load` hook, so it works whatever order the Tailwind plugin runs in (Tailwind
 * transforms the entry stylesheet after it is loaded and reads its @imports from disk itself).
 * @param {{ root: string, logger?: { info: (msg: string) => void } }} options
 */
export function hwioComponentSourcesPlugin({ root, logger }) {
  const graph = hwioComponentGraph();
  const reported = new Set();
  return {
    name: '@hubpav/hwio-ui:component-sources',
    enforce: 'pre',
    load(id) {
      const file = id.split('?')[0];
      if (!file.endsWith('.css') || file.split(sep).includes('node_modules') || !existsSync(file)) return null;
      const css = readFileSync(file, 'utf8');
      if (!ENTRY_IMPORT.test(css)) return null;
      const files = [...new Set(hwioScanRoots(root, file, css).flatMap((dir) => walk(dir, [])))];
      for (const f of files) this.addWatchFile?.(f);
      const unused = hwioUnusedComponents(files.map((f) => readFileSync(f, 'utf8')), graph);
      if (!reported.has(file)) {
        reported.add(file);
        logger?.info(unused
          ? `Tailwind scans ${graph.size - unused.length} of ${graph.size} HWio components (${relative(root, file)})`
          : `Tailwind scans all ${graph.size} HWio components (${relative(root, file)})`);
      }
      if (!unused?.length) return null;
      const lines = unused.map((name) => `@source not "${relative(dirname(file), join(HWIO_COMPONENTS_DIR, `${name}.astro`)).split(sep).join('/')}";`);
      return `${css}\n/* @hubpav/hwio-ui: components this site never imports */\n${lines.join('\n')}\n`;
    },
  };
}
