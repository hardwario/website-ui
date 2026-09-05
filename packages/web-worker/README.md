# @hubpav/hwio-web-worker

`hwioWorker(options)` is the fetch handler for a HARDWARIO static site on Cloudflare Workers:
CSP report collector (`POST /csp-report` → 204 + one JSON log line), optional canonical-host
301, optional Early Hints for fonts. `@hubpav/hwio-web-worker/headers` builds the security
headers and renders the `_headers` file the `hwioUi()` Astro integration writes at build time.
