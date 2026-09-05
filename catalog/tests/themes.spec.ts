import { test, expect } from '@playwright/test';

const THEMES = ['hwio', 'hwio-dark', 'hwio-forestry', 'hwio-forestry-dark', 'er3o'];

for (const theme of THEMES) {
  test(`all components render under ${theme}`, async ({ page }) => {
    await page.goto(`/${theme}/`);
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('[data-catalog-all]')).toBeVisible();
    await expect(page).toHaveScreenshot(`${theme}.png`, { fullPage: true });
  });
}

test('consent banner shows on a fresh visit and hides after accept', async ({ page }) => {
  await page.goto('/hwio/consent/');
  const banner = page.locator('[data-hwio-consent]');
  await expect(banner).toBeVisible();
  await banner.locator('[data-hwio-consent-accept]').click();
  await expect(banner).toBeHidden();
  const cookie = (await page.context().cookies()).find((c) => c.name === 'hwio_cookie_consent');
  expect(cookie).toBeTruthy();
});
