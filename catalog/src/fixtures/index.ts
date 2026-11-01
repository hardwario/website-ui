// Fixture registry: one Astro component per HWio component (or group), rendered under every theme.
// Long Czech/German strings are deliberate: diacritics and lengths are part of what is judged.
export const FIXTURES = [
  { slug: 'header', title: 'HWioHeader', file: 'Header' },
  { slug: 'hero', title: 'HWioHeroSplit', file: 'Hero' },
  { slug: 'headlines', title: 'HWioHeroSplit long title (CR-7) + gradient words (CR-8)', file: 'Headlines' },
  { slug: 'stats', title: 'HWioStatsBand', file: 'Stats' },
  { slug: 'figures', title: 'HWioKeyFigure', file: 'Figures' },
  { slug: 'logos', title: 'HWioLogoStrip', file: 'Logos' },
  { slug: 'features', title: 'HWioFeatureGrid', file: 'Features' },
  { slug: 'steps', title: 'HWioProcessSteps', file: 'Steps' },
  { slug: 'choices', title: 'HWioChoiceCards', file: 'Choices' },
  { slug: 'pricing', title: 'HWioPricingTiers', file: 'Pricing' },
  { slug: 'stories', title: 'HWioStoryCard + HWioApplicationTile', file: 'Stories' },
  { slug: 'cutouts', title: 'HWioCutout + HWioPhoto', file: 'Cutouts' },
  { slug: 'menu', title: 'HWioMegaLinks', file: 'Menu' },
  { slug: 'motion', title: 'HWioReveal + HWioIsoScene + arrow nudge', file: 'Motion' },
  { slug: 'faq', title: 'HWioFaq', file: 'Faq' },
  { slug: 'contact', title: 'HWioContactSection + HWioHubSpotForm', file: 'Contact' },
  { slug: 'cta', title: 'Neutral panel + HWioCtaBand', file: 'Cta' },
  { slug: 'primitives', title: 'DaisyUI primitives', file: 'Primitives' },
  { slug: 'breadcrumbs', title: 'HWioBreadcrumbs + HWioNotFound', file: 'Misc' },
  { slug: 'footer', title: 'HWioFooter', file: 'Footer' },
  { slug: 'consent', title: 'HWioCookieConsent', file: 'Consent', standalone: true },
] as const;
export type FixtureSlug = (typeof FIXTURES)[number]['slug'];
