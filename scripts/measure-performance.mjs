import { mkdir, writeFile } from 'node:fs/promises';
import nextEnv from '@next/env';

nextEnv.loadEnvConfig(process.cwd());
const args = process.argv.slice(2);
const option = (name, fallback) => args.find(arg => arg.startsWith(`--${name}=`))?.split('=').slice(1).join('=') || fallback;
const origin = option('origin', 'http://127.0.0.1:3000');
const samples = Number(option('samples', '3'));
const label = option('label', 'measurement').replace(/[^a-z0-9-]/gi, '-');
const result = { label, measuredAt: new Date().toISOString(), origin, routes: [], database: [], browser: [] };
const round = value => Math.round(value * 10) / 10;

async function measure(url, options = {}) {
  const start = performance.now();
  try {
    const response = await fetch(url, { ...options, signal: AbortSignal.timeout(20000) });
    const headersMs = performance.now() - start;
    const body = await response.arrayBuffer();
    return {
      status: response.status, ttfbMs: round(headersMs), totalMs: round(performance.now() - start), bytes: body.byteLength,
      cache: response.headers.get('x-vercel-cache') || response.headers.get('x-nextjs-cache'),
      serverTiming: response.headers.get('server-timing'), region: response.headers.get('x-vercel-id'),
    };
  } catch (error) { return { error: error.cause?.code || error.name, totalMs: round(performance.now() - start) }; }
}

for (const path of ['/', '/about/', '/news/', '/events/', '/gallery/', '/admin/login/']) {
  for (let sample = 1; sample <= samples; sample++) {
    const entry = { path, sample, ...await measure(new URL(path, origin)) };
    result.routes.push(entry);
    console.log(JSON.stringify({ type: 'route', ...entry }));
  }
}

if (args.includes('--database')) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error('Configure the Supabase URL and publishable key before measuring database requests.');
  const news = 'id,slug,title,summary,category,author_name,featured_image_url,featured_image_alt,publish_at,created_at';
  const events = 'id,slug,title,summary,cover_image_url,cover_image_alt,start_at,end_at,venue,registration_url,event_status,publish_at,created_at';
  const probes = [
    ['news.current-list', 'news_articles', `${news},content`, 'publish_at.desc', 9],
    ['news.card-fields', 'news_articles', news, 'publish_at.desc', 9],
    ['events.current-list', 'events', `${events},description`, 'start_at.asc', 1000],
    ['events.card-fields', 'events', events, 'start_at.asc', 1000],
    ['gallery.list', 'media_assets', 'id,public_url,alt_text,caption,gallery_category,width,height,published_at', 'published_at.desc', 1000],
  ];
  for (const [operation, table, select, order, limit] of probes) {
    for (let sample = 1; sample <= samples; sample++) {
      const endpoint = new URL(`/rest/v1/${table}`, url);
      endpoint.search = new URLSearchParams({ select, order, limit: String(limit), ...(table === 'media_assets'
        ? { is_gallery: 'eq.true', published_at: `lte.${new Date().toISOString()}` }
        : { status: 'in.(published,scheduled)', publish_at: `lte.${new Date().toISOString()}`, archived_at: 'is.null' }) });
      const entry = { operation, sample, ...await measure(endpoint, { headers: { apikey: key, ...(table === 'news_articles' ? { Prefer: 'count=exact' } : {}) } }) };
      result.database.push(entry);
      console.log(JSON.stringify({ type: 'database', ...entry }));
    }
  }
}

await mkdir('test-results', { recursive: true });
await writeFile(`test-results/performance-${label}.json`, JSON.stringify(result, null, 2));

if (args.includes('--browser')) {
  const { chromium } = await import('@playwright/test');
  const browser = await chromium.launch({ ...(process.env.PERF_BROWSER_PATH ? { executablePath: process.env.PERF_BROWSER_PATH } : { channel: 'msedge' }), headless: true });
  try {
    for (const width of [1440, 390]) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.addInitScript(() => {
        window.__metrics = { lcpMs: 0, cls: 0, longTaskMs: 0 };
        new PerformanceObserver(list => { for (const e of list.getEntries()) window.__metrics.lcpMs = e.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
        new PerformanceObserver(list => { for (const e of list.getEntries()) if (!e.hadRecentInput) window.__metrics.cls += e.value; }).observe({ type: 'layout-shift', buffered: true });
        new PerformanceObserver(list => { for (const e of list.getEntries()) window.__metrics.longTaskMs += e.duration; }).observe({ type: 'longtask', buffered: true });
      });
      for (const path of ['/', '/news/', '/gallery/', '/admin/login/']) {
        const response = await page.goto(new URL(path, origin).href, { waitUntil: 'load', timeout: 30000 });
        await page.waitForTimeout(2000);
        const entry = await page.evaluate(() => {
          const navigation = performance.getEntriesByType('navigation')[0];
          const resources = performance.getEntriesByType('resource');
          return {
            ...window.__metrics, ttfbMs: navigation.responseStart, loadMs: navigation.loadEventEnd,
            scripts: resources.filter(e => e.initiatorType === 'script').map(e => ({ file: new URL(e.name).pathname, bytes: e.encodedBodySize, ms: e.duration })),
            fonts: resources.filter(e => /\.(ttf|woff2?)(\?|$)/.test(e.name)).map(e => ({ file: new URL(e.name).pathname, bytes: e.encodedBodySize, ms: e.duration })),
            rscRequests: resources.filter(e => e.name.includes('_rsc=')).length,
            overflow: document.documentElement.scrollWidth > innerWidth + 1,
          };
        });
        result.browser.push({ width, path, status: response.status(), ...entry, errors: [...errors] });
        console.log(JSON.stringify({ type: 'browser', width, path, status: response.status(), ...entry, errors }));
      }
      await context.close();
    }
  } finally { await browser.close(); }
}
await mkdir('test-results', { recursive: true });
await writeFile(`test-results/performance-${label}.json`, JSON.stringify(result, null, 2));
