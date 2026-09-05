import type { AstroIntegration } from 'astro';
import type { HWioHeadersOptions } from '@hubpav/hwio-web-worker/headers';
export interface HWioUiOptions {
  /** Security headers written into `_headers` at build time; `false` leaves the site's own file alone. */
  headers?: HWioHeadersOptions | false;
  /** Serve the brand fonts and logos in dev and copy them into the build output. */
  assets?: boolean;
}
export function hwioUi(options?: HWioUiOptions): AstroIntegration;
