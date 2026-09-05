/** Measurement contract shared with the GTM containers: data-track / data-track-location. */
export interface HWioTrack {
  id: string;
  location?: string;
}

export interface HWioLinkItem {
  label: string;
  href: string;
  external?: boolean;
  current?: boolean;
  track?: HWioTrack;
}

export interface HWioMedia {
  src: string;
  alt: string;
  width: number;
  height: number;
  srcset?: string;
  sizes?: string;
}

export interface HWioCta extends HWioLinkItem {
  /** Visual weight; primary is the DaisyUI btn-primary fill. */
  variant?: 'primary' | 'secondary' | 'ghost';
}

export type HWioTone = 'base' | 'alt' | 'neutral';
export type HWioLocale = string;

export interface HWioAlternate {
  lang: string;
  href: string;
}

/** A form field definition for HWioHubSpotForm / HWioFormField. */
export interface HWioFieldDef {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'tel' | 'url' | 'textarea' | 'select' | 'checkbox' | 'hidden';
  required?: boolean;
  placeholder?: string;
  autocomplete?: string;
  options?: { value: string; label: string }[];
  /** UI-only qualification field folded into the message ("Label: value"). */
  messageField?: boolean;
  half?: boolean;
  value?: string;
  rows?: number;
}
