// Policy lint for the shared packages. Fails CI on:
//  - `hw-` / `hw_` / `hwConsent`-style legacy identifiers outside lines marked `legacy-ok`
//  - inline `style=` attributes and Astro `define:vars` / `is:inline` styles in components
//    (the fleet is moving to a strict style-src; only HWioSeoHead may inline)
//  - string concatenation of class names (Tailwind must see literal classes)
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const SCAN = ['packages/brand/src', 'packages/brand/scripts', 'packages/ui/src', 'packages/web-runtime/src', 'packages/web-worker/src'];
const SKIP_DIRS = new Set(['node_modules', 'dist', '.astro']);
const problems = [];

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(astro|ts|mjs|js|css|json)$/.test(entry)) out.push(p);
  }
  return out;
}

const legacyPattern = /(^|[^a-zA-Z0-9])hw[-_](?!io)|\bhwConsent\b|\bhwLoadTurnstile\b|\bhwTurnstileWidgetId\b|--hw-|\.hw-/;

for (const base of SCAN) {
  let files = [];
  try { files = walk(join(ROOT, base)); } catch { continue; }
  for (const file of files) {
    const rel = relative(ROOT, file);
    const lines = readFileSync(file, 'utf8').split('\n');
    lines.forEach((line, i) => {
      const where = `${rel}:${i + 1}`;
      if (legacyPattern.test(line) && !/legacy-ok/.test(line)) {
        problems.push(`${where}: legacy hw identifier (mark the line legacy-ok if it is a deliberate compatibility shim)`);
      }
      if (rel.endsWith('.astro') && !rel.endsWith('HWioSeoHead.astro') && !rel.endsWith('HWioFontGate.astro')) {
        if (/\sstyle="/.test(line) || /\sstyle=\{/.test(line)) problems.push(`${where}: inline style attribute`);
        if (/define:vars/.test(line)) problems.push(`${where}: define:vars (runtime-injected CSS)`);
        if (/<style[^>]*is:inline/.test(line)) problems.push(`${where}: inline <style>`);
      }
      if (rel.endsWith('.astro') && /class=\{`[^`]*\$\{/.test(line) && !/policy-ok/.test(line)) {
        problems.push(`${where}: template-literal class name; use a lookup map of literal strings`);
      }
    });
  }
}

if (problems.length) {
  console.error(`policy-lint: ${problems.length} problem(s)\n` + problems.map((p) => `  ${p}`).join('\n'));
  process.exit(1);
}
console.log('policy-lint: ok');
