import test from 'node:test';
import assert from 'node:assert/strict';
import { hwioBuildCsp, hwioSecurityHeaders, hwioRenderHeadersFile } from '../dist/headers.js';
import { hwioWorker } from '../dist/index.js';

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
