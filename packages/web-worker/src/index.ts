import { hwioEarlyHintLinks } from './headers.js';

export * from './headers.js';

export interface HWioWorkerOptions {
  /** Redirect anything that is not https://<canonicalHost> with one 301 (Astro hub sites). Null on micro-sites. */
  canonicalHost?: string | null;
  /** Answer POST /csp-report with 204 after logging one JSON line per distinct violation (Workers Logs). */
  cspReport?: boolean;
  /** Font files to announce as Early Hints on HTML responses served through the Worker. */
  earlyHints?: string[];
  /** Name of the static assets binding. */
  assetsBinding?: string;
  /**
   * Hostname suffixes treated as preview deployments (Workers Builds non-production branches,
   * `wrangler versions upload --preview-alias`): the canonical redirect is skipped there and
   * every response carries `X-Robots-Tag: noindex, nofollow`. Default: ['.workers.dev'].
   */
  previewHosts?: string[];
}

interface AssetsBinding { fetch: (request: Request) => Promise<Response> }

/** One CSP violation, normalized from either report format; URLs keep origin and path only. */
export interface HWioCspViolation {
  directive: string;
  blocked: string;
  document: string;
  source: string;
  line: number | null;
  column: number | null;
  disposition: string;
  sample: string;
  count: number;
}

/** Report bodies above this size are not parsed (Chrome batches reach ~100 KB). */
const CSP_MAX_BODY = 256 * 1024;
/** Distinct violations logged per request; the rest is summarized as `dropped`. */
const CSP_MAX_LINES = 50;

/** Origin + path of a URL, so query strings (form fields, click ids) never reach the logs. */
function cspUrl(value: unknown): string {
  if (typeof value !== 'string' || !value) return '';
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:' ? `${u.origin}${u.pathname}` : u.protocol;
  } catch {
    return value.slice(0, 200);
  }
}

const cspText = (value: unknown, max = 200) => (typeof value === 'string' ? value.slice(0, max) : '');
const cspNumber = (value: unknown) => (Number.isFinite(Number(value)) && value !== null && value !== '' ? Number(value) : null);

/**
 * Parses a CSP report body: the Reporting API batch (`application/reports+json`, an array of
 * `{ type: 'csp-violation', body }`, sent for `report-to`) or the legacy `report-uri` object
 * (`application/csp-report`, `{ 'csp-report': { … } }`). Identical violations are merged into one
 * entry with a count. Throws on malformed JSON.
 */
export function hwioParseCspReports(text: string): HWioCspViolation[] {
  const data: unknown = JSON.parse(text);
  const raw: Record<string, unknown>[] = [];
  if (Array.isArray(data)) {
    for (const item of data) {
      if (item && typeof item === 'object' && (item as { type?: unknown }).type === 'csp-violation') {
        const body = (item as { body?: unknown }).body;
        if (body && typeof body === 'object') raw.push(body as Record<string, unknown>);
      }
    }
  } else if (data && typeof data === 'object') {
    const legacy = (data as Record<string, unknown>)['csp-report'];
    if (legacy && typeof legacy === 'object') raw.push(legacy as Record<string, unknown>);
  }
  const merged = new Map<string, HWioCspViolation>();
  for (const r of raw) {
    const v: HWioCspViolation = {
      directive: cspText(r.effectiveDirective ?? r['effective-directive'] ?? r['violated-directive'], 80),
      blocked: cspUrl(r.blockedURL ?? r['blocked-uri']),
      document: cspUrl(r.documentURL ?? r['document-uri']),
      source: cspUrl(r.sourceFile ?? r['source-file']),
      line: cspNumber(r.lineNumber ?? r['line-number']),
      column: cspNumber(r.columnNumber ?? r['column-number']),
      disposition: cspText(r.disposition, 20),
      sample: cspText(r.sample ?? r['script-sample'], 80),
      count: 1,
    };
    const key = [v.directive, v.blocked, v.document, v.source, v.line, v.column, v.disposition].join('|');
    const seen = merged.get(key);
    if (seen) seen.count += 1;
    else merged.set(key, v);
  }
  return [...merged.values()];
}

async function logCspReport(request: Request): Promise<void> {
  const ua = cspText(request.headers.get('user-agent'), 160);
  const declared = Number(request.headers.get('content-length') ?? 0);
  if (declared > CSP_MAX_BODY) {
    console.log(JSON.stringify({ kind: 'csp-report', parse: 'too-large', bytes: declared, ua }));
    return;
  }
  let violations: HWioCspViolation[];
  try {
    const text = await request.text();
    if (text.length > CSP_MAX_BODY) {
      console.log(JSON.stringify({ kind: 'csp-report', parse: 'too-large', bytes: text.length, ua }));
      return;
    }
    violations = hwioParseCspReports(text);
  } catch {
    console.log(JSON.stringify({ kind: 'csp-report', parse: 'failed', ua }));
    return;
  }
  for (const v of violations.slice(0, CSP_MAX_LINES)) console.log(JSON.stringify({ kind: 'csp-report', ...v, ua }));
  if (violations.length > CSP_MAX_LINES) {
    console.log(JSON.stringify({ kind: 'csp-report', dropped: violations.length - CSP_MAX_LINES, ua }));
  }
}

/**
 * Fetch handler for an Astro static site on Cloudflare Workers with static assets.
 * Sites with `run_worker_first: ["/csp-report"]` only route the collector here; hub sites with
 * `run_worker_first: true` also get the canonical redirect and Early Hints.
 */
export function hwioWorker(options: HWioWorkerOptions = {}) {
  const { canonicalHost = null, cspReport = true, earlyHints = [], assetsBinding = 'ASSETS', previewHosts = ['.workers.dev'] } = options;
  return {
    async fetch(request: Request, env: Record<string, unknown>): Promise<Response> {
      const url = new URL(request.url);
      const preview = previewHosts.some((suffix) => url.hostname.endsWith(suffix));
      if (cspReport && url.pathname === '/csp-report') {
        if (request.method === 'POST') await logCspReport(request);
        return new Response(null, { status: 204 });
      }
      if (canonicalHost && !preview && (url.protocol !== 'https:' || url.hostname !== canonicalHost)) {
        url.protocol = 'https:';
        url.hostname = canonicalHost;
        return Response.redirect(url.toString(), 301);
      }
      const assets = env[assetsBinding] as AssetsBinding | undefined;
      if (!assets) return new Response('assets binding missing', { status: 500 });
      const res = await assets.fetch(request);
      const html = res.status === 200 && (res.headers.get('content-type') ?? '').includes('text/html');
      if (!preview && !(earlyHints.length && html)) return res;
      const out = new Response(res.body, res);
      if (earlyHints.length && html) hwioEarlyHintLinks(earlyHints).forEach((l) => out.headers.append('Link', l));
      if (preview) out.headers.set('X-Robots-Tag', 'noindex, nofollow');
      return out;
    },
  };
}
