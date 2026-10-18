# أسماء لا تُنسى — Names, not numbers

An Arabic memorial and searchable archive of Palestinians killed in Gaza. Parchment surfaces, Arabic editorial typography and sampled human silhouettes form a number, a map, an olive tree and the word **فلسطين**. Every count and demographic value comes from the loaded dataset.

The original six-chapter narrative links to a dedicated paginated archive at `/archive`: search Arabic or English names, combine an exact age, change order, and open a record with the keyboard or pointer. Search state lives in the URL. The original statistic cards, age-spectrum bar and folio retain their visual design while consuming the synchronized data. The optional archivist uses dataset tools, with a local fallback when an AI service is unavailable.

## Data and daily checks

Names come from [Tech For Palestine's names dataset](https://data.techforpalestine.org/docs/killed-in-gaza/), which publishes Ministry of Health lists. The backend checks the [versioned v3 CSV](https://data.techforpalestine.org/api/v3/killed-in-gaza.csv) on startup and every 24 hours while running. **A daily check does not mean a new names list every day.** Aggregate casualty reports are a separate dataset.

The downloader validates schema, complete rows, names, ages, dates, revisions and unique IDs before atomically replacing one snapshot containing both records and provenance. Corrections and removals replace the previous list. Invalid downloads and network/disk failures retain the last valid snapshot. The repository CSV is the offline first-start fallback.

- `checked_at`: last successful upstream check.
- `refreshed_at`: last change to downloaded content.
- `source_revision`: the list's `update` value; it is not a calendar date.
- `source_last_modified`: HTTP modification time; it is not a death date or list coverage date.
- `status`: fresh, stale (failed check or more than 48 hours since success), or bundled fallback.

Unknown ages/dates remain unknown; records without source IDs receive stable internal IDs and are labeled accordingly. Fractional ages are represented as completed years. WebGL renders at most 2,400 sampled records; the total and paginated archive represent the complete loaded list. Statistics describe listed people, rather than all reported casualties. The map is a memorial formation, not a record of individual locations.

## Run locally

Use Node.js 22+ and Python 3.11+. From separate terminals:

```sh
cd backend
python -m pip install -r requirements.txt
python -m uvicorn main:app --host 127.0.0.1 --port 8000
```

```sh
cd frontend
npm ci
npm run dev
```

Open http://localhost:3000. API documentation is at http://127.0.0.1:8000/docs.

The memorial, search and statistics work without an AI key. To enable the optional AI service, copy `backend/.env.example` to `backend/.env` and provide `OPENROUTER_API_KEY`. AI-generated answers should be checked against records and the source.

| Variable | Owner | Default | Purpose |
|---|---|---|---|
| `DATA_SYNC_ENABLED` | Backend | `true` | Set `false` to disable the background downloader. |
| `DATA_CACHE_PATH` | Backend | `backend/.cache/names.json` | Writable persistent snapshot path. |
| `OPENROUTER_API_KEY` | Backend | Empty | Optional AI authentication; never expose it in the frontend. |
| `API_URL` | Next.js server/build | `http://127.0.0.1:8000` | Backend origin for the same-origin `/api` proxy. |
| `NEXT_PUBLIC_API_URL` | Frontend/build | `/api` | Optional direct API override; requires matching backend CORS. |

For hosted deployment, run the backend as a persistent service with a writable volume at `DATA_CACHE_PATH`. Set `API_URL` before building the frontend to the reachable backend origin. A static-only or sleeping serverless backend cannot run the 24-hour background timer. In that environment, schedule `python -m data.sync` from `backend/` on a worker sharing the same persistent snapshot. The running API detects atomic replacements without restart. Inspect `/api/dataset` and refresh failure logs to monitor freshness.

Manual synchronization:

```sh
cd backend
python -m data.sync
```

## Verify

```sh
cd backend
python -m unittest discover -s tests -v
```

```sh
cd frontend
npm run lint
npm run typecheck
npm run build
npx playwright install chromium
npm run test:e2e
```

Playwright covers desktop and mobile layouts, search/filter/order/pagination, history, no results, retry, stale requests, optional assistant failure, native dialog focus, automatic reduced motion, persistent viewport formations, safe Arabic Markdown and WebGL fallback. It mocks API responses so tests do not require the live source or an AI key. GitHub Actions runs backend and frontend checks on pull requests.

## Design and accessibility

[DESIGN.md](DESIGN.md) records the parchment/olive/ink system and [UX-CONTRACT.md](UX-CONTRACT.md) records interaction ownership. Amiri and IBM Plex Sans Arabic are served locally. Whole Arabic words retain shaping; identifiers and Latin names use bidi isolation. Canvas calligraphy waits for the actual font and has an HTML fallback.

Scrolling remains native. One scheduled observer follows chapter positions while the figures stay suspended around the original viewport centres. Complete shapes disperse with scrolling, then gather into the next form with the existing 900 ms eased morph. The tree stays complete through the first 45% of its chapter and disperses by 82%; the archivist keeps the shared quiet field, including unchanged figure proportions during entry. The intermediate spread uses the same tiny, evenly distributed olive-grey figures as the living-register background. Hover and record taps work only on settled, complete shapes: scrolling, departure, morphs and the quiet archivist field disable picking. The opening number keeps its darker Palestinian flag inks without glow; the finale restores its original flag palette and paper wash. The dark-red navbar sentence «هؤلاء مَن وُثِّقَت أسماؤهم… وليسوا كلَّ مَن فقدنا.» distinguishes documented names from everyone lost, without a drop icon. It wraps into a second header row on mobile. OS reduced motion shows complete forms directly; there is no manual motion control. The Arabic assistant retains one question form and renders Markdown lists, tables, emphasis and safe links. Without WebGL, the count, narrative and complete searchable archive remain available. Record details use a native dialog with Escape and focus restoration.

Departure shares the living-register background's cached positions, tiny scale and quiet ink. Complete shapes retain their chapter palettes; colour uploads run only when the quiet-ink blend changes and skip already-quiet modes. The original movement curve and resource budgets remain. The closing «فلسطين» stays behind the poetry and lifts/clips above the footer as it approaches. The paper footer pairs Tech For Palestine's official locally served logo with the source heading, credits Ministry lists via the project, preserves documentation/repository links and thanks contributors. It also links [babaqi.io](https://babaqi.io), with GitHub and LinkedIn secondary. Source/developer columns stack on mobile; the motto and return link share the bottom row.

Phone layouts are checked at 320, 360, 390 and 430 px, plus 844px landscape. Small age categories keep accurate proportions in a separate track with readable, touch-sized category buttons below; the wide desktop spectrum stays unchanged. Archive filters stack on narrow phones, assistant input uses 16px text and source/brand/social links have comfortable touch targets. Full verification scope: [mobile QA](docs/mobile-qa.md).

## Structure

- `backend/data/`: CSV validation, atomic snapshots, provenance and refresh CLI.
- `backend/routers/`: records/statistics API and optional LangChain archivist.
- `backend/algorithms/`: search and teaching implementations of sort algorithms.
- `frontend/src/components/narrative/`: story, searchable archive and archivist.
- `frontend/src/components/particles/`: instanced human formations.
- `frontend/src/lib/`: API client, scroll coordinator, typed state.
- `docs/implementation-plan.md`: enhancement plan and review focus.

Built by [Mohammed Babaqi](https://github.com/MohammedBabaqi). Dataset maintained by [Tech For Palestine](https://github.com/TechForPalestine/palestine-datasets); preserve source attribution when reusing the records.

### Particle performance

The visual sample is capped at 2,400 figures on desktop and 1,000 on mobile. Devices reporting at most four CPU cores or 4 GB memory use 600 figures, a 1× pixel ratio and a 30 fps paint cap; other devices use a maximum 1.25× pixel ratio and 60 fps cap. These are conservative hints rather than a hardware guarantee. The on-screen sample caption reports the rendered count. One instanced draw pass reuses colour/position buffers and directly updates simple matrices. The first three forms use normalized departure `clamp((chapterProgress - .13) * 1.8, 0, 1)`; the tree uses `clamp((chapterProgress - .45) / .37, 0, 1)` for a longer complete pose, while the archivist holds the cached living-register positions; there is no random-position allocation per frame or additional downward current. No particle frames run while settled or hidden. Each chapter morph lasts 900 ms, and reduced motion skips dispersal and snaps shapes. Picking resumes only after 120 ms without scrolling and once a complete shape has settled. The one-name section uses a brown-and-green olive sprig behind the record. Markdown code loads when an assistant answer appears. Exact data, search and the WebGL-free reading fallback remain available independently of the visual sample.

[Measured comparisons, resource budgets and regression coverage](docs/particle-performance.md) document the renderer optimization and the later chapter-entry refinement under local laboratory conditions.
