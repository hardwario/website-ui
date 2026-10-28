// Astro integration for sites on the design system.
//   import { hwioUi } from '@hubpav/hwio-ui/integration';
//   integrations: [hwioUi({ headers: { gtm: true, turnstile: true, submitEndpoint: 'https://submit.hardwario.com', earlyHints: ['/fonts/inter-latin.woff2', '/fonts/inter-latin-ext.woff2'] } })]
// It (1) forces component scripts to stay external (script-src 'self' covers them), (2) serves the
// brand fonts and logos in dev and copies them into the build output, (3) writes `_headers`
// from one options object so security headers have a single source of truth, (4) limits
// Tailwind's scan of the package components to the ones the site imports (component-sources.mjs).
import { copyFileSync, mkdirSync, readdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { hwioRenderHeadersFile } from '@hubpav/hwio-web-worker/headers';
import { hwioComponentSourcesPlugin } from './component-sources.mjs';

const require = createRequire(import.meta.url);

function brandDir() {
  return dirname(require.resolve('@hubpav/hwio-brand/package.json'));
}

const MIME = { '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon' };

/**
 * @param {{ headers?: import('@hubpav/hwio-web-worker/headers').HWioHeadersOptions | false, assets?: boolean, fonts?: string[], componentCss?: 'used' | 'all' }} [options]
 *   fonts: font families (file-name prefixes in @hubpav/hwio-brand/dist/fonts) copied to /fonts; default ['inter'].
 *   componentCss: 'used' (default) emits CSS for the components the site imports, 'all' for every component.
 * @returns {import('astro').AstroIntegration}
 */
export function hwioUi(options = {}) {
  const { headers = false, assets = true, fonts = ['inter'], componentCss = 'used' } = options;
  const brand = brandDir();
  const fontsDir = join(brand, 'dist/fonts');
  const logosDir = join(brand, 'logos');
  return {
    name: '@hubpav/hwio-ui',
    hooks: {
      'astro:config:setup': ({ updateConfig, config, logger }) => {
        const plugins = componentCss === 'used' ? [hwioComponentSourcesPlugin({ root: fileURLToPath(config.root), logger })] : [];
        updateConfig({ vite: { build: { assetsInlineLimit: 0 }, plugins } });
      },
      'astro:server:setup': ({ server }) => {
        if (!assets) return;
        server.middlewares.use((req, res, next) => {
          const url = req.url ?? '';
          const map = url.startsWith('/fonts/') ? [fontsDir, url.slice('/fonts/'.length)] : url.startsWith('/brand/') ? [logosDir, url.slice('/brand/'.length)] : null;
          if (!map) return next();
          const file = join(map[0], map[1].split('?')[0]);
          if (!file.startsWith(map[0]) || !existsSync(file)) return next();
          res.setHeader('Content-Type', MIME[extname(file)] ?? 'application/octet-stream');
          res.end(readFileSync(file));
        });
      },
      'astro:build:done': ({ dir }) => {
        const out = fileURLToPath(dir);
        if (assets) {
          for (const [src, dest] of [[fontsDir, 'fonts'], [logosDir, 'brand']]) {
            if (!existsSync(src)) continue;
            mkdirSync(join(out, dest), { recursive: true });
            for (const f of readdirSync(src)) {
              if (extname(f) === '.css') continue;
              // Only the families the site's themes use (a HARDWARIO site never serves Poppins, enerooo never Inter).
              if (dest === 'fonts' && !fonts.some((family) => f.startsWith(`${family}-`))) continue;
              copyFileSync(join(src, f), join(out, dest, f));
            }
          }
        }
        if (headers) writeFileSync(join(out, '_headers'), hwioRenderHeadersFile(headers));
      },
    },
  };
}
