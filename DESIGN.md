---
version: alpha
name: Names, not numbers
description: An Arabic living memorial with parchment reading surfaces and human silhouettes.
colors:
  background: "#f7f5ee"
  paper: "#fffdf7"
  surface: "#efede4"
  primary: "#292d28"
  secondary: "#51564d"
  muted: "#6c7166"
  olive: "#436148"
  danger: "#a44232"
  border: "#d8d9cb"
typography:
  body:
    fontFamily: "IBM Plex Sans Arabic, sans-serif"
  display:
    fontFamily: "Amiri, serif"
  data:
    fontFamily: "IBM Plex Sans Arabic, sans-serif"
rounded:
  DEFAULT: "8px"
  control: "4px"
spacing:
  small: "8px"
  medium: "24px"
  large: "64px"
components:
  record: { rounded: "{rounded.DEFAULT}", backgroundColor: "{colors.paper}" }
  button: { height: "44px", textColor: "{colors.olive}" }
  note: { textColor: "{colors.muted}" }
  error: { textColor: "{colors.danger}" }
  divider: { height: "1px", backgroundColor: "{colors.border}" }
---

# أسماء لا تُنسى

## Overview

The binding visual reference is the original repository at `50e0ec0`, including its six-chapter composition, title copy, typography, parchment texture, compact statistic cards, segmented age spectrum, parchment folio and circular memorial seal. The user rejected the broader visual rewrite. Preserve those originals. The latest user feedback authorizes a focused refinement of the assistant folio/seal, Markdown answers, a simpler navbar, and formations that accompany the reader throughout scrolling. Make other changes only for Arabic, scrolling, accessibility and data accuracy. Do not replace the cards with an editorial ledger, enlarge/re-font the hero, remove chapter labels, add a seventh chapter, or rewrite the poetic headings. Keep the searchable archive on its own route, linked from the existing search button. Experience mode governs the original story; read/search mode governs `/archive`.

## Colors

Runtime ownership remains in `frontend/src/app/globals.css`. This file mirrors it: background → `--bg-base`, paper → `--bg-paper`, surface → `--bg-surface`, primary/secondary/muted → `--text-primary/secondary/muted`, olive/danger → `--accent-green/red`, border → `--border-paper`. Olive marks safe actions and emphasis; red is reserved for failures. Use readable ink on parchment. Selection, caret, focus and scrollbars inherit these tokens. Forced colors retain visible outlines.

## Typography

Keep the original type roles and scale: IBM Plex Sans Arabic for the opening h1, prose and controls; Amiri for the other headings, poetry and names; Courier New for the original large data figures. Keep the original Latin numerals on those figures. Use whole Arabic runs and zero Arabic tracking; fix shaping without replacing the typeface or visual hierarchy. Latin names use `lang=en` and `dir=ltr`; identifiers and ranges use bidi isolation. Canvas calligraphy waits for the actual Amiri font and has an HTML fallback. Fonts are served locally. Refine the existing circular seal with readable, shorter Arabic inscriptions and a hand-coded open archive book with an olive sprig; unique SVG path IDs prevent duplicate-instance collisions.

## Layout

Natural scrolling owns the page. Preserve the original six chapters, their heading widths, header, footer and page rhythm. Use stable viewport anchors for the original formations: the number stays in the center of the opening, the map/tree occupy the desktop's open space, and the tree keeps the original narrow card sidebar. Keep mobile stage space and opaque paper reading surfaces. The same mesh stays in view as sections scroll past; anchors move smoothly between chapters. The assistant uses a compact two-column Arabic folio on desktop and a compact seal/identity row above a single persistent question form on mobile. No other layout substitution is authorized. The searchable utility is a separate paginated route. Check desktop/mobile and long Arabic names.

## Elevation & Depth

Keep the original paper texture, translucency, rules, card borders and shadows. The original stylesheet is the authority, including existing decorative treatments. Text remains readable independently of the canvas; the archive provides keyboard access to the records.

## Shapes

Keep the original component corners, badges, seal and iconography. Keep the existing geometry and vintage paper treatment. The assistant seal is the scoped exception: fewer rings, a larger open archive book and olive sprig, and legible Arabic arc lettering, drawn directly as SVG paths without generated raster imagery. Reuse the original classes rather than adding replacement skins.

## Components

Canonical owners: `Navbar` for navigation/motion, `LivingArchiveScene` for search state and pagination, `RecordDialog` for record details, `DatasetNote` for provenance, `api.ts` for cancellation/timeout, `useScrollStory` for chapter/stage alignment, `globals.css` for browser surfaces. Statistics always consume the API's computed values. AI is optional and identified as an assistant, never an official registry.

Motion: one viewport-fixed formation system, no scroll hijacking. The silhouettes remain the focal continuity element: number → map → one person → olive tree → quiet field → joined Arabic calligraphy. Anchor and shape changes interpolate together in world space. Rendering stops after a transition settles or the page is hidden; remove idle breathing and the manual pause control. OS reduced motion snaps directly to complete forms. Assistant feedback stays textual and quiet. A touch drag never selects a figure.

## Do's and Don'ts

Do preserve source names verbatim, distinguish successful check time from source revision/date, and label figures as a sample. Do offer offline/fallback explanations, retry and ordinary archive browsing. Don't invent a fresh count, biography, source certification or list coverage date. Don't hide scrollbars, route announcements or focus rings.

Assistant answers use react-markdown and remark-gfm with safe default URL filtering, skipped raw HTML, no remotely loaded images, RTL prose, isolated code and scrollable tables. One question form stays present through loading, answer and retry states. The source link and record buttons are retained as useful evidence.

## Scroll transport refinement

The user's next feedback asks for visible downward soul-like travel, not only chapter morphing. While scrolling down, transport the same silhouettes downward at varied speeds with gentle lateral drift; reverse the transport when scrolling up. Suspend position gathering during scrolling; souls re-enter beyond the viewport edges during long travel. Once scrolling pauses for 120 ms, gather into the section's complete formation and stop rendering. Bound travel on fast jumps and never apply transport with OS reduced motion. Restore the original main-branch finale anchor (51% desktop / 54% mobile), placing فلسطين behind the closing prose and quote rather than below them. Preserve the approved folio, Markdown, original six shapes and pipeline.

Motion thesis: the focal sequence is souls travelling with the reader and gathering into shared memory. Scroll movement drives transport; chapter changes drive gathering. No autonomous falling loop, extra controls or new libraries. Use the existing single GPU instanced mesh, demand frames while moving/settling, and no spatial travel in reduced motion.

## Age display and assistant seal — 15 October

Round displayed age summaries (average and median) to whole years. Record ages are already whole years from the validated source. Preserve exact counts, decimal percentages and the underlying API statistics. Keep missing ages as unknown and infants as under one year.

Refine only the assistant logo as a custom code-native SVG: preserve the olive ink, circular stamp and existing Arabic inscriptions; remove tiny inner labels and excess concentric rings, and use a clear open book with an olive sprig. The silhouette must remain clear at the existing 88px mobile / 156px desktop sizes. No generated image asset, new logo service, dependencies, page-layout or motion changes.
