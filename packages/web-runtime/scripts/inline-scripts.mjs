// Static inline bootstraps. They must never be templated per site: everything that varies is
// read from data-hwio-* attributes on <html>, so the SHA-256 in CSP `script-src` stays stable.

/** Google Consent Mode v2 denied defaults. Must run before any tag. */
export const consentDefaults = `(function(){window.dataLayer=window.dataLayer||[];window.gtag=window.gtag||function(){window.dataLayer.push(arguments)};window.gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',functionality_storage:'denied',personalization_storage:'denied',security_storage:'granted'})})();`;

/**
 * Shows the consent banner with the page's first paint on a visit that has no stored choice.
 * HWioCookieConsent renders it right after the banner's markup, so it runs while the document is
 * still being parsed, before the module scripts: the banner no longer appears late (on a phone it
 * is the largest block of text, so its paint is the page's LCP). It only lifts `hidden` when neither
 * consent cookie exists; a stored receipt of an older version is left to the runtime, which asks
 * again, and everything else (clicks, storage, Consent Mode) stays in @hubpav/hwio-web-runtime/consent.
 */
export const consentReveal = `(function(){var s=document.currentScript,r=s&&s.previousElementSibling;if(r&&r.hasAttribute('data-hwio-consent')&&!/(?:^|; )(?:hwio|hw)_cookie_consent=/.test(document.cookie))r.hidden=false})();`;

/**
 * Pre-paint theme restore. Reads <html data-hwio-consent-version data-hwio-theme-light data-hwio-theme-dark>.
 * Applies a stored explicit choice only when it was stored under the current consent version
 * (preferences consent). Legacy keys from the pre-design-system sites are honoured once.
 */
// Stamps data-theme before paint: light by default (owner decision 2026-09-06), dark only when the visitor
// chose it. The choice is read from the hwio_theme cookie when the site declares a shared cookie domain
// (data-hwio-theme-cookie-domain), else from localStorage (hwio_theme; legacy key theme). A stamped
// attribute is what lets non-default DaisyUI themes (hwio-forestry) apply.
export const themeBootstrap = `(function(){var h=document.documentElement,d=h.dataset;h.classList.add('js');var t=null;try{if(d.hwioThemeCookieDomain){var m=document.cookie.match(/(?:^|; )hwio_theme=(dark|light)/);if(m)t=m[1]}if(!t)t=localStorage.getItem('hwio_theme')||localStorage.getItem('theme')}catch(e){}if(!h.getAttribute('data-theme')&&d.hwioThemeLight){h.setAttribute('data-theme',t==='dark'&&d.hwioThemeDark?d.hwioThemeDark:d.hwioThemeLight)}})();`;

/**
 * Pre-paint font gate (owner ruling R3: font-display block + gate, flicker-free). Reads
 * <html data-hwio-font-family="Inter" data-hwio-font-sample="..." data-hwio-font-sample-ext="...">
 * and keeps the body invisible (class fonts-loading) until both faces decode, with a bounded
 * failure that pins the metric-matched fallback (class fonts-failed) instead of flashing.
 *
 * The script sits in <head> before the page's styles, so when it runs the family's @font-face rules
 * are not parsed yet, and document.fonts.load() on a family nobody has declared resolves at once
 * with nothing: the gate opened about a second before the faces arrived (2026-11-10). It therefore
 * first waits until the family is declared (or the document has loaded, which ends the wait for a
 * page that never declares it), then asks for the faces. One timer bounds the whole wait.
 *
 * It asks for every weight the family declares as a file of its own (enerooo's Poppins: 400, 600 and
 * 700), not only for 400: a heading in a weight that arrived after the gate re-wrapped the page.
 * A variable face (Inter, one file for 100 to 900) counts once.
 */
export const fontGate = `(function(){var h=document.documentElement,d=h.dataset,fam=d.hwioFontFamily;if(!fam||!('fonts' in document)){h.classList.remove('fonts-loading');h.classList.add('fonts-ready');return}var T=5000;function declared(){var ok=false;document.fonts.forEach(function(f){if(f.family.replace(/["']/g,'')===fam)ok=true});return ok}function faces(){return new Promise(function(res){(function poll(){if(declared()||document.readyState==='complete')res();else setTimeout(poll,16)})()})}function weights(){var w={};document.fonts.forEach(function(f){if(f.family.replace(/["']/g,'')===fam)w[/^\\d+$/.test(f.weight)?f.weight:'400']=1});var k=Object.keys(w);return k.length?k:['400']}function load(w,s){return document.fonts.load(w+' 1em "'+fam+'"',s)}if(!window.__hwioFontGate){window.__hwioFontGate={state:'loading',ready:Promise.race([new Promise(function(res,rej){setTimeout(function(){rej(new Error('font timeout'))},T)}),faces().then(function(){var a=d.hwioFontSample||'HARDWARIO',b=d.hwioFontSampleExt||'Řešení Vývojáři Odwiedź';return Promise.all(weights().reduce(function(l,w){return l.concat([load(w,a),load(w,b)])},[]))})])};document.addEventListener('astro:before-swap',function(ev){var n=ev.newDocument.documentElement;n.classList.add('js');n.classList.remove('fonts-loading');n.classList.toggle('fonts-failed',window.__hwioFontGate.state==='failed');n.classList.add('fonts-ready');var cur=h.getAttribute('data-theme');if(cur)n.setAttribute('data-theme',cur);else n.removeAttribute('data-theme')})}window.__hwioFontGate.ready.then(function(){window.__hwioFontGate.state='ready';h.classList.remove('fonts-loading');h.classList.add('fonts-ready')},function(){window.__hwioFontGate.state='failed';h.classList.remove('fonts-loading');h.classList.add('fonts-failed','fonts-ready')})})();`;
