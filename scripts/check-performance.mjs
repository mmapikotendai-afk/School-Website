import assert from 'node:assert/strict';
import { mkdir, readFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const origin = process.env.PERF_ORIGIN || 'http://127.0.0.1:3000';
const manifest = JSON.parse(await readFile('.next/prerender-manifest.json', 'utf8'));
assert.notEqual(manifest.routes['/news']?.srcRoute, '/[slug]', 'The CMS news route must not collide with static information pages.');
const browser = await chromium.launch({ ...(process.env.PERF_BROWSER_PATH ? { executablePath: process.env.PERF_BROWSER_PATH } : { channel: 'msedge' }), headless: true });
const errors = [];
await mkdir('.impeccable/review', { recursive: true });
try {
  for (const width of [1440, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    for (const [path, heading] of [['/', 'Rooted in Faith.'], ['/news/', 'From our school community.'], ['/events/', 'Dates to look forward to.'], ['/gallery/', ''] , ['/admin/login/', 'Welcome back.']]) {
      const response = await page.goto(origin + path);
      assert.equal(response.status(), 200, path);
      if (heading) await page.getByRole('heading', { level: 1 }).filter({ hasText: heading }).waitFor();
      else await page.locator('.gallery-result').waitFor();
      await page.evaluate(() => document.fonts.ready);
      assert.equal(await page.locator('h1:visible').count(), 1, `${path} heading`);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, `${path} overflow at ${width}`);
      if (path === '/') {
        assert.equal(await page.locator('.hero-reveal').evaluate(el => getComputedStyle(el).animationName), 'none', 'Reduced motion disables the reveal.');
        if (width === 390) {
          await page.getByRole('button', { name: 'Open navigation' }).click();
          await page.locator('.mobile-secondary').getByRole('link', { name: 'Website administration' }).waitFor();
          await page.getByRole('button', { name: 'Close navigation' }).click();
        }
      }
      if (path === '/gallery/' && await page.locator('.gallery-item').count()) {
        await page.locator('.gallery-item').first().click();
        await page.locator('dialog[open]').waitFor();
        await page.keyboard.press('Escape');
        assert.equal(await page.locator('dialog').evaluate(el => el.open), false);
        assert.equal(await page.locator('.gallery-item').first().evaluate(el => el === document.activeElement), true);
      }
      if (path === '/' || path === '/gallery/' || path === '/admin/login/') {
        await page.screenshot({ path: `.impeccable/review/performance-${path === '/' ? 'home' : path.replaceAll('/', '-')}-${width}.png` });
      }
    }

    await page.goto(origin + '/news/?category=__performance_no_such_category__');
    await page.getByRole('heading', { name: 'No published stories here yet.' }).waitFor();
    await page.getByRole('link', { name: 'View all news' }).click();
    await page.waitForURL('**/news/');
    await page.locator('.public-news-grid, .empty-state').waitFor();
    const story = page.locator('.public-news-grid h2 a').first();
    if (await story.count()) {
      await story.click();
      await page.locator('.article-prose').waitFor();
      await page.getByRole('link', { name: 'Back to all news' }).click();
      await page.waitForURL('**/news/');
    }
    await page.goto(origin + '/admin/dashboard/');
    await page.waitForURL(/\/admin\/login\//);
    await page.getByRole('heading', { name: 'Welcome back.' }).waitFor();
    const denied = await context.request.post(origin + '/api/admin/media/', { multipart: {} });
    assert.equal(denied.status(), 401, 'Unauthenticated uploads must remain forbidden.');
    for (const font of ['playfair', 'source-sans', 'source-sans-semibold']) {
      const response = await context.request.get(`${origin}/fonts/${font}.woff2`);
      assert.equal(response.status(), 200);
      assert.equal((await response.body()).subarray(0, 4).toString(), 'wOF2');
    }
    await context.close();
  }
  assert.deepEqual(errors, [], 'No browser exceptions');
  console.log('Production checks passed: news route, filtering/detail navigation, responsive layout, reduced motion, mobile admin link, gallery focus, WOFF2 fonts, protected dashboard and rejected unauthenticated uploads.');
} finally { await browser.close(); }
