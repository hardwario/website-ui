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

  test('a slow move from a trigger down into its panel keeps the panel open', async ({ page }) => {
    const box = (await trigger(page).boundingBox())!;
    const x = box.x + box.width / 2;
    await page.mouse.move(x, box.y + box.height / 2, { steps: 4 });
    await expect(trigger(page)).toHaveAttribute('aria-expanded', 'true');
    const panelTop = await page.locator('.catalog-stage [data-hwio-mega-panel="products"]').evaluate((el) => el.getBoundingClientRect().top);
    // About 30 px down to the panel in 600 ms, slower than any grace period on the empty strip under the label.
    for (let y = box.y + box.height / 2; y <= panelTop + 12; y += 2) {
      await page.mouse.move(x, y);
      await page.waitForTimeout(40);
    }
    await page.waitForTimeout(400);
    await expect(trigger(page)).toHaveAttribute('aria-expanded', 'true');
  });

  test('moving along the nav from one mega item to the next switches the panel without closing it', async ({ page }) => {
    // The fixture has one mega item: clone it (and its panel) beside it, then re-bind the nav runtime.
    await page.evaluate(() => {
      const li = document.querySelector('.catalog-stage [data-hwio-mega-trigger="products"]')!.closest('li')!;
      const copy = li.cloneNode(true) as HTMLElement;
      copy.querySelector('[data-hwio-mega-trigger]')!.setAttribute('data-hwio-mega-trigger', 'second');
      li.after(copy);
      const panel = document.querySelector('.catalog-stage [data-hwio-mega-panel="products"]')!;
      const panelCopy = panel.cloneNode(true) as HTMLElement;
      panelCopy.setAttribute('data-hwio-mega-panel', 'second');
      panelCopy.removeAttribute('id');
      panel.after(panelCopy);
      document.dispatchEvent(new Event('astro:page-load'));
    });
    const next = page.locator('.catalog-stage .hwio-nav > li').nth(1);
    const second = page.locator('.catalog-stage [data-hwio-mega-trigger="second"]');
    const box = (await trigger(page).boundingBox())!;
    const y = box.y + box.height / 2;
    await page.mouse.move(box.x + box.width / 2, y, { steps: 4 });
    await expect(trigger(page)).toHaveAttribute('aria-expanded', 'true');
    // Count the moments no panel is open while the pointer crosses into the next item.
    await page.evaluate(() => {
      const w = window as unknown as { __closed: number };
      w.__closed = 0;
      const panels = Array.from(document.querySelectorAll<HTMLElement>('.catalog-stage [data-hwio-mega-panel]'));
      new MutationObserver(() => { if (panels.every((p) => p.hidden)) w.__closed += 1; }).observe(document.querySelector('.catalog-stage header')!, { subtree: true, attributes: true, attributeFilter: ['hidden'] });
    });
    const nb = (await next.boundingBox())!;
    for (let x = box.x + box.width / 2; x <= nb.x + nb.width / 2; x += 3) {
      await page.mouse.move(x, y);
      await page.waitForTimeout(15);
    }
    await page.waitForTimeout(400);
    expect(await page.evaluate(() => (window as unknown as { __closed: number }).__closed)).toBe(0);
    await expect(second).toHaveAttribute('aria-expanded', 'true');
    await expect(trigger(page)).toHaveAttribute('aria-expanded', 'false');
  });

  test('hover in the bar and in a panel ends at once, with no fade left behind the pointer', async ({ page }) => {
    // A 200 ms fade-out kept the item just passed glowing while the pointer was already on the next one.
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    const bg = (el: Element) => getComputedStyle(el).backgroundColor;
    const links = page.locator('.catalog-stage [data-hwio-mega-panel="products"] ul a');
    const centre = async (l: ReturnType<Page['locator']>) => { const b = (await l.boundingBox())!; return [b.x + b.width / 2, b.y + b.height / 2] as const; };
    const triggerRest = await trigger(page).evaluate(bg);
    await page.mouse.move(...(await centre(trigger(page))), { steps: 4 });
    await expect.poll(() => trigger(page).evaluate(bg)).not.toBe(triggerRest);
    // Fully lit first: a fade that was cut short also ends early, and the test would pass with it.
    await page.waitForTimeout(250);
    const linkRest = await links.first().evaluate(bg);
    await page.mouse.move(...(await centre(links.first())), { steps: 3 });
    await page.waitForTimeout(50);
    expect(await trigger(page).evaluate(bg)).toBe(triggerRest);
    expect(await links.first().evaluate(bg)).not.toBe(linkRest);
    await page.waitForTimeout(250);
    await page.mouse.move(...(await centre(links.nth(1))), { steps: 3 });
    await page.waitForTimeout(50);
    expect(await links.first().evaluate(bg)).toBe(linkRest);
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

  test('a fixed layer outside the header (a cookie banner) stays clickable while the menu is open', async ({ page }) => {
    await page.evaluate(() => {
      document.body.insertAdjacentHTML('beforeend', '<div id="t-layer" style="position:fixed;inset-inline:0;bottom:0;z-index:120;background:#fff;padding:1rem"><button type="button" id="t-accept">Accept all</button></div>');
      document.getElementById('t-accept')!.addEventListener('click', () => document.getElementById('t-layer')!.remove());
    });
    await toggle(page).evaluate((el) => (el as HTMLElement).click());
    await expect(toggle(page)).toHaveAttribute('aria-expanded', 'true');
    expect(await page.locator('#t-layer').evaluate((el) => (el as HTMLElement).inert)).toBe(false);
    await page.locator('#t-accept').click();
    await expect(page.locator('#t-layer')).toHaveCount(0);
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

// The consent banner is part of the first paint on a visit without a stored choice: the inline
// bootstrap behind its markup shows it, not the consent runtime (which would add its module
// requests to the banner's paint; on a phone the banner is the page's largest text block).
test.describe('consent banner', () => {
  const banner = (page: Page) => page.locator('[data-hwio-consent]');
  // With every script file held back, only the inline bootstrap can have changed the banner.
  const withoutScriptFiles = (page: Page) => page.route('**/*.js', (route) => route.abort());
  const receipt = (version: string) => encodeURIComponent(JSON.stringify({ version, method: 'reject_all', locale: 'en', timestamp: '2026-11-10T00:00:00.000Z', categories: { necessary: true, preferences: false, statistics: false, marketing: false } }));

  test('a first visit has the banner before the consent runtime runs', async ({ page }) => {
    await withoutScriptFiles(page);
    await page.goto('/hwio/consent/');
    await expect(banner(page)).toBeVisible();
    expect(await page.evaluate(() => 'hwioConsent' in window)).toBe(false);
  });

  test('a stored choice keeps the banner out of the first paint', async ({ page, context, baseURL }) => {
    await context.addCookies([{ name: 'hwio_cookie_consent', value: receipt('2026-09-05'), url: baseURL! }]);
    await withoutScriptFiles(page);
    await page.goto('/hwio/consent/');
    await expect(banner(page)).toBeHidden();
  });

  test('a choice stored under an older version is asked again by the runtime', async ({ page, context, baseURL }) => {
    await context.addCookies([{ name: 'hwio_cookie_consent', value: receipt('2020-01-01'), url: baseURL! }]);
    await page.goto('/hwio/consent/');
    await expect(banner(page)).toBeVisible();
  });

  test('rejecting hides the banner, and the next visit starts without it', async ({ page }) => {
    await page.goto('/hwio/consent/');
    await banner(page).locator('[data-hwio-consent-reject]').click();
    await expect(banner(page)).toBeHidden();
    await withoutScriptFiles(page);
    await page.reload();
    await expect(banner(page)).toBeHidden();
  });
});
