import test from 'node:test';
import assert from 'node:assert/strict';
import { hwioBuildCsp, hwioSecurityHeaders, hwioRenderHeadersFile } from '../dist/headers.js';
import { hwioWorker, hwioParseCspReports } from '../dist/index.js';

test('CSP grows with the site features and keeps the report collector', () => {
  const plain = hwioBuildCsp({ reportUri: '/csp-report' });
  assert.match(plain, /script-src 'self' 'unsafe-inline'; /);
  assert.match(plain, /frame-src 'none'/);
  const full = hwioBuildCsp({ gtm: true, turnstile: true, submitEndpoint: 'https://submit.hardwario.com', scriptHashes: ['sha256-abc'], unsafeInlineScripts: false, reportUri: '/csp-report' });
  assert.match(full, /script-src 'self' 'sha256-abc' https:\/\/challenges\.cloudflare\.com https:\/\/www\.googletagmanager\.com/);
  assert.match(full, /connect-src 'self' https:\/\/challenges\.cloudflare\.com .*https:\/\/submit\.hardwario\.com/);
  assert.match(full, /report-uri \/csp-report; report-to csp-endpoint$/);
});

test('report-only vs enforcing header names and HSTS variants', () => {
  assert.ok('Content-Security-Policy-Report-Only' in hwioSecurityHeaders({ reportOnly: true }));
  assert.ok('Content-Security-Policy' in hwioSecurityHeaders({}));
  assert.equal(hwioSecurityHeaders({ hsts: 'strict' })['Strict-Transport-Security'], 'max-age=63072000; includeSubDomains; preload');
  assert.equal('Strict-Transport-Security' in hwioSecurityHeaders({ hsts: 'none' }), false);
});

test('_headers file has cache rules first and the security block last', () => {
  const file = hwioRenderHeadersFile({ earlyHints: ['/fonts/inter-latin.woff2'] });
  const lines = file.split('\n');
  assert.equal(lines[1], '/_astro/*');
  assert.ok(file.trimEnd().includes('  Link: </fonts/inter-latin.woff2>; rel=preload; as=font; type=font/woff2; crossorigin'));
  assert.ok(file.indexOf('\n/*\n') > file.indexOf('/fonts/*'));
});

test('worker: collector answers 204, canonical redirect is a single 301, assets pass through', async () => {
  const assets = { fetch: async () => new Response('<html>', { status: 200, headers: { 'content-type': 'text/html' } }) };
  const w = hwioWorker({ canonicalHost: 'www.example.com', earlyHints: ['/fonts/a.woff2'] });
  const r1 = await w.fetch(new Request('https://www.example.com/csp-report', { method: 'POST', body: '{}' }), { ASSETS: assets });
  assert.equal(r1.status, 204);
  const r2 = await w.fetch(new Request('http://example.com/x?y=1'), { ASSETS: assets });
  assert.equal(r2.status, 301); assert.equal(r2.headers.get('location'), 'https://www.example.com/x?y=1');
  const r3 = await w.fetch(new Request('https://www.example.com/'), { ASSETS: assets });
  assert.equal(r3.status, 200); assert.match(r3.headers.get('link') ?? '', /fonts\/a\.woff2/);
  const micro = hwioWorker({ canonicalHost: null });
  const r4 = await micro.fetch(new Request('http://hardwario.engineering/'), { ASSETS: assets });
  assert.equal(r4.status, 200);
});

test('preview hosts: no canonical redirect, noindex on every response, production untouched', async () => {
  const assets = { fetch: async () => new Response('<html>', { status: 200, headers: { 'content-type': 'text/html' } }) };
  const w = hwioWorker({ canonicalHost: 'www.example.com', earlyHints: ['/fonts/a.woff2'] });
  const preview = await w.fetch(new Request('https://redesign-website.acme.workers.dev/cs/'), { ASSETS: assets });
  assert.equal(preview.status, 200);
  assert.equal(preview.headers.get('x-robots-tag'), 'noindex, nofollow');
  assert.match(preview.headers.get('link') ?? '', /fonts\/a\.woff2/);
  const prod = await w.fetch(new Request('https://www.example.com/'), { ASSETS: assets });
  assert.equal(prod.headers.get('x-robots-tag'), null);
  const foreign = await w.fetch(new Request('https://example.com/'), { ASSETS: assets });
  assert.equal(foreign.status, 301);
  const micro = hwioWorker({ canonicalHost: null });
  const microPreview = await micro.fetch(new Request('https://redesign-x.acme.workers.dev/'), { ASSETS: assets });
  assert.equal(microPreview.headers.get('x-robots-tag'), 'noindex, nofollow');
});

test('_headers: previewNoindex appends a host-scoped rule after the security block', () => {
  const file = hwioRenderHeadersFile({ previewNoindex: true });
  assert.ok(file.trimEnd().endsWith('https://:preview.:account.workers.dev/*\n  X-Robots-Tag: noindex, nofollow'));
  assert.equal(hwioRenderHeadersFile({}).includes('workers.dev'), false);
});

test('GTM origins cover GA4 with Ads features (analytics.google.com, country Google domains, doubleclick)', () => {
  const csp = hwioBuildCsp({ gtm: true });
  const connect = csp.split('; ').find((d) => d.startsWith('connect-src '));
  for (const origin of ['https://*.google.com', 'https://*.google.cz', 'https://*.google.de', 'https://*.g.doubleclick.net', 'https://pagead2.googlesyndication.com', 'https://*.google-analytics.com']) {
    assert.ok(connect.split(' ').includes(origin), origin);
  }
  const custom = hwioBuildCsp({ gtm: true, googleTlds: ['co.uk'] });
  assert.match(custom, /https:\/\/\*\.google\.co\.uk/);
  assert.equal(custom.includes('google.cz'), false);
  assert.equal(hwioBuildCsp({}).includes('google'), false);
});

const reportingBatch = (n) => JSON.stringify(Array.from({ length: n }, (_, i) => ({
  type: 'csp-violation', age: 1, url: 'https://www.example.com/?email=a%40b.c', user_agent: 'x',
  body: { documentURL: 'https://www.example.com/contact/?email=a%40b.c', blockedURL: `https://analytics.google.com/g/collect?v=2&tid=G-X&i=${i % 2}`, effectiveDirective: 'connect-src', disposition: 'report', lineNumber: 4, columnNumber: 70, sourceFile: 'https://www.googletagmanager.com/gtag/js?id=G-X', sample: '', statusCode: 200 },
})));

test('CSP parser: Reporting API batches merge duplicates and drop query strings', () => {
  const [v, ...rest] = hwioParseCspReports(reportingBatch(400));
  assert.equal(rest.length, 0);
  assert.equal(v.count, 400);
  assert.equal(v.directive, 'connect-src');
  assert.equal(v.blocked, 'https://analytics.google.com/g/collect');
  assert.equal(v.document, 'https://www.example.com/contact/');
  assert.equal(v.source, 'https://www.googletagmanager.com/gtag/js');
  assert.deepEqual([v.line, v.column, v.disposition], [4, 70, 'report']);
  assert.equal(hwioParseCspReports(JSON.stringify([{ type: 'deprecation', body: {} }])).length, 0);
});

test('CSP parser: legacy report-uri bodies and keyword sources', () => {
  const [v] = hwioParseCspReports(JSON.stringify({ 'csp-report': { 'document-uri': 'https://hardwario.studio/cs/?gclid=1', 'violated-directive': 'script-src-elem', 'blocked-uri': 'eval', 'line-number': '7', disposition: 'enforce' } }));
  assert.equal(v.directive, 'script-src-elem');
  assert.equal(v.blocked, 'eval');
  assert.equal(v.document, 'https://hardwario.studio/cs/');
  assert.equal(v.line, 7);
  assert.equal(v.column, null);
  assert.equal(hwioParseCspReports(JSON.stringify({ 'csp-report': { 'blocked-uri': 'data:image/png;base64,xyz' } }))[0].blocked, 'data:');
  assert.throws(() => hwioParseCspReports('{"truncated'));
});

test('worker: collector logs every distinct violation of a large batch, never the raw body', async () => {
  const lines = [];
  const original = console.log;
  console.log = (line) => lines.push(JSON.parse(line));
  try {
    const w = hwioWorker({});
    const body = reportingBatch(400);
    assert.ok(body.length > 8192);
    const res = await w.fetch(new Request('https://hardwario.studio/csp-report', { method: 'POST', body, headers: { 'content-type': 'application/reports+json', 'user-agent': 'UA' } }), {});
    assert.equal(res.status, 204);
    const huge = await w.fetch(new Request('https://hardwario.studio/csp-report', { method: 'POST', body: 'x'.repeat(300 * 1024) }), {});
    assert.equal(huge.status, 204);
    const bad = await w.fetch(new Request('https://hardwario.studio/csp-report', { method: 'POST', body: '{"truncated' }), {});
    assert.equal(bad.status, 204);
  } finally {
    console.log = original;
  }
  assert.equal(lines.length, 3);
  assert.equal(lines[0].kind, 'csp-report');
  assert.equal(lines[0].count, 400);
  assert.equal(lines[0].ua, 'UA');
  assert.equal(JSON.stringify(lines[0]).includes('email'), false);
  assert.equal(lines[1].parse, 'too-large');
  assert.equal(lines[2].parse, 'failed');
});
