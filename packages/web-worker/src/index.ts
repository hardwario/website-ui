import { hwioEarlyHintLinks } from './headers.js';

export * from './headers.js';

export interface HWioWorkerOptions {
  /** Redirect anything that is not https://<canonicalHost> with one 301 (Astro hub sites). Null on micro-sites. */
  canonicalHost?: string | null;
  /** Answer POST /csp-report with 204 after logging one JSON line (Workers Logs). */
  cspReport?: boolean;
  /** Font files to announce as Early Hints on HTML responses served through the Worker. */
  earlyHints?: string[];
  /** Name of the static assets binding. */
  assetsBinding?: string;
}

interface AssetsBinding { fetch: (request: Request) => Promise<Response> }

/**
 * Fetch handler for an Astro static site on Cloudflare Workers with static assets.
 * Sites with `run_worker_first: ["/csp-report"]` only route the collector here; hub sites with
 * `run_worker_first: true` also get the canonical redirect and Early Hints.
 */
export function hwioWorker(options: HWioWorkerOptions = {}) {
  const { canonicalHost = null, cspReport = true, earlyHints = [], assetsBinding = 'ASSETS' } = options;
  return {
    async fetch(request: Request, env: Record<string, unknown>): Promise<Response> {
      const url = new URL(request.url);
      if (cspReport && url.pathname === '/csp-report') {
        if (request.method === 'POST') {
          try {
            const text = (await request.text()).slice(0, 8192);
            console.log(JSON.stringify({ kind: 'csp-report', ua: request.headers.get('user-agent') ?? '', report: JSON.parse(text) }));
          } catch {
            console.log(JSON.stringify({ kind: 'csp-report', parse: 'failed' }));
          }
        }
        return new Response(null, { status: 204 });
      }
      if (canonicalHost && (url.protocol !== 'https:' || url.hostname !== canonicalHost)) {
        url.protocol = 'https:';
        url.hostname = canonicalHost;
        return Response.redirect(url.toString(), 301);
      }
      const assets = env[assetsBinding] as AssetsBinding | undefined;
      if (!assets) return new Response('assets binding missing', { status: 500 });
      const res = await assets.fetch(request);
      if (earlyHints.length && res.status === 200 && (res.headers.get('content-type') ?? '').includes('text/html')) {
        const withHints = new Response(res.body, res);
        hwioEarlyHintLinks(earlyHints).forEach((l) => withHints.headers.append('Link', l));
        return withHints;
      }
      return res;
    },
  };
}
