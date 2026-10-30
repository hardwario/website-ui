import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { AXE_EXCEPTIONS } from './a11y-exceptions';

// Accessibility gate over the per-theme "all components" pages: WCAG 2.x A/AA rules, failing on
// serious and critical violations. Moderate and minor findings are attached to the report only, and so
// are the nodes excused in a11y-exceptions.ts (each tied to an owner decision or change request).
const THEMES = ['hwio', 'hwio-dark', 'hwio-forestry', 'hwio-forestry-dark', 'er3o'];

for (const theme of THEMES) {
  test(`axe: no serious or critical violations under ${theme}`, async ({ page }, testInfo) => {
    await page.goto(`/${theme}/`);
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('[data-catalog-all]')).toBeVisible();
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
    await testInfo.attach(`axe-${theme}.json`, { body: JSON.stringify(results.violations, null, 2), contentType: 'application/json' });
    const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    const blocking: typeof serious = [];
    for (const v of serious) {
      const selectors = AXE_EXCEPTIONS.filter((e) => e.rule === v.id && e.themes.includes(theme)).map((e) => e.selector);
      const nodes: typeof v.nodes = [];
      for (const n of v.nodes) {
        const excused = selectors.length > 0 && (await page.evaluate(([target, sel]) => document.querySelector(target)?.matches(sel) ?? false, [String(n.target[0]), selectors.join(', ')] as const));
        if (!excused) nodes.push(n);
      }
      if (nodes.length) blocking.push({ ...v, nodes });
    }
    const summary = blocking.map((v) => `${v.id} (${v.impact}, ${v.nodes.length} nodes): ${v.help}\n  ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join('\n  ')}`).join('\n');
    expect(blocking, summary).toEqual([]);
  });
}
