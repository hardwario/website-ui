/**
 * Attributes for a site's <html> element. The runtime bootstraps (theme, font gate, consent)
 * read these instead of being templated per site, which keeps their CSP hashes stable.
 *   <html {...hwioHtmlAttrs({ lang, consentVersion, themes: { light: 'hwio', dark: 'hwio-dark' }, font: { family: 'Inter', sample, sampleExt } })}>
 */
export interface HWioHtmlOptions {
  lang: string;
  consentVersion: string;
  themes: { light: string; dark?: string };
  /** Pin data-theme on <html> (single-theme sites such as enerooo, or a fixed catalog page). */
  pinTheme?: boolean;
  font?: { family: string; sample?: string; sampleExt?: string } | null;
  class?: string;
}

export function hwioHtmlAttrs(o: HWioHtmlOptions): Record<string, string> {
  const attrs: Record<string, string> = {
    lang: o.lang,
    class: [o.font ? 'fonts-loading' : '', o.class ?? ''].filter(Boolean).join(' '),
    'data-hwio-consent-version': o.consentVersion,
    'data-hwio-theme-light': o.themes.light,
  };
  if (o.themes.dark) attrs['data-hwio-theme-dark'] = o.themes.dark;
  if (o.pinTheme || !o.themes.dark) attrs['data-theme'] = o.themes.light;
  if (o.font) {
    attrs['data-hwio-font-family'] = o.font.family;
    if (o.font.sample) attrs['data-hwio-font-sample'] = o.font.sample;
    if (o.font.sampleExt) attrs['data-hwio-font-sample-ext'] = o.font.sampleExt;
  }
  return attrs;
}
