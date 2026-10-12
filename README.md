# Presbyterian High School website

A Next.js / React website with a Supabase-backed News & Events CMS, using the school's existing crest and design system. Public content, secure administration, audit logging and automatic image optimisation are integrated in one application.

## Run

Requires Node.js 20.9 or later.

```sh
npm install
npm run dev
```

For a production build:

```sh
npm run check
npm run build
npm run preview
```

Open http://127.0.0.1:3000. Deploy using a Next.js server-capable platform such as Vercel; the CMS uses Server Actions, Route Handlers and Sharp and cannot run as a static export.

## Included

- Dynamic, responsive News and Events listings and detail pages with filtering, pagination, related news, upcoming/past sections and automatic cache revalidation.
- Protected CMS routes for dashboard, news, events and media; Admin and Editor access is explicitly authorised in Supabase.
- Drafts, secure previews, immediate publishing, scheduled publishing, archiving/cancellation and administrator-only permanent deletion.
- Browser image resizing followed by authoritative Sharp validation, EXIF rotation, resize, metadata removal and WebP compression before Supabase Storage.
- Database row-level security and audit logs for important content and media changes.
- Accessible academic tabs, mobile navigation, FAQs, searchable/category-filtered news, event listing, gallery filters and keyboard-enabled native dialog.
- Interactive React Leaflet map with OpenStreetMap tiles, a branded school marker, popup and directions link. The verified map point is configured in `lib/content.js`; the tile endpoint can be replaced through `NEXT_PUBLIC_MAP_TILE_URL`.
- Responsive School Policies & Guidelines directory with six categories, keyword search, filtering, an approved-content empty state, and detail routes with PDF viewing, downloads, related documents and enquiry contacts.
- Enquiry form with native validation and a locally downloaded draft. No false submission confirmation. Adding an approved `school.email` switches to an explicitly labelled email-app handoff, not server delivery.
- Separate link to the existing portal; no portal migration, login replacement or access to private academic records.
- Route-specific metadata, skip link, visible focus, reduced-motion support, local fonts, and honest empty states.

## CMS setup

1. Create a Supabase project and copy `.env.example` to `.env.local` with the project URL and publishable key.
2. Apply `supabase/migrations/202610120001_news_events_cms.sql` in the Supabase SQL editor or CLI.
3. Create the first administrator in Supabase Authentication. Copy that user's UUID, then run:

```sql
insert into public.staff_users (id, email, display_name, role)
values ('AUTH-USER-UUID', 'admin@example.com', 'Website Administrator', 'admin');
```

There is intentionally no public registration or automatic promotion trigger. Additional staff must be created in Auth and explicitly inserted with the `admin` or `editor` role. Editors can create, edit, publish, schedule and archive; only Admins can permanently delete content and media or inspect the audit log.

The public database policies expose only records whose state is `published` (or scheduled and now due), whose publication time has arrived, and which are not archived. The application repeats those filters on every public query. Public results are cached for 60 seconds and dashboard mutations trigger immediate revalidation.

## School content

News and events are managed at `/admin/login`. `lib/content.js` continues to hold verified static school information and the gallery. Upload approved gallery photographs to `public/images/` and add captions, meaningful alternative text and categories to `gallery`.

Policy records live in `lib/policies.js` until the administrator dashboard supplies a public-content API. Each record supports an ID, slug, title, description, category, keywords, structured sections, publication and update dates, PDF URL, filename, status and approval flag. Put policy PDFs in `public/policies/`. Approved records require both `status: 'published'` and `approved: true`. Five user-requested interim documents are exposed through the explicit `publicDraft` state and carry a prominent “Draft for school review” notice on the page and PDF; they have no invented publication dates. Run `npm run policies:pdf` after changing their text.

`CONTENT-CHECKLIST.md` tracks the unresolved school input. No unverified telephone numbers, pass rates, founder dates, leadership names or stock campus photographs have been published. The supplied logo is currently the only gallery image.

## Deployment requirements

Set all variables from `.env.example` in the production environment. Use the Supabase dashboard to disable open email sign-up unless it is needed by another application. The CMS itself never exposes a sign-up path and denies authenticated users who are absent from `staff_users`.

Live form delivery requires the school-approved recipient, a delivery service, retention policy, server endpoint, spam controls and operational ownership. Online applications and document uploads are explicitly future scope.

Official domain/DNS, content approval and public launch are pending. This review build has `noindex` metadata and disallows indexing in `robots.txt`. An XML sitemap is generated. For an approved public launch, set `NEXT_PUBLIC_SITE_URL` to the real origin and `NEXT_PUBLIC_PUBLIC_LAUNCH=true`, then rebuild. Add school-approved structured data when details are confirmed. Do not index the separate portal.

## Verification

`npm run check` validates public-content constraints. With a production preview running, `node scripts/browser-check.mjs` uses installed Microsoft Edge through Playwright and checks desktop/mobile routes and key interactions. Screenshots and results are in `.impeccable/review/`.

## Asset provenance

`public/images/school-crest.jpeg` is an unmodified copy of the user-supplied `phs.jpeg`. Playfair Display and Source Sans 3 were downloaded from Google Fonts; license files are beside the fonts. No generated or third-party campus photographs are used.
