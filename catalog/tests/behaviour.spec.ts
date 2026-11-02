import { test, expect, type Page } from '@playwright/test';

// Behaviour the screenshots cannot see: the header's popups close the way a menu is expected to
// close (owner, 2026-10-30: "every dropdown closes on an outside click, on Escape and when another
// opens"), and motion is fail-safe (content hides for a reveal only after the reveal runtime has
// started) and plays only when the visitor allows motion.

const dropdown = (page: Page) => page.locator('.catalog-stage header details[data-hwio-dropdown]').first();
const isOpen = (page: Page) => dropdown(page).evaluate((el) => (el as HTMLDetailsElement).open);
const trigger = (page: Page) => page.locator('.catalog-stage [data-hwio-mega-trigger="products"]');

test.describe('header popups', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/hwio/header/');
    await page.evaluate(() => document.fonts.ready);
    await page.mouse.move(5, 800);
  });

  test('the language dropdown closes on a click outside', async ({ page }) => {
    await dropdown(page).locator('summary').click();
    expect(await isOpen(page)).toBe(true);
    await page.mouse.click(640, 800);
    expect(await isOpen(page)).toBe(false);
  });

  test('Escape closes the language dropdown and returns focus to its summary', async ({ page }) => {
    await dropdown(page).locator('summary').focus();
    await page.keyboard.press('Enter');
    expect(await isOpen(page)).toBe(true);
    await page.keyboard.press('Tab');
    await page.keyboard.press('Escape');
    expect(await isOpen(page)).toBe(false);
    expect(await page.evaluate(() => document.activeElement?.tagName)).toBe('SUMMARY');
  });

  test('focus leaving the language dropdown closes it', async ({ page }) => {
    await dropdown(page).locator('summary').focus();
    await page.keyboard.press('Enter');
    for (let i = 0; i < 6; i += 1) await page.keyboard.press('Tab');
    expect(await isOpen(page)).toBe(false);
  });

  test('a mega panel opening closes the dropdown, and the dropdown opening closes the panel', async ({ page }) => {
    await dropdown(page).locator('summary').click();
    await trigger(page).focus();
    await page.keyboard.press('Enter');
    await expect(trigger(page)).toHaveAttribute('aria-expanded', 'true');
    expect(await isOpen(page)).toBe(false);
    await dropdown(page).locator('summary').click();
    expect(await isOpen(page)).toBe(true);
    await expect(trigger(page)).toHaveAttribute('aria-expanded', 'false');
  });

  test('a click after hovering a mega trigger keeps its panel open; the next click closes it', async ({ page }) => {
    const box = (await trigger(page).boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 4 });
    await expect(trigger(page)).toHaveAttribute('aria-expanded', 'true');
    await page.mouse.down();
    await page.mouse.up();
    await expect(trigger(page)).toHaveAttribute('aria-expanded', 'true');
    await page.mouse.down();
    await page.mouse.up();
    await expect(trigger(page)).toHaveAttribute('aria-expanded', 'false');
  });

  test('Escape closes a mega panel and focus returns to its trigger', async ({ page }) => {
    await trigger(page).focus();
    await page.keyboard.press('ArrowDown');
    await expect(trigger(page)).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Escape');
    await expect(trigger(page)).toHaveAttribute('aria-expanded', 'false');
    expect(await page.evaluate(() => document.activeElement?.getAttribute('data-hwio-mega-trigger'))).toBe('products');
  });
});

// The small-screen menu (owner, 2026-11-02: the drawer's close sat elsewhere than the hamburger, and the page
// jumped sideways and to the top when it opened): one toggle that turns into the close in place, a sheet
// under the bar, the page locked where it is.
test.describe('small-screen menu', () => {
  // A phone-wide window in the desktop project (the one CI runs), so a classic scrollbar is present too.
  test.use({ viewport: { width: 390, height: 844 } });
  test.beforeEach(async ({ page }) => {
    await page.goto('/hwio/header/');
    await page.evaluate(() => document.fonts.ready);
  });
  const toggle = (page: Page) => page.locator('.catalog-stage [data-hwio-menu-toggle]');
  const panel = (page: Page) => page.locator('.catalog-stage [data-hwio-menu-panel]');
  const layout = (page: Page) => page.evaluate(() => ({ y: Math.round(scrollY), width: Math.round(document.body.getBoundingClientRect().width) }));

  test('the toggle turns into the close in place, the sheet opens under the bar, the page does not move', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, 120));
    const before = await layout(page);
    const box = await toggle(page).boundingBox();
    await toggle(page).evaluate((el) => (el as HTMLElement).click());
    await expect(toggle(page)).toHaveAttribute('aria-expanded', 'true');
    await expect(toggle(page)).toHaveAttribute('aria-label', 'Close menu');
    await expect(panel(page)).toBeVisible();
    expect(await toggle(page).boundingBox()).toEqual(box);
    expect(await layout(page)).toEqual(before);
    const bar = await page.locator('.catalog-stage header').evaluate((el) => Math.round(el.getBoundingClientRect().bottom));
    // The sheet starts at the bar's bottom edge (it covers the bar's 1 px border with its own).
    expect(Math.abs(await panel(page).evaluate((el) => Math.round(el.getBoundingClientRect().top)) - bar)).toBeLessThanOrEqual(1);
    expect(await page.evaluate(() => document.documentElement.classList.contains('hwio-scroll-lock'))).toBe(true);
  });

  test('Escape closes the menu, focus returns to the toggle and nothing stays locked or inert', async ({ page }) => {
    await toggle(page).focus();
    await page.keyboard.press('Enter');
    await expect(toggle(page)).toHaveAttribute('aria-expanded', 'true');
    expect(await page.evaluate(() => !!document.activeElement?.closest('[data-hwio-menu-panel]'))).toBe(true);
    await page.keyboard.press('Escape');
    await expect(toggle(page)).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle(page)).toHaveAttribute('aria-label', 'Open menu');
    await expect(panel(page)).toBeHidden();
    expect(await page.evaluate(() => document.activeElement?.hasAttribute('data-hwio-menu-toggle'))).toBe(true);
    expect(await page.evaluate(() => document.documentElement.classList.contains('hwio-scroll-lock') || !!document.querySelector('[inert]'))).toBe(false);
  });

  test('a followed link closes the menu', async ({ page }) => {
    await toggle(page).evaluate((el) => (el as HTMLElement).click());
    await panel(page).locator('a[href="#why"]').click();
    await expect(toggle(page)).toHaveAttribute('aria-expanded', 'false');
    expect(await page.evaluate(() => document.documentElement.classList.contains('hwio-scroll-lock'))).toBe(false);
  });
});

test.describe('motion with motion allowed', () => {
  test.use({ reducedMotion: 'no-preference' });

  test('reveals hide only after the runtime has started, then show once in view', async ({ page }) => {
    await page.goto('/hwio/motion/');
    await expect(page.locator('html')).toHaveClass(/hwio-reveal-on/);
    const cards = page.locator('[data-catalog-motion] li[data-hwio-reveal]');
    await cards.last().scrollIntoViewIfNeeded();
    await expect(cards.last()).toHaveAttribute('data-hwio-revealed', 'true');
    await expect.poll(() => cards.last().evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
    expect(await cards.nth(1).evaluate((el) => (el as HTMLElement).style.transitionDelay)).toBe('60ms');
  });

  test('without the runtime (scripts blocked) every revealable element shows', async ({ page }) => {
    await page.route('**/_astro/*.js', (route) => route.abort());
    await page.goto('/hwio/motion/');
    await expect(page.locator('html')).toHaveClass(/\bjs\b/);
    await expect(page.locator('html')).not.toHaveClass(/hwio-reveal-on/);
    const opacities = await page.locator('[data-hwio-reveal]').evaluateAll((els) => els.map((el) => getComputedStyle(el).opacity));
    expect(opacities.length).toBeGreaterThan(0);
    expect(new Set(opacities)).toEqual(new Set(['1']));
    expect(await page.locator('[data-hwio-iso]').evaluate((el) => el.classList.contains('hwio-iso-anim'))).toBe(false);
  });

  test('a key figure counts up once and ends on its exact server text', async ({ page }) => {
    // Record every text the figure shows, from the moment the document is parsed.
    await page.addInitScript(() => {
      const seen: string[] = [];
      (window as unknown as { __counts: string[] }).__counts = seen;
      document.addEventListener('DOMContentLoaded', () => {
        new MutationObserver(() => {
          const el = document.querySelector('[data-hwio-count="7000"]');
          if (el?.textContent) seen.push(el.textContent);
        }).observe(document.body, { subtree: true, childList: true, characterData: true });
      });
    });
    await page.goto('/hwio/figures/');
    const figure = page.locator('[data-hwio-count="7000"]');
    await page.waitForTimeout(1500);
    const seen = await page.evaluate(() => (window as unknown as { __counts: string[] }).__counts);
    expect(seen.length).toBeGreaterThan(2);
    expect(seen.some((t) => t !== '7\u00a0000+')).toBe(true);
    expect(seen[seen.length - 1]).toBe('7\u00a0000+');
    expect(await figure.textContent()).toBe('7\u00a0000+');
    await expect(page.locator('[data-hwio-count="2016"]')).toHaveText('Since 2016');
  });

  test('an isometric scene builds itself once in view', async ({ page }) => {
    await page.goto('/hwio/motion/');
    const scene = page.locator('[data-hwio-iso]');
    await expect(scene).toHaveClass(/hwio-iso-anim/);
    await scene.scrollIntoViewIfNeeded();
    await expect(scene).toHaveClass(/hwio-iso-play/);
  });
});

test.describe('motion under reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('nothing hides, counts or builds: the final state shows at once', async ({ page }) => {
    await page.goto('/hwio/motion/');
    await expect(page.locator('html')).not.toHaveClass(/hwio-reveal-on/);
    await expect(page.locator('[data-catalog-motion] li[data-hwio-reveal]').first()).toHaveAttribute('data-hwio-revealed', 'true');
    expect(await page.locator('[data-hwio-iso]').evaluate((el) => el.classList.contains('hwio-iso-anim'))).toBe(false);
    await page.goto('/hwio/figures/');
    await expect(page.locator('[data-hwio-count="7000"]')).toHaveText('7\u00a0000+');
  });
});
