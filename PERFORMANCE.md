# Performance investigation — 13 October 2026

## Evidence and changes

- The production prerender manifest registered `/news` as a generated `/[slug]` page even though `app/news/page.js` owns that URL and requires request-time search parameters. Local production requests returned HTTP 500 with `DYNAMIC_SERVER_USAGE`. Static parameters now come from the actual information-page views, excluding the dedicated CMS news route. The rebuilt route returns HTTP 200 and supports category filters and article navigation.
- Public news and event cards fetched the complete rich-text bodies, although cards only display summaries. Read-only probes against the existing published records measured **3,896 → 846 bytes (78% less)** for news and **2,925 → 947 bytes (68% less)** for events when omitting the bodies. Detail pages still fetch the full content. Filters, publication dates, archiving rules and RLS remain in place.
- Related-news reads were outside the public data cache. They now share the existing 60-second freshness policy and `news` invalidation tag. No staff session or private content is put into a shared cache.
- Browser resource measurements showed the same animation dependency downloaded by home/gallery pages through `Interactive.js`. The hero's existing 0.8-second reveal now uses CSS with the same easing, clipping and reduced-motion behaviour. Motion remains available to the policy UI that uses it.
- Three TTF font files totalled 592,996 bytes on disk and 273,002 encoded bytes in the first desktop homepage resource capture. WOFF2 copies total **194,748 bytes**: 67% less on disk, approximately **29% less than the measured compressed transfers**. Character coverage and glyph spacing match the originals. Preloads discover these fonts before CSS parsing completes.
- Direct checks confirmed HTTP 308 responses for `/admin/dashboard`, `/admin/news`, `/admin/login` and `/api/admin/media`. Admin links, pagination, previews, action redirects and the upload endpoint now use their canonical trailing-slash URLs, removing that extra request. Authentication and staff authorization still execute.
- News has a route-specific loading boundary, allowing navigation feedback while its cached data resolves. A global loading boundary was tested but caused homepage layout shifts, so it was removed. The static homepage and other information pages retain their existing rendering behaviour.

## Measured baseline and interpretation

Three anonymous requests per route to the deployed website produced these median complete HTML response times before the performance patch:

| Route | Median total time |
| --- | ---: |
| `/` | 3,073 ms |
| `/about/` | 2,602 ms |
| `/news/` | 2,217 ms |
| `/events/` | 1,350 ms |
| `/gallery/` | 1,462 ms |
| `/admin/login/` | 2,489 ms |

These include this workstation's network connection. Even cached static `/about/` responses took multiple seconds, so the delay cannot all be attributed to database queries or React. The direct Supabase public-query probes varied from 634 to 9,534 ms. Instrumented production builds also recorded upstream waits of approximately 10–11 seconds; local production runtime reads ranged from hundreds of milliseconds to several seconds. These observations identify significant upstream/network variability, **not a measured PostgreSQL execution time**.

The deployed response IDs indicated a Cape Town edge (`cpt1`) and US function execution (`iad1`) for dynamic requests. The Supabase database region and query execution plans were not available. Do not move the function region speculatively: confirm the database region first and compare timings from a nearby Vercel region. [Vercel's region guidance](https://vercel.com/docs/functions/configuring-functions/region) recommends locating functions close to their data source.

With the first production performance build, a cold local `/news/` request started responding in 91 ms and finished in 2,365 ms; subsequent cached-data responses completed in 144 and 84 ms. Streaming improves response feedback; it does not make the upstream operation itself faster. These local numbers are not a direct comparison with the deployed baseline. [Next.js loading boundaries](https://nextjs.org/docs/app/api-reference/file-conventions/loading) allow the shared navigation to remain interactive while data resolves.

Raw timing/resource captures are in ignored `test-results/performance-*.json`. They contain timing, status and resource sizes, not private data or credentials. `npm run perf:measure` reproduces the measurements. Use `CMS_PERF_LOG=true` temporarily when diagnosing server delays; `auth.getClaims`, staff lookup, content query and `supabase.request` durations distinguish authentication, database API waits and repeated calls.

## Final production-mode comparison

The browser captures below used the same installed Brave browser, fresh desktop/mobile browser contexts, reduced motion, and a local `next start` server. Each browser figure is one lab capture, not a field percentile. Background prefetch downloads are included in the JavaScript byte totals.

| Homepage measurement | Before | Final | Change |
| --- | ---: | ---: | ---: |
| Desktop JavaScript encoded bytes | 156,289 | 118,518 | 24% less |
| Font encoded bytes | 273,002 | 194,748 | 29% less |
| Desktop load event | 585 ms | 384 ms | 34% shorter |
| Mobile load event | 800 ms | 327 ms | 59% shorter |
| Mobile largest contentful paint | 448 ms | 252 ms | 44% shorter |
| Desktop/mobile observed layout shift | ~0.003 | 0 | No observed shift in final capture |

Local news requests returned HTTP 500 before the route correction. In the final run all returned HTTP 200, with warm complete HTML responses of 56 and 56 ms. This is a correctness fix as well as a responsiveness improvement; comparing the old error-page time with the working page would be misleading. The final content checks, build and production browser/security regression checks all passed.

## Files changed

- Public route/loading: `app/[slug]/page.js`, `app/news/loading.js`.
- Fonts and hero: `app/layout.js`, `app/globals.css`, `components/Interactive.js`, `public/fonts/playfair.woff2`, `public/fonts/source-sans.woff2`, `public/fonts/source-sans-semibold.woff2`.
- Queries and upstream instrumentation: `lib/cms/queries.js`, `lib/supabase/fetch.js`, `lib/supabase/public.js`, `lib/supabase/server.js`.
- Canonical admin URLs: `lib/cms/actions.js`, `lib/cms/auth.js`, `lib/supabase/middleware.js`, `components/admin/AdminNav.js`, `components/admin/ContentForm.js`, `components/admin/ContentList.js`, `components/admin/PreviewContent.js`, `components/admin/ImageUploader.js`, `app/admin/(protected)/dashboard/page.js`, `app/admin/(protected)/media/page.js`.
- Reproducible checks and documentation: `scripts/measure-performance.mjs`, `scripts/check-performance.mjs`, `package.json`, `README.md`, `PERFORMANCE.md`.

## Verification and limits

The production build and public-content checks pass. `scripts/check-performance.mjs` checks the prerender-manifest regression, public news filters and detail navigation, desktop/mobile layout, reduced-motion handling, gallery dialog/focus behaviour, the admin header link, font responses, the unauthenticated dashboard redirect and unauthorized upload rejection.

No signed-in administrator session was available, so successful login, authenticated dashboard timings, save/delete operations and uploads were not exercised against the live database. No database migration, hosting region, security policy or production environment variable was changed. Existing authenticated queries remain paginated and parallelized where previously implemented. Sharp remains confined to the upload route, not page rendering.

The public events/gallery queries still return their full published collections. Current probes contain very little data, so they are not demonstrated collection-size bottlenecks. Server-side pagination should be added when collection size warrants it; no content has been silently truncated as a performance workaround.
