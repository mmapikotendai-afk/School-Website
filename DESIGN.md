---
name: Presbyterian High School
description: An academic prospectus grounded in the school crest, editorial typography and generous whitespace.
colors:
  navy: "#202a70"
  deep: "#141c4c"
  red: "#bd252b"
  ink: "#202338"
  muted: "#626575"
  paper: "#f7f6f2"
  line: "#dddde3"
  white: "#fff"
  focus: "#ae6217"
  field-border: "#b5b8c3"
  placeholder: "#6b6d78"
  light-hover: "#eaeafa"
  filter-hover: "#e7e8ef"
  tab-hover: "#eeedf0"
  note-surface: "#f0f1f6"
  note-text: "#535b77"
typography:
  display:
    fontFamily: "Playfair, Georgia, serif"
    fontSize: "clamp(48px, 4.6vw, 68px)"
    fontWeight: 500
    lineHeight: 1.11
    letterSpacing: "-.035em"
  headline:
    fontFamily: "Playfair, Georgia, serif"
    fontSize: "clamp(32px, 3.05vw, 44px)"
    fontWeight: 500
    lineHeight: 1.16
    letterSpacing: "-.025em"
  title:
    fontFamily: "Playfair, Georgia, serif"
    fontSize: "28px"
    fontWeight: 500
    lineHeight: 1.16
    letterSpacing: "-.025em"
  body:
    fontFamily: "SourceSans, 'Segoe UI', sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.65
  lead:
    fontFamily: "SourceSans, 'Segoe UI', sans-serif"
    fontSize: "23px"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "SourceSans, 'Segoe UI', sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1.65
  button:
    fontFamily: "SourceSans, 'Segoe UI', sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: 1.4
rounded:
  field: "2px"
  control: "3px"
spacing:
  field-inset: "10px 12px"
  button-inset: "13px 23px"
  field-gap: "20px"
  form-inset: "36px"
  section-desktop: "94px"
  section-tablet: "65px"
  section-mobile: "54px"
components:
  button-primary:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.white}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "{spacing.button-inset}"
  button-primary-hover:
    backgroundColor: "{colors.deep}"
  button-light:
    backgroundColor: "{colors.white}"
    textColor: "{colors.navy}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "{spacing.button-inset}"
  button-light-hover:
    backgroundColor: "{colors.light-hover}"
  input:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "{spacing.field-inset}"
  navigation:
    textColor: "{colors.navy}"
    typography: "{typography.label}"
  filter:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "7px 16px"
  filter-selected:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.white}"
  programme-tab:
    textColor: "{colors.navy}"
    padding: "23px 26px"
  programme-tab-selected:
    backgroundColor: "{colors.white}"
  portal-card:
    backgroundColor: "{colors.paper}"
    padding: "45px"
  motto-panel:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.white}"
    padding: "52px 48px"
---

# Design System: Presbyterian High School

## Overview

**Creative North Star: "An Academic Prospectus"**

The school crest anchors a traditional academic identity: navy and white provide structure, red marks emphasis, and warm paper gives longer passages room to breathe. Elegant serif headings sit beside clear sans-serif body copy. The overall character is welcoming, composed and practical.

This is a source-derived record of the implemented design, refreshed from the existing direction contract. There is no approved visual comp. The supplied crest and motto, generous whitespace and restrained animation are durable commitments from the school proposal. The implementation in `app/globals.css`, `app/page.js` and `components/` is the evidence for the values below; the companion sidecar holds preview snippets and schema extensions.

**Key Characteristics:**

- Crest-led navy, red and white identity with warm paper surfaces.
- Editorial serif headings and readable sans-serif text.
- Spacious columns, fine rules and mostly flat surfaces.
- Restrained motion with visible keyboard focus and reduced-motion support.

## Colors

The palette balances formal school navy with warm paper and selective red emphasis. Frontmatter preserves the implemented CSS values; the first eight colors correspond directly to root custom properties.

### Primary

- **School navy** (`navy`): headings, primary buttons, navigation, selected filters and identity panels.
- **Deep navy** (`deep`): utility bar, footer, lightbox and primary-button hover.
- **Crest red** (`red`): headline emphasis, thin rules, active navigation and tab indicators, icons and input caret.

### Neutral

- **Ink** (`ink`): body text and field values.
- **Muted text** (`muted`): paragraphs, secondary descriptions and metadata.
- **Warm paper** (`paper`): editorial section backgrounds, enquiry forms, gallery mounts and portal containers.
- **Divider** (`line`): section, row and field-group separation.
- **White** (`white`): main canvas, crest mount, fields and text on navy.
- **Field border** and **placeholder**: supporting form contrast.
- **Light hover**, **filter hover** and **tab hover**: quiet interaction surfaces.
- **Note surface** and **note text**: supporting informational callouts.

The amber focus color is an accessibility state, not a second brand accent. Pale blue text and translucent dividers on dark panels are component-specific supporting colors, preserved in preview CSS where relevant.

**The Crest Rule.** Preserve the supplied crest's navy, red and white identity and its original proportions.

## Typography

**Display Font:** Playfair Display, exposed locally as `Playfair`, with Georgia and serif fallbacks.
**Body Font:** Source Sans 3, exposed locally as `SourceSans`, with Segoe UI and sans-serif fallbacks.

Both families are self-hosted under `public/fonts/` with swap loading. The heading face declares normal weights 400–500; the body declares regular and semibold ranges. Emphasis uses italic styling and weight 400; no separate italic font face is declared.

### Hierarchy

- **Display:** home hero heading; navy with red italic emphasis.
- **Headline:** general section heading. The internal-page title instead uses `clamp(40px, 4.5vw, 64px)`, line-height 1.16.
- **Title:** base tertiary heading, with contextual sizes on forms, pathway panels and editorial features.
- **Body:** default reading text; mobile body reduces to 17px at the 720px breakpoint. Prose is capped at 70ch.
- **Lead:** introductory text, darker and larger than surrounding paragraphs.
- **Label:** form labels and desktop navigation share the semibold role. Small identity and section labels use spaced uppercase text.
- **Button:** compact semibold action text, paired with a small line icon.

Headings use balanced wrapping and modest negative tracking. Do not flatten their hierarchy into uniform sans-serif headings.

## Layout

The shared container is `min(1240px, calc(100% - 112px))`, centered. Below 1180px, total horizontal inset becomes 64px; below 720px it becomes 40px. Section padding uses the observed desktop, tablet and mobile spacing tokens above; these are extracted values, not a newly imposed spacing scale.

The homepage hero has asymmetric columns (1.2fr / 1fr), while recurring editorial sections pair text and supporting material in two columns. Desktop section gaps generally span 90–110px. The hero retains its compact masthead and authentic crest panel. Internal pages use a paper title band with breadcrumbs and a short red baseline.

At 1180px the layout tightens. At 900px sections reduce spacing and the form's name/email row stacks. At 720px the menu collapses, primary editorial grids stack, route links become rows and filters wrap. Gallery remains two columns until 370px; news becomes one column at 720px. At 1500px and above the hero heading and crest increase in size. Exact media queries live in the sidecar.

## Elevation & Depth

Depth comes mainly from alternating white, paper and navy surfaces, with fine borders dividing content. Most containers have no shadow. Only the crest mount and expanded mobile navigation receive soft shadows; the gallery lightbox uses a dark translucent backdrop.

### Shadow Vocabulary

- **Crest mount:** `0 12px 28px #11184440`; separates the white identity asset from its navy panel.
- **Mobile navigation:** `0 14px 20px #141c4c12`; marks the overlaid menu below the masthead.
- **Lightbox backdrop:** `#0d1028e8`; isolates the opened image.

**The Editorial Surface Rule.** Keep ordinary content flat; use rules and tonal surfaces before adding elevation.

## Shapes

Content panels, image mounts and editorial blocks have square corners. Buttons, filters and search use the small control radius; fields use the smaller field radius. Borders are usually 1px, while active navigation uses a 2px red line, tabs use 3px and the admissions strip starts with 5px of red. Line icons support text rather than replacing labels.

## Components

### Buttons and text links

Primary buttons pair navy with white and darken on hover. Light buttons sit on navy and adopt the pale hover surface. Buttons have a minimum height of 52px and a 30px icon gap. Text links use navy, a transparent baseline that turns red on hover, and smaller spacing.

Shared keyboard focus is an amber 3px outline offset by 5px. Hover moves action arrows 3px horizontally; color and transform transitions take 0.2s. There is no separate custom active-button treatment.

### Navigation

The utility bar is deep navy; the main masthead is white with the authentic crest and serif school name. Desktop links are semibold navy, become red on hover, and identify the current page with a red underline. The mobile menu expands below the header, includes secondary links, closes on route changes or Escape, and restores focus to its toggle on Escape.

About uses an accessible disclosure button for the school overview and School Policies. Its desktop panel uses a red top rule and restrained shadow; on small screens it becomes part of the existing stacked navigation.

### Academic pathway tabs

Three broad serif tabs share a baseline. The selected tab uses white and a red bottom edge; hover uses the pale tab surface. Small sans-serif year labels sit above pathway names. Arrow keys, Home and End move selection and focus; the current content is an associated tab panel.

### Filters and search

Category filters are small rectangular paper buttons. Selected filters become navy with white text; unselected hover uses the filter-hover surface. Selection is exposed through `aria-pressed`. The adjacent search field has a thin border and an inline search icon. Event mode disables news search and lowers its wrapper opacity to 0.5.

### Inputs and enquiry form

The paper form container uses its own inset. Labels are semibold navy; fields are white with a thin field border, a minimum height of 46px and the field inset. Textareas resize vertically up to 500px. Native required, email and length validation remain in use; no bespoke error or disabled-field palette is implemented. Consent uses a navy checkbox accent. Status copy remains visually quiet, with a live status announcement.

### Containers and motto panel

Portal and news containers are flat paper blocks, with serif headings and muted copy. The navy motto panel is the signature editorial feature: oversized serif quotation mark, a white serif motto, a pale translation, and a small uppercase caption separated by a fine translucent rule. Preserve the motto "Nectamen consumebatur."

### Gallery and lightbox

Gallery images sit on square paper mounts; an arrow square changes from navy to red on hover. Captions use the serif face with smaller sans-serif categories. The native modal uses deep navy, a dark backdrop and visible close controls. Escape closes it, arrow keys browse when multiple items exist, and closing restores focus to the originating tile.

### School map

The contact page map uses OpenStreetMap tiles in a rectangular editorial frame with a red bottom rule. A white location panel overlaps the map on desktop and sits above it on mobile. The custom marker uses the authorised crest inside a navy ring with a small red status dot. Leaflet zoom controls adopt the navy interaction color, attribution remains visible, and the popup repeats the school name, physical locality, postal address and directions action. Preserve drag, keyboard and zoom behavior; do not place decorative overlays where they prevent map interaction.

### Policy library

Policy categories use numbered, ruled directory rows with square navy icon fields. Search and filtering sit on a white document bar over the paper background. The empty state explains the school-approval status and uses a single red rule. Detail pages reserve a large neutral document canvas for the PDF and place official metadata in a compact definition list.

### Motion

The hero reveals once through a clip-path change from a 5% bottom inset to zero over 0.8s with `cubic-bezier(.16, 1, .3, 1)`. It does not conceal content before hydration. Reduced-motion preference disables the reveal, CSS transitions and animations, and smooth scrolling. Keep new interactions consistent with this restrained treatment.

## Do's and Don'ts

### Do:

- Do preserve the supplied crest, its proportions and the school motto.
- Do pair editorial serif headings with readable sans-serif body text.
- Do use whitespace, fine rules and tonal surfaces to structure content.
- Do maintain visible keyboard focus and reduced-motion support.

### Don't:

- Don't introduce a competing palette or alter the crest colors.
- Don't turn ordinary editorial sections into heavily rounded, shadowed cards.
- Don't add continuous decorative animation to this restrained system.
- Don't substitute invented campus imagery for school-approved photographs.
