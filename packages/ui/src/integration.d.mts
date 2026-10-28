import type { AstroIntegration } from 'astro';
import type { HWioHeadersOptions } from '@hubpav/hwio-web-worker/headers';
export interface HWioUiOptions {
  /** Security headers written into `_headers` at build time; `false` leaves the site's own file alone. */
  headers?: HWioHeadersOptions | false;
  /** Serve the brand fonts and logos in dev and copy them into the build output. */
  assets?: boolean;
  /** Font families copied into /fonts (file-name prefixes in @hubpav/hwio-brand/dist/fonts). Default ['inter']. */
  fonts?: string[];
  /**
   * 'used' (default): Tailwind scans only the HWio components the site imports (found in the project,
   * its local workspace dependencies and the entry stylesheet's own `@source` directories), so pages
   * carry no rules for components they never render. 'all': scan every component.
   */
  componentCss?: 'used' | 'all';
}
export function hwioUi(options?: HWioUiOptions): AstroIntegration;
