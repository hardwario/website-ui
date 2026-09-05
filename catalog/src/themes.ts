export const THEMES = ['hwio', 'hwio-dark', 'hwio-forestry', 'hwio-forestry-dark', 'er3o'] as const;
export type CatalogTheme = (typeof THEMES)[number];
export const isDark = (t: string) => t.endsWith('-dark');
