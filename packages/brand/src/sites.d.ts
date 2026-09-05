export interface HWioSite {
  key: string;
  label: string;
  url: string;
  locales: string[];
  defaultLocale: string;
  theme: string;
  layout: 'hub' | 'landing';
  strip: { show: boolean; omit: string[] };
  gtm: string | null;
}
export interface HWioFooterSite { key: string; label: string; href: string }
export const sites: HWioSite[];
export const footerSites: { order: string[]; labels: Record<string, string> };
export const social: Record<string, string | Record<string, string>>;
export const branches: { name: string; country: string; mapUrl: string }[];
export function hwioSite(key: string): HWioSite;
export function hwioSiteUrl(key: string, locale: string): string;
export function hwioFooterSites(input: { self: string; locale: string }): HWioFooterSite[];
export function hwioFooterSitesHtml(input: { self: string; locale: string; label: string }): string;
export function hwioSocialX(locale: string): string;
