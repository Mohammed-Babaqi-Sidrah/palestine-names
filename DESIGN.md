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

Runtime ownership remains in `frontend/src/app/globals.css`. This file mirrors it: background → `--bg-base`, paper → `--bg-paper`, surface → `--bg-surface`, primary/secondary/muted → `--text-primary/secondary/muted`, olive/danger → `--accent-green/red`, border → `--border-paper`. Olive marks safe actions and emphasis; red identifies failures, with the approved flag formations and navbar remembrance ink as deliberate memorial exceptions. Use readable ink on parchment. Selection, caret, focus and scrollbars inherit these tokens. Forced colors retain visible outlines.

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

Motion: one viewport-fixed formation system, no scroll hijacking. The silhouettes remain the focal continuity element: number → map → olive sprig behind one name → olive tree → quiet field → joined Arabic calligraphy. The four complete chapter shapes disperse as the reader scrolls, then gather into the next form with the existing eased morph; the archivist keeps the same quiet field. The intermediate spread matches the existing living-register background. Rendering stops after a transition settles or the page is hidden; remove idle breathing and the manual pause control. OS reduced motion snaps directly to complete forms. Assistant feedback stays textual and quiet. A touch drag never selects a figure.

## Do's and Don'ts

Do preserve source names verbatim, distinguish successful check time from source revision/date, and label figures as a sample. Do offer offline/fallback explanations, retry and ordinary archive browsing. Don't invent a fresh count, biography, source certification or list coverage date. Don't hide scrollbars, route announcements or focus rings.

Assistant answers use react-markdown and remark-gfm with safe default URL filtering, skipped raw HTML, no remotely loaded images, RTL prose, isolated code and scrollable tables. One question form stays present through loading, answer and retry states. The source link and record buttons are retained as useful evidence.

## Progressive dispersal, settled hover and navbar remembrance — latest 17 October clarification

Keep the approved viewport-fixed anchors, including the finale at 51% desktop / 54% mobile. For the first three shapes, retain the original main progression: begin with a complete form, then disperse towards cached wide-field positions with normalized departure `clamp((chapterProgress - .13) * 1.8, 0, 1)`. The souls spread across the suspended field before gathering into the next form. Hold the tree complete through 45% of its chapter progress, then use departure `clamp((chapterProgress - .45) / .37, 0, 1)` so it is fully dispersed by 82%. The archivist already is that field and has no extra departure curve. Preserve the existing 900 ms eased morph between chapters. Remove the bounded downward scroll current, full-screen wraps and section-linked exits. Do not generate random positions per frame. Demand rendering and the existing device/frame budgets remain in force; reduced motion shows complete forms directly.

Hover and record taps belong only to settled, complete shapes. Disable picking during scrolling until 120 ms of quiet, throughout dispersal and morphs, and in the quiet archivist field. Clear stale hover on departure; do not pin a soul during motion. Preserve control/card exclusions, pointer drag guards, native dialog behavior and the complete searchable archive as the keyboard equivalent.

Keep the opening number's darker flag inks: red #a52b28, green #1c6840, bone white #bbb7ad and black #151a16, its spatial bands/red triangle and its reduced paper wash. Restore the finale's original palette — red #e4312b, green #149954, white #fff and black #1e221e — with the default paper wash and the existing colour arrangement. Add no glow, filters or extra render passes.

Place the exact remembrance sentence «هؤلاء مَن وُثِّقَت أسماؤهم… وليسوا كلَّ مَن فقدنا.» in the navbar, replacing its centre ambient label. Use deep red #7a2328 Amiri ink with no drop or other blood icon. Preserve the brand, progress rule, index control and drawer. The header remains 88px on desktop and uses a stable 112px two-row layout at widths up to 760px, with the drawer below it. Keep readable Arabic wrapping, visible focus and forced-colour support; do not repeat the note before the finale colophon.

## Living-register departure field and bounded finale — 18 October

Use the exact existing background behind «04 — سِجل الذاكرة الحيّة» as the canonical departure field across all five chapter gaps. Reuse its deterministic even distribution (92% viewport width, 86% of the 80%-height stage), tiny .025 figure scale and subdued #586b53 / #7d887a olive-grey inks. The archivist and departing figures share the same position/scale cache and ink source. Fade to quiet ink only as forms disperse; complete flag/wood/leaf shapes retain their approved palettes. Skip redundant ink uploads for modes already using quiet ink. Cache positions/scales/palette; retain the departure curve, 900 ms gathering morph, non-interactive archivist, settled-only picking, stopped idle rendering and device budgets. No intermediate pictorial motifs. Entering the archivist must not stretch the quiet figures: keep their original X/Y proportions throughout the morph and keep the shared field stable while scrolling within that section.

The finale stays at its original centre behind the poetry until the paper footer approaches. Lift the formation above the footer, clip immediately at the paper boundary during easing and hide when that boundary passes the masthead. Never paint or pick souls over the source/developer colophon. Preserve the calligraphy's original colours and letterform.

Organize the paper colophon into brand/count header, source/developer columns and a bottom motto/return link. Pair the official TFP logo and source heading in one aligned row at every width. Crop only empty asset margins in its CSS frame; do not modify the official SVG. Serve it locally and lazily, credit Ministry lists via the project, preserve documentation/repository links and Arabic thanks. Give babaqi.io a prominent personal-site link, with GitHub/LinkedIn secondary. Stack columns on mobile with consistent Arabic start alignment, generous rules and readable prose. Retain bidi isolation, safe external links, focus and live provenance. Do not imply partnership, complete coverage or a source date.

## Age display and assistant seal — 15 October

Round displayed age summaries (average and median) to whole years. Record ages are already whole years from the validated source. Preserve exact counts, decimal percentages and the underlying API statistics. Keep missing ages as unknown and infants as under one year.

Refine only the assistant logo as a custom code-native SVG: preserve the olive ink, circular stamp and existing Arabic inscriptions; remove tiny inner labels and excess concentric rings, and use a clear open book with an olive sprig. The silhouette must remain clear at the existing 88px mobile / 156px desktop sizes. No generated image asset, new logo service, dependencies, page-layout or motion changes.

## Particle resource budget and one-name branch — 15 October

The user wants faster loading, less resource use and immediate scroll response, with static shapes while idle. Preserve demand rendering and the six-chapter identity. Limit GPU paints to 60 fps (30 on devices reporting low memory/CPU), cap pixel density, reuse per-particle random values/colours and write simple scale/translation matrices directly. Keep exact API records and counts; report the actual rendered sample size. Lazy-load Markdown only when an assistant answer is present. Measure the same desktop and CPU-throttled mobile scroll before and after; don't claim universal hardware support from an emulator.

Replace only the declaration's two side formations and enlarged centre figure with one particle olive sprig behind the name: curved brown wood, narrow green leaves, no side wedges. Retain the name card, heading, source record and accessible details. The field remains viewport-fixed and follows the progressive dispersal contract above; idle holds its current pose and reduced motion skips dispersal and the spatial morph. No idle drift, new libraries, controls, pipeline changes or wider redesign.

## Phone layout and touch checks — 18 October

At widths up to 1000px, retain an accurately proportional age track and reuse the existing category buttons as a readable two-column legend. Each category remains selectable, including tiny/zero proportions, with at least 44px touch height and single-line ranges/percentages. Reuse the original five inks; do not stretch the proportional track to enlarge targets or change source percentages. The original segmented desktop control remains above 1000px.

At widths up to 480px, stack archive filters so native selected text is fully readable. Assistant text input is at least 16px up to 1000px. Brand/source links and footer social links have 44px targets. Keep the existing parchment, header, footer, seal, chapter composition and approved particle timing. Verify 320/360/390/430px portrait and 844px landscape, menu scrolling/dismissal, record dialogs, long names and contained Markdown/code overflow. Evidence and limitations: docs/mobile-qa.md.
