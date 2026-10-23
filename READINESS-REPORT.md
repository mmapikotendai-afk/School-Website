# Website audit and implementation ? 23 October 2026

Existing design, colours, crest, typography, animations, routes and enquiry-draft behavior are retained. JavaScript App Router, Tailwind 4 with CSS-defined tokens, locally hosted fonts, Supabase staff CMS. No router migration or new library was introduced.

## All 19 requirements

| # | Feature | Before | After |
|---|---|---|---|
| 1 | Custom 404 | Branded home link | Retained; admissions/contact recovery links; HTTP status checked |
| 2 | Above-fold CTA | Existing school/admissions actions | Preserved; narrow-screen wrapping fixed |
| 3 | Unique titles | Existing titles on public pages | Shared metadata helper and titles for new legal pages |
| 4 | Descriptions | Existing static/CMS descriptions | Preserved and extended to legal pages |
| 5 | Social images | Partial news/event OG only | Canonical/OG/Twitter metadata across public pages; crest-based 1200?630 PNG fallback |
| 6 | Favicons | JPEG icon only | ICO, 192px PNG and 180px Apple icon from supplied crest |
| 7 | Robots | Review block; public launch excluded only portal | Review block retained; launch excludes admin/API/portal/thank-you; sitemap in both modes |
| 8 | Sitemap | Public routes, first 1000 news | Deduplicated canonical routes; legal pages; legacy privacy and portal excluded; news pagination; CMS modification dates when available |
| 9 | Images/alt | Most public images labelled; browser alt validation | Server rejects news/event images without descriptions; optimized local hero image; cover aspect ratio reserves space |
| 10 | Responsive | Existing responsive CSS | 320px hero/motto overflow fixed; mobile fields use 16px text; filters have 44px targets |
| 11 | Sticky mobile CTA | Absent | Homepage admissions link with safe-area padding; hidden during menu/consent; omitted on forms |
| 12 | Loading/errors | News/admin loading and pending forms | Shared route loading and retry boundary; enquiry duplicate guard, pending/error handling, bounded upstream requests |
| 13 | Form errors | Browser validation, CMS server validation | Accessible field errors, focus first invalid field, retained inputs; existing CMS validation plus required image alt |
| 14 | Thank-you | No public server submission | Not applicable: form prepares local download/email draft. No fabricated success page or delivery claim |
| 15 | Privacy | Short /privacy notice | /privacy-policy with actual draft/CMS/map/analytics/storage practices; legacy permanent redirect; clearly pending school review |
| 16 | Terms | Absent | /terms draft reflects informational site and external portal; no invented legal guarantees |
| 17 | Consent | No tracking or consent interface | Accept/Reject/Preferences when GA configured; versioned 180-day choice; denial on storage failure; withdrawal disables tracking and clears GA cookies |
| 18 | Analytics | Absent | Optional environment-configured GA4; consent gate; manual sanitized page views; draft-prepared event; disabled without ID |
| 19 | Contacts/schema | Contact page used supplied records | Footer reuses same source; School JSON-LD uses existing address, coordinates and phones; missing email/hours remain missing |

## Implementation details and limits

- Root title template and review noindex protections remain. Set an approved HTTPS production domain and explicitly enable public launch only after school approval. Canonicals and social URLs use that configured origin.
- News/event publishing and media routes retain staff authorisation and database RLS. Metadata never imports private portal records. Security headers add frame restrictions, MIME sniffing protection, referrer/permission controls and a limited CSP compatible with existing code and PDF embedding. This CSP is not a full script-source lockdown.
- Local font files already avoid third-party font requests; they were preserved. Existing compressed CMS WebP images continue using native image elements; no broad remote image-optimizer allowlist was added. The crest uses next/image. No measured Core Web Vitals improvement is claimed.
- CMS queries already fall back to empty content when the provider fails. The new eight-second timeout bounds upstream wait; provider availability and actual published content must be verified before launch. Cached empty responses may remain until revalidation.
- Privacy/terms are transparent review drafts. School/controller contact, retention, provider arrangements, international transfers and Zimbabwean obligations require owner confirmation and qualified legal review. No claim of legal compliance is made.
- No public enquiry endpoint or recipient exists. Creating a delivery service or storing pupil enquiries would change processing practices and requires confirmed operational details. The form continues downloading or opening a draft locally; no thank-you redirect is appropriate.

## Manual setup

1. Confirm NEXT_PUBLIC_SITE_URL (approved HTTPS origin), school contact details, privacy contact, email and office hours. Existing phone/address data came from the project; independently reconfirm before launch.
2. Restore/verify Supabase access, staff roster, storage policies, RLS and publishing. Test authenticated save/delete/preview flows with authorised accounts; no production records were changed during this audit.
3. Approve legal drafts and provider retention/transfer settings. Confirm applicable registration/licensing or other Zimbabwean obligations with an adviser.
4. If choosing GA4, set NEXT_PUBLIC_GA_ID and rebuild. In the GA web stream, disable Enhanced Measurement automatic history/page views and automatic form/outbound/download events; this implementation owns page views and the enquiry_draft_prepared event. Configure that event as a key event only if useful; it means a local draft was prepared, never a submitted enquiry. Disable Google signals/ad personalisation, review retention, and verify consent, rejection, withdrawal, expiry and navigation in DebugView before activation. Do not include personal information in page slugs or titles.
5. Verify domain ownership in Search Console using the provider DNS record; submit /sitemap.xml after approved launch. Review current robots/noindex output before requesting indexing.

## Reference material consulted

- Next.js metadata documentation: https://nextjs.org/docs/app/getting-started/metadata-and-og-images
- POTRAZ-hosted Cyber and Data Protection Act: https://www.potraz.gov.zw/wp-content/uploads/2022/02/Data-Protection-Act-5-of-2021.pdf
- npm advisory references returned by the dependency audit: https://github.com/advisories/GHSA-2464-fhr4-w9xw and https://github.com/advisories/GHSA-p3m5-59mp-jv5r

## Files changed

- `.env.example`
- `.gitignore`
- `app/[slug]/page.js`
- `app/about/policies/[slug]/page.js`
- `app/about/policies/page.js`
- `app/events/[slug]/page.js`
- `app/events/page.js`
- `app/globals.css`
- `app/layout.js`
- `app/news/[article]/page.js`
- `app/news/page.js`
- `app/not-found.js`
- `app/page.js`
- `app/robots.js`
- `app/sitemap.js`
- `components/AppChrome.js`
- `components/Footer.js`
- `components/Interactive.js`
- `components/PageContent.js`
- `lib/cms/actions.js`
- `lib/cms/queries.js`
- `lib/site-config.js`
- `lib/supabase/fetch.js`
- `next.config.mjs`
- `package-lock.json`
- `package.json`
- `scripts/browser-check.mjs`
- `READINESS-REPORT.md`
- `app/error.js`
- `app/loading.js`
- `app/privacy-policy/page.js`
- `app/terms/page.js`
- `components/Consent.js`
- `components/MobileCTA.js`
- `lib/seo.js`
- `public/apple-icon.png`
- `public/favicon.ico`
- `public/icon.png`
- `public/social-card.png`
- `scripts/check-readiness.mjs`

## Final verification

| Check executed | Result |
|---|---|
| npm run build (Next.js 15.5.28) | PASS; all routes built. CMS fetch failures were logged and existing empty-content fallbacks rendered. Webpack cache serialization warnings are development/build-cache advisories. |
| npm run check | PASS; static content, approved-content filters, policy records and academic constants |
| npm audit --omit=dev --json (live registry) | PASS; zero reported vulnerabilities after 15.5.27 ? 15.5.28 patch. The initial audit found two advisories affecting Next.js; both were resolved by the patch. |
| node scripts/check-readiness.mjs | PASS against production; unique titles/descriptions, canonical/OG/Twitter metadata, icon/social assets, robots/sitemap, HTTP 404, field errors/focus, retained draft fields/download, absent unconfigured tracking, security headers |
| node scripts/browser-check.mjs | PASS against production; 14 public routes at 320, 375, 430, 768, 1024, 1440, 1920 and 390px; no horizontal overflow; one h1 per page; images loaded; 20 internal links return 200; tabs, menus, policy filtering/PDF links, FAQs, gallery focus, map marker/directions, enquiry draft and admin redirect |
| npm run check:performance | PASS; route separation, responsive layout, reduced motion, mobile admin link, gallery focus, WOFF2 fonts, dashboard protection and unauthenticated upload rejection |
| Browser console sweep | PASS; zero console errors on all 14 public routes; browser suite separately found zero page exceptions |
| Visual review | Inspected rendered 320px homepage, final 1440px homepage and 1200?630 social card; retained brand and corrected narrow-screen overflow and footer address contrast |
| git diff --check | PASS; only configured Windows line-ending notices |
| Dedicated lint command | Not available in existing package.json. Next build completed its configured lint/type-validity stage. No ESLint dependency was added. |
| TypeScript check | Not applicable; JavaScript project with no TypeScript checker configured |

### Verification boundaries

- No GA ID is configured. Verified that no Google tracking script loads in that state. Live accept/reject/revoke flows, network events, conversion reporting, automatic-history setting and Google retention require a real school-owned GA property before activation. These are not claimed as executed tests.
- Public dynamic content currently renders the existing empty states because Supabase is unreachable from this environment. No live article/event metadata fixture, scheduled publication, authenticated editor save or database policy integration test was possible. SQL policies and server staff checks were reviewed; unauthenticated dashboard/media access was exercised.
- There is deliberately no server enquiry submission or submission thank-you page. Only draft validation, preparation and download were exercised. No messages were sent and no school records were edited.
- Keyboard interactions, semantics, alt attributes, narrow layouts, focus restoration and reduced motion were checked. This is not a complete WCAG 2.2 AA certification, screen-reader audit or physical-device test. No Lighthouse/Core Web Vitals measurement is claimed.
- The review build remains noindex. Search Console verification, approved production indexing, legal approval and contact reconfirmation remain owner tasks.

Screenshots and machine-readable browser results are local, ignored artifacts under .impeccable/review/. To repeat browser checks, start the production server on 127.0.0.1:3000 first, then run the commands above. The final successful build used npm and the existing lockfile, updated for the Next.js patch.
