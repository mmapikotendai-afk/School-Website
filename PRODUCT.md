# Presbyterian High School website
<!-- impeccable:product-schema 1 -->

## Platform
web

## Stack
Next.js (JavaScript), React, Tailwind CSS, Motion and Lucide, as specified in the supplied proposal. Supabase provides authentication, PostgreSQL content storage, row-level security and public media storage; Tiptap provides structured rich-text editing and Sharp provides authoritative server-side image processing. The application requires a Next.js server-capable deployment because the CMS uses Server Actions and Route Handlers; it is not a static export.

## Users
Prospective families, current parents and students, staff and alumni.

## Product Purpose
Introduce the school, explain academic pathways, support admissions enquiries, share approved news and photographs, and connect visitors to the separate results portal.

## Brand Commitments
Presbyterian High School, Mhondoro, Zimbabwe. Preserve supplied crest and motto NECTAMEN CONSUMEBATUR. Follow the proposal's traditional academic character, elegant headings, generous whitespace and restrained motion.

## Evidence on Hand
User supplied website proposal dated 10 October 2026 and phs.jpeg. School photographs, confirmed contacts, detailed admissions criteria, approved stories and current leadership are not supplied. No invented history, metrics, names or imagery representing the campus.

## Capabilities and Constraints
Public sections include a searchable School Policies & Guidelines directory under About Us, an external portal link, dynamic News and Events listings and detail pages, a filterable gallery with accessible lightbox, and enquiry preparation. News supports category filtering, pagination and related stories at stable `/news/[article]` routes. Events are separated into upcoming and past listings with stable `/events/[slug]` routes. Only published content, or scheduled content whose publication time has arrived, is returned publicly; public CMS queries are cached for 60 seconds and content mutations trigger immediate revalidation.

The Supabase-backed CMS at `/admin/login` has no public registration path. Access requires a Supabase Authentication account that is explicitly authorised as an active member of `staff_users`. Editors can create, edit, preview, publish, schedule and archive news and events, cancel events, and upload media. Administrators have the same editorial access plus permanent deletion of content and media, staff-management authority at the database policy layer, and visibility of recent audit activity. Row-level security repeats these boundaries in the database. Insert, update and delete operations for news, events and media create audit-log records; the audit history is readable only by administrators.

News supports draft, scheduled, published and archived states. Events add cancelled content and scheduled, ongoing, completed or cancelled event states. Secure preview routes let authorised staff inspect unpublished records. Scheduled records remain private until their configured publication time in the school website timezone, after which the public queries expose them automatically.

CMS image uploads accept JPEG, PNG, WebP and AVIF originals up to 15 MB. The browser first resizes and converts the image to WebP. The Node.js upload route then validates the decoded file, applies EXIF-aware rotation, constrains it to 2200 by 2200 pixels without enlargement, strips metadata through re-encoding, and writes a quality-82 WebP plus dimensions and compression metadata to the public `cms-media` Supabase Storage bucket. Alternative text is required when an image is attached to news or an event. Only administrators can permanently remove stored media.

Six fixed policy categories organise records. Each policy or clearly marked review draft supports a stable detail URL, accessible web copy, embedded PDF, view and download actions, related-policy links and school contact details. Five general interim guidance documents are public review drafts; location-specific systems and terminology from the supplied reference were removed. They carry no invented publication dates. Policy records, verified static school information and the gallery remain file-managed; policy CMS integration is still future work. The site has no verified recipient or contact delivery service. There is no results database access. Online applications and visitor-submitted document uploads are future scope.

The policy schema remains ready for a future adapter to an authorised administration system. That integration should support draft creation, editing, PDF upload, approval, publication and update dates while keeping unapproved drafts and private student data out of public responses. It is separate from the implemented News & Events CMS and from the existing Results Portal.

## Open decisions
School-approved content, contact destination, official domain, production Supabase provisioning, authorised staff roster and public launch remain pending. This is a private review build. Technical and visual choices follow the user's proposal; no additional standing workflow preferences are inferred.
