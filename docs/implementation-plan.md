# Living memorial enhancement plan

Goal: preserve the parchment, Arabic editorial typography and human WebGL formations while making the archive accurate, readable and dependable.

## Agreed direction

Keep the original design at `50e0ec0`. Restore the six-chapter composition, opening typography, chapter labels, statistic cards, age-spectrum bar, folio, circular seal and poetic headings. The user rejected the broader visual rewrite. Only local Arabic, scroll, responsive usability and data-accuracy repairs are authorized. The searchable utility belongs on `/archive`, linked from the existing search button. Core names and search must also work without WebGL or an AI key.

## Implementation

1. **Validated daily synchronization.** Use Tech For Palestine's versioned v3 CSV endpoint, not daily aggregate casualties. Validate the whole download before atomically publishing one cached snapshot containing records and provenance. Keep the bundled CSV as the offline first-start fallback. Refresh on startup and daily in a background task; expose source, record count, source revision, successful check time and fallback/stale status. A CLI supports manual refresh. Test valid/unchanged downloads, invalid schema/ages/dates, duplicate and missing IDs, network failures, disk reload and atomic replacement failures.
2. **Truthful statistics and searchable names.** Compute all metrics/cohorts from the same snapshot inside the original cards and segmented spectrum. Remove frozen totals and unsupported demographic assertions without changing those components' appearance. Keep the paginated archive on `/archive`, accessed through the original search button. Preserve query/filter/sort/page in the URL, cancellation, input, labels, and recovery. Test API totals and Arabic search normalization.
3. **Arabic and motion repairs.** Preserve complete Arabic words in DOM/canvas; remove tracking on joined Arabic text and use proper font metrics. Wait for the calligraphy font before sampling it. Replace duplicate scroll subscriptions with one scheduled observer; keep text and visuals aligned to explicit stage anchors, including long/mobile sections. Respect OS reduced motion automatically without a manual pause; prevent drag/scroll gestures opening records. Native dialog provides keyboard access to the same records.
4. **Conservative frontend restoration.** Preserve the original stylesheet, fonts, hierarchy, surfaces and navigation. Apply only shaping/tracking, safe word wrapping, interaction and motion fixes. Restore the original desktop formations and card sidebar; reserve space on mobile to prevent overlap. Fit provenance into the original ribbon, with full source details on the archive route. Keep assistant failures recoverable without redesigning the folio.
5. **Verify and deliver.** Run backend unit/API tests, frontend lint/typecheck/build, design audit, and real-browser desktop/mobile checks for scroll direction, Arabic, search/sort/paging, no results, failure/retry, keyboard/dialog focus, reduced motion and WebGL fallback. Commit coherent increments, push a feature branch and create a PR.

## Source contract

- https://data.techforpalestine.org/docs/killed-in-gaza/
- https://data.techforpalestine.org/api/v3/killed-in-gaza.csv
- Names update when a Ministry list is released; daily checks do not imply a new list daily.
- `update` is a source list revision, not a date. Missing dates/ages stay unknown. Rendered figures are a labeled sample, not the full count.
- Last check, content refresh and upstream modification time are distinct; never substitute the aggregate daily reporting date for the names list date.

## Review focus

Reject malformed remote data without damaging the prior cache; allow source corrections/removals rather than append-only updates. Ensure no fake data appears on errors, no Arabic letters are separated, no hover is required to browse records, no touch scroll opens a record, and late requests cannot overwrite newer filters.

## Focused refinement — 12 October user feedback

The user wants the mesh to accompany scrolling, form the existing shapes, remove unnecessary controls, and improve the assistant layout/seal with Arabic Markdown. Keep the approved pipeline and original story, fonts, cards, spectrum and poetic headings.

- Anchor the human mesh to the viewport throughout the story; interpolate the world-space anchor and formation together. Preserve number → map → one-name olive sprig → tree → quiet crowd → فلسطين. Natural scrolling selects chapters; rendering settles after each transition. Respect OS reduced motion automatically and remove the navbar pause button.
- Keep the paper folio, but reduce its sidebar to an Arabic olive seal, clear identity and source link. Use one persistent labeled textarea and one send action; retain failed questions and retry. Remove prompt pills, pseudo-document labels, tool timings and duplicate follow-up/reset forms.
- Render safe Markdown with react-markdown and remark-gfm: Arabic prose, headings, lists, tables and links; skip raw HTML and unsafe URLs, avoid remote images, isolate code and allow table overflow inside the card.
- First prove the existing failures with browser regressions, then verify the fixes on desktop/mobile. Run lint, types, build and existing pipeline tests. Capture the complete experience once, make a bounded correction pass, update this PR and show the live result.

## Earlier scroll transport follow-up — historical, superseded

Move the same souls downward at varied speeds while the reader scrolls, with subtle lateral drift and brief vertical trails. Suspend gathering during scrolling; re-enter beyond the viewport edge during long travel, then gather into the current shape after a 60 ms pause. Suppress figure picking during travel. Use actual scroll displacement, bound fast jumps, reverse transport with upward scrolling, skip it for reduced motion and stop demand rendering after settling. Restore the main-branch finale centre (51% desktop / 54% mobile) behind the closing passage. Regressions inspect real GPU instance positions, not only chapter attributes; verify downward travel, gathering, reduced-motion bypass and finale placement.

## Resource budget and olive sprig — 15 October user feedback

Hold shapes still when idle. Reuse colour/transport buffers and simple matrices, cap actual paints independently of screen refresh rate, lower pixel density and choose a smaller sample on devices reporting limited resources. Lazy-load Markdown answers, preserve exact source data and report the actual rendered sample. Replace only the one-name side formations with a curved brown stem and green olive leaves behind the existing record card. Measure production scrolling before/after under the same desktop and throttled-mobile conditions, verify actual WebGL budgets/colours and keep the complete browser suite passing. Results and limitations: [particle-performance.md](particle-performance.md).

## Chapter entry, declaration hover and flag number — 15 October, historical motion contract

Hold the formation while scrolling within a section. Entering the next chapter triggers a complete 900 ms downward passage into its shape, independent of further input; reverse on upward chapter navigation, rebase interruptions from the current pose and snap for reduced motion. Remove displacement/pause gating from every scroll. Enable declaration particles in the shared hover/tap paths while preserving control exclusions and drag protection. Give the opening numeral the existing Palestinian flag palette in spatial bands and a red hoist triangle. Prove the old behavior fails these requirements, then verify all 30 desktop/mobile cases, resource limits and the unchanged page composition.

## Earlier section-linked placement — historical, superseded

Keep the liked chapter shapes and eased morph, but stop pinning figures in the viewport middle between sections. The vertical anchor follows the section's entering/leaving bounds and holds its composition only while a long section fills the viewport. Morph towards the incoming section's live position without forced offscreen wrapping. Preserve local geometry sizes, relative finale alignment, flag palette, olive hover/tap, resource limits, reduced motion and pipeline. Update regressions to require actual GPU translation with section content, reversal, continuous no-wrap morphing and stopped idle drawing. Measure scroll resource use and inspect desktop/mobile together.

## Earlier suspended current, stronger ink and closing note — historical, superseded

This earlier iteration added a bounded downward scroll current, picking during morphs with hover pinning, darkened both flag formations, and placed a remembrance note with a geometric drop before the colophon. The latest user correction below replaces those motion, interaction, finale-colour and note-placement decisions. The opening number's darker inks remain approved.

## Latest correction — original main dispersal, settled hover and navbar note

Keep viewport-fixed anchors and restore the original main progression for the first three shapes: number, map and one-name olive sprig disperse towards a cached wide field as normalized departure rises with `clamp((chapterProgress - .13) * 1.8, 0, 1)`. They spread across the suspended field before reforming. Preserve the existing 900 ms eased morph for the tree, quiet archivist field and finale. Remove the bounded downward current, section-linked exits and full-screen wraps; never generate random positions per frame. Reduced motion bypasses dispersal and snaps to complete shapes. Keep demand rendering, idle/hidden stops, resource ceilings and exact source data.

Allow hover/tap only on settled, complete shapes. Block picking during scroll input and until 120 ms of quiet, throughout departure and morphs, and in the quiet archivist field. Clear stale hover as a form departs; remove hover pinning during motion. Retain control exclusions, pointer drag protection, dialog dismissal/focus restoration and keyboard access through the complete archive.

Keep the opening number's dark flag inks (#a52b28, #1c6840, #bbb7ad, #151a16), spatial bands/red triangle and reduced paper wash. Restore the finale's original palette (#e4312b, #149954, #fff, #1e221e), colour arrangement and default paper wash. Add no glow or extra render pass.

Move «هؤلاء مَن وُثِّقَت أسماؤهم… وليسوا كلَّ مَن فقدنا.» from the finale into the navbar's centre label position, in deep red #7a2328 Amiri ink with no drop. Preserve the brand, index control/drawer, progress rule and focus treatment. Keep an 88px desktop header and a stable 112px two-row mobile header, position the drawer below it, and verify readable Arabic wrapping with no clipping or overflow at 320px, 390px and desktop widths. Regressions should verify settled-only picking, original-main departure geometry, unchanged later morphs and separate opening/finale palettes; do not treat earlier historical test counts as proof of the current revision.

## Earlier organic spread and source thanks — superseded silhouette, 18 October

Preserve the approved motion and replace only the uniform rectangular spread with a cached broad S-curve, tapered ends and softly scattered edges. Keep all per-frame behavior, colours, hover gates and device budgets. Verify actual GPU occupancy follows the curved field while the existing extent, progress, gathering and idle regressions remain green.

Add source acknowledgement and Arabic thanks inside the existing finale colophon. Credit Ministry lists via Tech For Palestine with direct documentation/repository links, English bidi isolation and safe new tabs. Reuse the original paper, rule, olive heading and prose styles; verify the source row and links at 320px/mobile/desktop. Leave the approved pipeline and live provenance note intact.

## Earlier blood drops, official source logo and personal footer — superseded field — 18 October

Replace the connected ribbon with seven separated medium drops made from existing figures. Vary silhouette, tilt and scale; use a staggered mobile arrangement. Cache geometry and dark-red inks, blend colour only during departure, and retain the approved morph, chapter palettes, reduced-motion path, hover gates and resource budgets. GPU regressions must identify separate groups and red ink while preserving progression and idle stop.

Restructure the closing paper footer into brand/count header, source and developer columns, and the existing motto. Use the official SVG from the published TFP press kit, served locally without edits, and preserve source credit/thanks and direct dataset links. Add babaqi.io prominently; make GitHub/LinkedIn quiet text links. Check actual logo loading, external-link safety, focus, English isolation and desktop/mobile/320px layout.

## Earlier alternating constellations/birds and finale boundary — superseded field — 18 October

Replace the rejected drops with alternating airy soul constellations and curved-wing bird flocks across the five chapter gaps. Preserve chapter inks in constellations; use deep olive/earth for birds. Cache positions, scales and palettes; keep the original departure curve, 900 ms morph, reduced motion, idle stop and resource ceilings. The archivist remains non-interactive. Verify GPU progression, alternate ink, varied scale, stopped uploads and resource limits.

Keep the original finale centre until the footer approaches, then lift/clip the calligraphy above its top and hide past the masthead. Exclude footer picking. Organize the existing footer into brand/count header, aligned logo/source identity, source/developer columns and bottom motto/return link. Preserve all approved content/links and the official artwork. Check 320/390/820/1440px and production browser regressions.

## Earlier free dispersion — superseded density and scale

Remove the rejected constellations/birds and their ink transitions. Use one deterministic free spread with soft outward density and varied figure scales, without a rectangular edge or an intermediate pictorial shape. Preserve chapter palettes, all five departure/gathering passages, 900 ms morph, idle stop, reduced motion and settled-only picking. Preserve the approved footer arrangement and finale boundary. Verify sparse extremities, progressive spread/gathering, unchanged ink, no departure colour uploads and desktop/mobile resource limits.

## Match the living-register background — latest 18 October reference

Reuse the exact background behind «04 — سِجل الذاكرة الحيّة» for all departures: tiny .025 figures, its even wide distribution and subdued olive-grey ink. Make the archivist and departures consume the same position/scale and palette sources. Fade to quiet ink during dispersal, retain complete chapter palettes, skip redundant quiet-mode uploads and stop at rest. Preserve timing, hover gates, reduced motion, resource budgets and footer/finale work. GPU tests compare departure positions, scale and ink directly against the living-register background.

## Longer tree hold and unchanged quiet figures — latest 18 October refinement

Hold the tree complete until normalized chapter progress .45, then disperse with (progress-.45)/.37, completing at .82 before the archivist arrives. Keep the first three departure curves and existing anchors/layout. The archivist already uses the shared quiet field; remove its redundant departure and disable entry's vertical stretching there. Preserve scale, ink, progression elsewhere, reduced motion, picking and stopped idle rendering. GPU regressions must check tree hold, later gradual departure/reversal and quiet figure proportions during entry.

## Final phone QA — 18 October

Check all six chapters and /archive at 320/360/390/430px portrait and 844px landscape. Fix measured age-label clipping/small category targets using an accurate proportional track plus the existing buttons as a touch-sized legend at <=1000px. Stack filters at <=480px, enlarge phone assistant input to 16px and source/brand/social touch targets to 44px. Preserve desktop styling, data, particles and footer identity. Verify tiny category selection, true proportions, complete native select labels, long names/dialogs, safe contained Markdown/code, menu navigation and zero document overflow. Results: mobile-qa.md.
