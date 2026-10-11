# Presbyterian High School website

A Next.js / React website implementing the supplied October 2026 proposal, using the user's crest. Tailwind CSS, Motion, and Lucide are included. All fonts and images are served locally.

## Run

Requires Node.js 20.9 or later.

```sh
npm install
npm run dev
```

For the production export:

```sh
npm run check
npm run build
npm run preview
```

Open http://127.0.0.1:3000. Vercel can use the standard Next.js framework preset. The static export is in `out/`. Sites uses the same export for private review hosting.

## Included

- Responsive Home, About, Academics, Admissions, School Life, News & Events, Gallery, Alumni, Contact, Portal and Privacy pages.
- Accessible academic tabs, mobile navigation, FAQs, searchable/category-filtered news, event listing, gallery filters and keyboard-enabled native dialog.
- Enquiry form with native validation and a locally downloaded draft. No false submission confirmation. Adding an approved `school.email` switches to an explicitly labelled email-app handoff, not server delivery.
- Separate link to the existing portal; no portal migration, login replacement or access to private academic records.
- Route-specific metadata, skip link, visible focus, reduced-motion support, local fonts, and honest empty states.

## School content

Edit `lib/content.js`. Keep `news` and `events` empty until school approval; published records require `approved: true` and `status: 'published'`. Store only public content here. Upload approved photos to `public/images/` and add captions, meaningful alternative text and categories to `gallery`. Remove an item from the live gallery by setting `approved: false`.

`CONTENT-CHECKLIST.md` tracks the unresolved school input. No unverified telephone numbers, pass rates, founder dates, leadership names or stock campus photographs have been published. The supplied logo is currently the only gallery image.

## Scope still requiring external input

The proposal's restricted Website Management CMS is a later integration into the **existing administrator application**. Its source, authentication/role model and public-content API contract were not provided. Do not create an unprotected editor or connect this public site to the results database. Current content is file-managed; this is not a deployed CMS.

Live form delivery requires the school-approved recipient, a delivery service, retention policy, server endpoint, spam controls and operational ownership. Online applications and document uploads are explicitly future scope.

Official domain/DNS, content approval and public launch are pending. This review build has `noindex` metadata and disallows indexing in `robots.txt`. An XML sitemap is generated. For an approved public launch, set `NEXT_PUBLIC_SITE_URL` to the real origin and `NEXT_PUBLIC_PUBLIC_LAUNCH=true`, then rebuild. Add school-approved structured data when details are confirmed. Do not index the separate portal.

## Verification

`npm run check` validates public-content constraints. With a production preview running, `node scripts/browser-check.mjs` uses installed Microsoft Edge through Playwright and checks desktop/mobile routes and key interactions. Screenshots and results are in `.impeccable/review/`.

## Asset provenance

`public/images/school-crest.jpeg` is an unmodified copy of the user-supplied `phs.jpeg`. Playfair Display and Source Sans 3 were downloaded from Google Fonts; license files are beside the fonts. No generated or third-party campus photographs are used.
