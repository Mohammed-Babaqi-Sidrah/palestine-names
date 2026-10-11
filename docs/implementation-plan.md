# Living memorial enhancement plan

Goal: preserve the parchment, Arabic editorial typography and human WebGL formations while making the archive accurate, readable and dependable.

## Agreed direction

Keep the current identity, with substantial polish. The signature is people forming a number, the map, an olive tree and Arabic calligraphy. Quiet, legible document surfaces support that experience. Core names and search must also work without WebGL or an AI key.

## Implementation

1. **Validated daily synchronization.** Use Tech For Palestine's versioned v3 CSV endpoint, not daily aggregate casualties. Validate the whole download before atomically publishing one cached snapshot containing records and provenance. Keep the bundled CSV as the offline first-start fallback. Refresh on startup and daily in a background task; expose source, record count, source revision, successful check time and fallback/stale status. A CLI supports manual refresh. Test valid/unchanged downloads, invalid schema/ages/dates, duplicate and missing IDs, network failures, disk reload and atomic replacement failures.
2. **Truthful statistics and searchable names.** Compute all metrics/cohorts from the same snapshot. Remove frozen totals and unsupported demographic assertions. Restore a first-class paginated archive alongside the story. Keep query/filter/sort/page in URL state, cancel obsolete work, preserve input, label controls, and provide loading/error/no-result recovery. Test API totals and Arabic search normalization.
3. **Arabic and motion repairs.** Preserve complete Arabic words in DOM/canvas; remove tracking on joined Arabic text and use proper font metrics. Wait for the calligraphy font before sampling it. Replace duplicate scroll subscriptions with one scheduled observer; keep text and visuals aligned to explicit stage anchors, including long/mobile sections. Respect reduced motion and a persistent manual pause; prevent drag/scroll gestures opening records. Native dialog provides keyboard access to the same records.
4. **Visual refinement.** Preserve existing parchment/olive/ink tokens; improve heading hierarchy, reading measure, mobile spacing, clear navigation and direct archive access. Make the tree and finale occupy reserved stages instead of obscuring text. Add data provenance and source limitations with honest freshness labels. Keep AI visibly optional and make its failures recoverable.
5. **Verify and deliver.** Run backend unit/API tests, frontend lint/typecheck/build, design audit, and real-browser desktop/mobile checks for scroll direction, Arabic, search/sort/paging, no results, failure/retry, keyboard/dialog focus, reduced motion and WebGL fallback. Commit coherent increments, push a feature branch and create a PR.

## Source contract

- https://data.techforpalestine.org/docs/killed-in-gaza/
- https://data.techforpalestine.org/api/v3/killed-in-gaza.csv
- Names update when a Ministry list is released; daily checks do not imply a new list daily.
- `update` is a source list revision, not a date. Missing dates/ages stay unknown. Rendered figures are a labeled sample, not the full count.
- Last check, content refresh and upstream modification time are distinct; never substitute the aggregate daily reporting date for the names list date.

## Review focus

Reject malformed remote data without damaging the prior cache; allow source corrections/removals rather than append-only updates. Ensure no fake data appears on errors, no Arabic letters are separated, no hover is required to browse records, no touch scroll opens a record, and late requests cannot overwrite newer filters.
