/** Options for the security headers a site ships (written into `_headers` at build time). */
export interface HWioHeadersOptions {
  /** Consent-gated Google Tag Manager on this site (adds GTM/GA/Ads origins). */
  gtm?: boolean;
  /** Cloudflare Turnstile on this site's forms. */
  turnstile?: boolean;
  /** The forms Worker endpoint origin, e.g. https://submit.hardwario.com */
  submitEndpoint?: string;
  /** Extra frame-src origins (YouTube, HubSpot meetings). */
  frames?: string[];
  /** Extra script-src origins. */
  scripts?: string[];
  /** Extra connect-src origins. */
  connect?: string[];
  /** SHA-256 hashes ('sha256-…') of the inline bootstrap scripts. */
  scriptHashes?: string[];
  /** Keep 'unsafe-inline' in script-src (needed until every inline script is hashed). */
  unsafeInlineScripts?: boolean;
  /** Ship the CSP as Content-Security-Policy-Report-Only instead of enforcing. */
  reportOnly?: boolean;
  /** First-party collector path for CSP reports (the Worker answers it with 204). */
  reportUri?: string | null;
  /** HSTS: 'basic' = max-age only (www), 'strict' = includeSubDomains + preload (enerooo). */
  hsts?: 'basic' | 'strict' | 'none';
  /** Font files to announce as Early Hints on HTML responses (Cloudflare replays Link headers as 103). */
  earlyHints?: string[];
  /** Additional cache rules, path glob -> Cache-Control value. */
  cache?: Record<string, string>;
  /** Extra headers on every response (e.g. X-Robots-Tag: noindex). */
  extra?: Record<string, string>;
}

const uniq = (list: string[]) => Array.from(new Set(list));

export function hwioBuildCsp(o: HWioHeadersOptions): string {
  const script = ["'self'", ...(o.unsafeInlineScripts !== false ? ["'unsafe-inline'"] : []), ...(o.scriptHashes ?? []).map((h) => `'${h}'`)];
  const connect = ["'self'"];
  const img = ["'self'", 'data:', 'https:'];
  const frame: string[] = [];
  if (o.turnstile) {
    script.push('https://challenges.cloudflare.com');
    connect.push('https://challenges.cloudflare.com');
    frame.push('https://challenges.cloudflare.com');
  }
  if (o.gtm) {
    script.push('https://www.googletagmanager.com', 'https://www.google-analytics.com', 'https://*.google-analytics.com');
    connect.push('https://www.googletagmanager.com', 'https://www.google-analytics.com', 'https://*.google-analytics.com', 'https://*.analytics.google.com', 'https://stats.g.doubleclick.net');
    frame.push('https://www.googletagmanager.com', 'https://td.doubleclick.net');
  }
  if (o.submitEndpoint) connect.push(o.submitEndpoint);
  script.push(...(o.scripts ?? []));
  connect.push(...(o.connect ?? []));
  frame.push(...(o.frames ?? []));
  const directives = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    `script-src ${uniq(script).join(' ')}`,
    "style-src 'self' 'unsafe-inline'",
    `img-src ${uniq(img).join(' ')}`,
    "font-src 'self' data:",
    `connect-src ${uniq(connect).join(' ')}`,
    ...(frame.length ? [`frame-src ${uniq(frame).join(' ')}`] : ["frame-src 'none'"]),
    'upgrade-insecure-requests',
  ];
  if (o.reportUri) directives.push(`report-uri ${o.reportUri}`, 'report-to csp-endpoint');
  return directives.join('; ');
}

export function hwioSecurityHeaders(o: HWioHeadersOptions): Record<string, string> {
  const headers: Record<string, string> = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), payment=()',
  };
  const hsts = o.hsts ?? 'basic';
  if (hsts === 'basic') headers['Strict-Transport-Security'] = 'max-age=31536000';
  if (hsts === 'strict') headers['Strict-Transport-Security'] = 'max-age=63072000; includeSubDomains; preload';
  const reportUri = o.reportUri === undefined ? '/csp-report' : o.reportUri;
  if (reportUri) headers['Reporting-Endpoints'] = `csp-endpoint="${reportUri}"`;
  headers[o.reportOnly ? 'Content-Security-Policy-Report-Only' : 'Content-Security-Policy'] = hwioBuildCsp({ ...o, reportUri });
  return { ...headers, ...(o.extra ?? {}) };
}

export function hwioEarlyHintLinks(files: string[]): string[] {
  return files.map((f) => `<${f}>; rel=preload; as=font; type=font/woff2; crossorigin`);
}

/** Renders a Cloudflare `_headers` file: immutable build assets, fonts, media, then the security block on `/*`. */
export function hwioRenderHeadersFile(o: HWioHeadersOptions): string {
  const cache: Record<string, string> = {
    '/_astro/*': 'public, max-age=31536000, immutable',
    '/fonts/*': 'public, max-age=31536000, immutable',
    '/images/*': 'public, max-age=2592000, must-revalidate',
    ...(o.cache ?? {}),
  };
  const blocks = Object.entries(cache).map(([path, value]) => `${path}\n  Cache-Control: ${value}`);
  const security = Object.entries(hwioSecurityHeaders(o)).map(([k, v]) => `  ${k}: ${v}`);
  const hints = (o.earlyHints ?? []).length ? hwioEarlyHintLinks(o.earlyHints!).map((l) => `  Link: ${l}`) : [];
  blocks.push(`/*\n${[...security, ...hints].join('\n')}`);
  return `# Generated by @hubpav/hwio-web-worker (hwioRenderHeadersFile). Edit the site's hwioUi() options, not this file.\n${blocks.join('\n\n')}\n`;
}
