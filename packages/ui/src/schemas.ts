// Zod fragments for site content collections (Astro's bundled zod), so rebuilt micro-sites
// validate the YAML that feeds the composed components.
import { z } from 'astro/zod';

export const hwioCtaSchema = z.object({
  label: z.string(),
  href: z.string(),
  external: z.boolean().optional(),
  track: z.object({ id: z.string(), location: z.string().optional() }).optional(),
});

export const hwioStatSchema = z.object({
  value: z.number(),
  suffix: z.string().optional(),
  label: z.string(),
});

export const hwioStepSchema = z.object({
  title: z.string(),
  text: z.string(),
});

export const hwioFaqItemSchema = z.object({
  q: z.string(),
  a: z.string(),
});

export const hwioFeatureSchema = z.object({
  icon: z.string().optional(),
  title: z.string(),
  text: z.string(),
  href: z.string().optional(),
});

export const hwioTierSchema = z.object({
  name: z.string(),
  price: z.string().optional(),
  description: z.string().optional(),
  features: z.array(z.string()),
  cta: hwioCtaSchema.optional(),
  featured: z.boolean().optional(),
  badge: z.string().optional(),
});

export const hwioLogoSchema = z.object({
  src: z.string(),
  alt: z.string(),
  href: z.string().optional(),
  width: z.number(),
  height: z.number(),
});
