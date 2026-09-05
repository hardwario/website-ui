# @hubpav/hwio-web-runtime

Framework-free browser behaviours for the HARDWARIO websites, one ES module per concern
(`/consent`, `/forms`, `/turnstile`, `/attribution`, `/theme`, `/track`, `/reveal`,
`/counter`, `/nav`, `/accordion`) plus `/inline` (static bootstrap scripts with their
SHA-256 hashes for CSP). Every behaviour registers through `hwioMount()`, so it binds on
`astro:page-load` and cleans up on `astro:before-swap` when Astro's ClientRouter is present
and binds once otherwise. Pure logic lives in `*-core` modules and is unit-tested with
`node --test`.
