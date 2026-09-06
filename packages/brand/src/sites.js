// Sites registry and the cross-site footer strip rules (owner rulings in website-admin
// AGENTS.md: fixed order, self omitted, academy omits Docs and STEM until the TOWER docs
// migrate, .report pages and enerooo carry none; engineering's 2026-07-19 exemption was lifted 2026-09-06).
import { sites, footerSites, social, branches } from './sites-data.js';

export { sites, footerSites, social, branches };

export function hwioSite(key) {
  const site = sites.find((s) => s.key === key);
  if (!site) throw new Error(`unknown site key: ${key}`);
  return site;
}

/** Localised URL of a family site for a given locale (root for its default locale, /<lang>/ otherwise). */
export function hwioSiteUrl(key, locale) {
  const site = hwioSite(key);
  const lang = site.locales.includes(locale) ? locale : site.defaultLocale;
  return lang === site.defaultLocale ? `${site.url}/` : `${site.url}/${lang}/`;
}

/** The footer strip entries a site should render, or an empty array when it carries none. */
export function hwioFooterSites({ self, locale }) {
  const site = hwioSite(self);
  if (!site.strip.show) return [];
  return footerSites.order
    .filter((key) => key !== self && !site.strip.omit.includes(key))
    .map((key) => ({ key, label: footerSites.labels[key], href: hwioSiteUrl(key, locale) }));
}

/** Docusaurus footers take an HTML string; this renders the same strip for them. */
export function hwioFooterSitesHtml({ self, locale, label }) {
  const items = hwioFooterSites({ self, locale });
  if (!items.length) return '';
  const links = items
    .map((s) => `<a href="${s.href}" target="_blank" rel="noopener noreferrer">${s.label}</a>`)
    .join('<span aria-hidden="true"> · </span>');
  return `<nav aria-label="${label}"><span class="footer-sites-label">${label}:</span> ${links}</nav>`;
}

/** X (Twitter) account by locale: CS → hardwario_cz, everything else → hardwario_en. */
export function hwioSocialX(locale) {
  return social.x[locale] ?? social.x.default;
}
