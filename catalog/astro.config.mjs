import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import { hwioUi } from '@hubpav/hwio-ui/integration';

export default defineConfig({
  site: 'https://ui.hardwario.com',
  trailingSlash: 'always',
  compressHTML: true,
  build: { inlineStylesheets: 'always' },
  integrations: [
    hwioUi({
      headers: {
        turnstile: true,
        reportOnly: false,
        reportUri: null,
        hsts: 'basic',
        earlyHints: ['/fonts/inter-latin.woff2', '/fonts/inter-latin-ext.woff2'],
        extra: { 'X-Robots-Tag': 'noindex, nofollow' },
      },
    }),
  ],
  vite: { plugins: [tailwindcss()] },
});
