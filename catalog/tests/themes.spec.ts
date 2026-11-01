import { test, expect, type Page } from '@playwright/test';

const THEMES = ['hwio', 'hwio-dark', 'hwio-forestry', 'hwio-forestry-dark', 'er3o'];

/** A full-page screenshot must not race image loading: load lazy images now and wait until every
    image has loaded (or failed) and decoded, so two consecutive captures are identical. */
async function settle(page: Page) {
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(async () => {
    const images = Array.from(document.images);
    images.forEach((img) => {
      if (img.loading === 'lazy') img.loading = 'eager';
    });
    await Promise.all(
      images.map(async (img) => {
        if (!img.complete) {
          await new Promise((resolve) => {
            img.addEventListener('load', resolve, { once: true });
            img.addEventListener('error', resolve, { once: true });
          });
        }
        await img.decode().catch(() => undefined);
      }),
    );
  });
}

for (const theme of THEMES) {
  test(`all components render under ${theme}`, async ({ page }) => {
    await page.goto(`/${theme}/`);
    await settle(page);
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
