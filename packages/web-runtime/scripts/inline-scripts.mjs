// Static inline bootstraps. They must never be templated per site: everything that varies is
// read from data-hwio-* attributes on <html>, so the SHA-256 in CSP `script-src` stays stable.

/** Google Consent Mode v2 denied defaults. Must run before any tag. */
export const consentDefaults = `(function(){window.dataLayer=window.dataLayer||[];window.gtag=window.gtag||function(){window.dataLayer.push(arguments)};window.gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',functionality_storage:'denied',personalization_storage:'denied',security_storage:'granted'})})();`;

/**
 * Pre-paint theme restore. Reads <html data-hwio-consent-version data-hwio-theme-light data-hwio-theme-dark>.
 * Applies a stored explicit choice only when it was stored under the current consent version
 * (preferences consent). Legacy keys from the pre-design-system sites are honoured once.
 */
// Stamps data-theme before paint: the stored choice when its consent version matches, otherwise the
// system scheme. A stamped attribute is what lets non-default DaisyUI themes (hwio-forestry) and every
// [data-theme$="-dark"] rule apply; DaisyUI's default/prefersdark flags remain the no-JS fallback.
export const themeBootstrap = `(function(){var h=document.documentElement,d=h.dataset;h.classList.add('js');try{var v=d.hwioConsentVersion;var sv=localStorage.getItem('hwio_theme_consent_version')||localStorage.getItem('hw_theme_consent_version');if(v&&sv===v){var t=localStorage.getItem('hwio_theme')||localStorage.getItem('theme');if(t==='dark'&&d.hwioThemeDark)h.setAttribute('data-theme',d.hwioThemeDark);else if(t==='light'&&d.hwioThemeLight)h.setAttribute('data-theme',d.hwioThemeLight)}}catch(e){}if(!h.getAttribute('data-theme')&&d.hwioThemeLight){var dk=false;try{dk=matchMedia('(prefers-color-scheme: dark)').matches}catch(e){}h.setAttribute('data-theme',dk&&d.hwioThemeDark?d.hwioThemeDark:d.hwioThemeLight)}})();`;

/**
 * Pre-paint font gate (owner ruling R3: font-display block + gate, flicker-free). Reads
 * <html data-hwio-font-family="Inter" data-hwio-font-sample="..." data-hwio-font-sample-ext="...">
 * and keeps the body invisible (class fonts-loading) until both faces decode, with a bounded
 * failure that pins the metric-matched fallback (class fonts-failed) instead of flashing.
 */
export const fontGate = `(function(){var h=document.documentElement,d=h.dataset,fam=d.hwioFontFamily;if(!fam||!('fonts' in document)){h.classList.remove('fonts-loading');h.classList.add('fonts-ready');return}var T=5000;function load(s){return new Promise(function(res,rej){var id=setTimeout(function(){rej(new Error('font timeout'))},T);document.fonts.load('400 1em "'+fam+'"',s).then(function(f){clearTimeout(id);res(f)},function(e){clearTimeout(id);rej(e)})})}if(!window.__hwioFontGate){window.__hwioFontGate={state:'loading',ready:Promise.all([load(d.hwioFontSample||'HARDWARIO'),load(d.hwioFontSampleExt||'Řešení Vývojáři Odwiedź')])};document.addEventListener('astro:before-swap',function(ev){var n=ev.newDocument.documentElement;n.classList.add('js');n.classList.remove('fonts-loading');n.classList.toggle('fonts-failed',window.__hwioFontGate.state==='failed');n.classList.add('fonts-ready');var cur=h.getAttribute('data-theme');if(cur)n.setAttribute('data-theme',cur);else n.removeAttribute('data-theme')})}window.__hwioFontGate.ready.then(function(){window.__hwioFontGate.state='ready';h.classList.remove('fonts-loading');h.classList.add('fonts-ready')},function(){window.__hwioFontGate.state='failed';h.classList.remove('fonts-loading');h.classList.add('fonts-failed','fonts-ready')})})();`;
