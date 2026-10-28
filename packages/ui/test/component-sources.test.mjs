import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, symlinkSync, realpathSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { hwioComponentGraph, hwioUnusedComponents, hwioScanRoots, hwioComponentSourcesPlugin } from '../src/component-sources.mjs';

const graph = new Map([
  ['HWioShell', new Set(['HWioSkipLink'])],
  ['HWioSkipLink', new Set()],
  ['HWioButton', new Set(['HWioIcon'])],
  ['HWioIcon', new Set()],
  ['HWioPricingTiers', new Set(['HWioButton', 'HWioIcon'])],
]);
const imp = (name) => `import ${name} from '@hubpav/hwio-ui/components/${name}.astro';`;

test('the real package graph knows every component and its imports', () => {
  const real = hwioComponentGraph();
  assert.ok(real.size >= 30);
  assert.deepEqual([...real.get('HWioHubSpotForm')].sort(), ['HWioFormField', 'HWioTurnstile']);
});

test('unused = components neither imported nor reached through an imported component', () => {
  assert.deepEqual(hwioUnusedComponents([imp('HWioShell'), imp('HWioButton')], graph), ['HWioPricingTiers']);
  assert.deepEqual(hwioUnusedComponents([imp('HWioPricingTiers')], graph), ['HWioShell', 'HWioSkipLink']);
});

test('no import found: keep every component', () => {
  assert.equal(hwioUnusedComponents(['<div class="btn"/>'], graph), null);
});

test('a computed or unknown import path keeps every component', () => {
  assert.equal(hwioUnusedComponents([imp('HWioShell'), 'await import(`@hubpav/hwio-ui/components/${name}.astro`)'], graph), null);
  assert.equal(hwioUnusedComponents([imp('HWioShell'), imp('HWioFuture')], graph), null);
});

test('scan roots: the project, local workspace dependencies and @source directories, never node_modules', () => {
  const ws = realpathSync(mkdtempSync(join(tmpdir(), 'hwio-scan-')));
  const site = join(ws, 'sites/a');
  const shared = join(ws, 'packages/shared-ui');
  mkdirSync(join(site, 'src/styles'), { recursive: true });
  mkdirSync(join(shared, 'src'), { recursive: true });
  mkdirSync(join(ws, 'node_modules/@x'), { recursive: true });
  mkdirSync(join(ws, 'node_modules/some-lib'), { recursive: true });
  symlinkSync(shared, join(ws, 'node_modules/@x/shared-ui'));
  writeFileSync(join(site, 'package.json'), JSON.stringify({ dependencies: { '@x/shared-ui': '*', 'some-lib': '1.0.0', '@hubpav/hwio-ui': '0.7.8' } }));
  const css = '@import "@hubpav/hwio-ui/styles.css";\n@source "../../../../packages/shared-ui/src";\n@source not "../legacy";\n';
  const roots = hwioScanRoots(site, join(site, 'src/styles/global.css'), css);
  assert.deepEqual(roots.sort(), [shared, join(shared, 'src'), site].sort());
});

test('plugin: appends @source not lines to the entry stylesheet only', () => {
  const root = realpathSync(mkdtempSync(join(tmpdir(), 'hwio-site-')));
  mkdirSync(join(root, 'src/styles'), { recursive: true });
  writeFileSync(join(root, 'package.json'), '{}');
  writeFileSync(join(root, 'src/Page.astro'), imp('HWioShell'));
  const entry = join(root, 'src/styles/global.css');
  writeFileSync(entry, '@import "tailwindcss";\n@import "@hubpav/hwio-ui/styles.css";\n');
  const other = join(root, 'src/styles/other.css');
  writeFileSync(other, '.x{color:red}');
  const plugin = hwioComponentSourcesPlugin({ root });
  const ctx = { addWatchFile() {} };
  const out = plugin.load.call(ctx, entry);
  assert.match(out, /@source not "[^"]*components\/HWioPricingTiers\.astro";/);
  assert.doesNotMatch(out, /HWioShell\.astro|HWioSkipLink\.astro/);
  assert.equal(plugin.load.call(ctx, other), null);
  assert.equal(plugin.load.call(ctx, join(root, 'node_modules/x/global.css')), null);
});
