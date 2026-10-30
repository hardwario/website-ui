// Contrast findings the catalog's axe gate accepts knowingly. Each entry names the owner decision or
// the open change request behind it (website-admin DESIGN-SYSTEM.md, "Web layer on the Brand
// Guidelines"); remove the entry when the owner rules. Only nodes matching `selector` under the listed
// themes are excused; every other serious or critical finding still fails the test.
export interface AxeException { rule: string; themes: string[]; selector: string; reason: string }

export const AXE_EXCEPTIONS: AxeException[] = [
  {
    rule: 'color-contrast',
    themes: ['hwio'],
    selector: '.hwio-tone-alt .hwio-kicker, .hwio-tone-alt .hwio-eyebrow',
    reason:
      'Red kicker on Panel, 4.46:1 against the 4.5:1 of WCAG AA. The Brand Guidelines HBG.261028.01 r2 (chapter 03, Proportions and contrast) allow Red on Panel for short caps labels; change request CR-1, open with the owner.',
  },
];
