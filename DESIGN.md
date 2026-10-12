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

The binding visual reference is the original repository at `50e0ec0`, including its six-chapter composition, title copy, typography, parchment texture, compact statistic cards, segmented age spectrum, folio and circular memorial seal. The user rejected the broader visual rewrite. Restore those originals and make only local Arabic, scrolling, accessibility and data-accuracy fixes. Do not replace the cards with an editorial ledger, enlarge/re-font the hero, remove chapter labels, add a seventh chapter, or rewrite the poetic headings. Keep the searchable archive on its own route, linked from the existing search button. Experience mode governs the original story; read/search mode governs `/archive`.

## Colors

Runtime ownership remains in `frontend/src/app/globals.css`. This file mirrors it: background → `--bg-base`, paper → `--bg-paper`, surface → `--bg-surface`, primary/secondary/muted → `--text-primary/secondary/muted`, olive/danger → `--accent-green/red`, border → `--border-paper`. Olive marks safe actions and emphasis; red is reserved for failures. Use readable ink on parchment. Selection, caret, focus and scrollbars inherit these tokens. Forced colors retain visible outlines.

## Typography

Keep the original type roles and scale: IBM Plex Sans Arabic for the opening h1, prose and controls; Amiri for the other headings, poetry and names; Courier New for the original large data figures. Keep the original Latin numerals on those figures. Use whole Arabic runs and zero Arabic tracking; fix shaping without replacing the typeface or visual hierarchy. Latin names use `lang=en` and `dir=ltr`; identifiers and ranges use bidi isolation. Canvas calligraphy waits for the actual Amiri font and has an HTML fallback. Fonts are served locally. Preserve the circular seal and its curved typography; unique SVG path IDs prevent duplicate-instance collisions.

## Layout

Natural scrolling owns the page. Preserve the original six chapters, their heading widths, header, footer and page rhythm. Use non-decorative stage anchors to align the original formations: the number stays in the center of the opening, the map/tree occupy the desktop's open space, and the tree keeps the original narrow card sidebar. On mobile, reserve enough space for a complete formation so it cannot sit behind the cards. No other layout substitution is authorized. The searchable utility is a separate paginated route. Check desktop/mobile and long Arabic names.

## Elevation & Depth

Keep the original paper texture, translucency, rules, card borders and shadows. The original stylesheet is the authority, including existing decorative treatments. Text remains readable independently of the canvas; the archive provides keyboard access to the records.

## Shapes

Keep the original component corners, badges, seal and iconography. Do not flatten or redesign these details. Reuse the original classes rather than adding replacement skins.

## Components

Canonical owners: `Navbar` for navigation/motion, `LivingArchiveScene` for search state and pagination, `RecordDialog` for record details, `DatasetNote` for provenance, `api.ts` for cancellation/timeout, `useScrollStory` for chapter/stage alignment, `globals.css` for browser surfaces. Statistics always consume the API's computed values. AI is optional and identified as an assistant, never an official registry.

Motion: one formation transition system, no scroll hijacking. Reduced motion snaps to complete forms; the manual pause persists. No render loop while settled, paused or hidden. A touch drag never selects a figure.

## Do's and Don'ts

Do preserve source names verbatim, distinguish successful check time from source revision/date, and label figures as a sample. Do offer offline/fallback explanations, retry and ordinary archive browsing. Don't invent a fresh count, biography, source certification or list coverage date. Don't hide scrollbars, route announcements or focus rings.
