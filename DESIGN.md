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
  muted: "#62675d"
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

Preserve the established parchment and WebGL identity, explicitly selected by the user. The visual reference is a quietly typeset memorial ledger, with actual names as its subject. The signature is a sampled crowd forming a number, a map, an olive tree and the joined word فلسطين. Experience mode governs the story; read/search mode governs the archive. Avoid dashboard decoration, fabricated certification and unsupported biographical claims.

## Colors

Runtime ownership remains in `frontend/src/app/globals.css`. This file mirrors it: background → `--bg-base`, paper → `--bg-paper`, surface → `--bg-surface`, primary/secondary/muted → `--text-primary/secondary/muted`, olive/danger → `--accent-green/red`, border → `--border-paper`. Olive marks safe actions and emphasis; red is reserved for failures. Use readable ink on parchment. Selection, caret, focus and scrollbars inherit these tokens. Forced colors retain visible outlines.

## Typography

Amiri carries the poetry, headings and Arabic names; IBM Plex Sans Arabic carries prose and controls. Use whole text runs, zero Arabic letter-spacing, no clipped diacritics and no letter-by-letter animation. Latin names have `lang=en` and `dir=ltr`; identifiers and ranges use bidi isolation. Data uses tabular numerals. Canvas calligraphy waits for the actual Amiri font, with an HTML fallback if it cannot load. Body copy is 16px with generous line-height; secondary labels are at least 14px.

## Layout

Natural document scrolling owns the page. Header height is 88px desktop / 80px mobile. Chapters use bounded reading measures and explicit visual stage anchors. On desktop the map/tree share a split with prose; on mobile stages take their own rows. The searchable archive is paginated, never an unbounded list. Test widths 390, 760, 1280 and 1440px and long Arabic names. Breakpoints must not hide core actions or names.

## Elevation & Depth

Flat parchment with fine rules. Only header/menu/dialog need elevation. Text remains readable independently of the canvas. Cards do not need glow or stacked shadows. The canvas is decorative; the archive supplies equivalent keyboard access.

## Shapes

Use 8px document corners and 4px control corners. Preserve the original archival seal. Use the existing Lucide library for new control icons. Let whitespace and typography carry hierarchy.

## Components

Canonical owners: `Navbar` for navigation/motion, `LivingArchiveScene` for search state and pagination, `RecordDialog` for record details, `DatasetNote` for provenance, `api.ts` for cancellation/timeout, `useScrollStory` for chapter/stage alignment, `globals.css` for browser surfaces. Statistics always consume the API's computed values. AI is optional and identified as an assistant, never an official registry.

Motion: one formation transition system, no scroll hijacking. Reduced motion snaps to complete forms; the manual pause persists. No render loop while settled, paused or hidden. A touch drag never selects a figure.

## Do's and Don'ts

Do preserve source names verbatim, distinguish successful check time from source revision/date, and label figures as a sample. Do offer offline/fallback explanations, retry and ordinary archive browsing. Don't invent a fresh count, biography, source certification or list coverage date. Don't hide scrollbars, route announcements or focus rings.
