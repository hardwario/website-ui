# @hubpav/hwio-web-worker

`hwioWorker(options)` is the fetch handler for a HARDWARIO static site on Cloudflare Workers:
CSP report collector (`POST /csp-report` → 204; Reporting API batches and legacy `report-uri`
bodies up to 256 KB, one JSON log line per distinct violation, URLs without query strings; parse
them yourself with `hwioParseCspReports`), optional canonical-host 301, optional Early Hints for
fonts. Query the collected reports in Workers Logs with the filter `kind = csp-report`. `@hubpav/hwio-web-worker/headers` builds the security
headers and renders the `_headers` file the `hwioUi()` Astro integration writes at build time.
