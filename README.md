# أسماء لا تُنسى — Names, not numbers

An Arabic memorial and searchable archive of Palestinians killed in Gaza. Parchment surfaces, Arabic editorial typography and sampled human silhouettes form a number, a map, an olive tree and the word **فلسطين**. Every count and demographic value comes from the loaded dataset.

The narrative leads into a paginated archive: search Arabic or English names, combine an exact age, change order, and open a record with the keyboard or pointer. Search state lives in the URL. The optional archivist uses dataset tools, with a local fallback when an AI service is unavailable.

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

Playwright covers desktop and mobile layouts, search/filter/order/pagination, history, no results, retry, stale requests, optional assistant failure, native dialog focus, reduced motion, manual pause and WebGL fallback. It mocks API responses so tests do not require the live source or an AI key. GitHub Actions runs backend and frontend checks on pull requests.

## Design and accessibility

[DESIGN.md](DESIGN.md) records the parchment/olive/ink system and [UX-CONTRACT.md](UX-CONTRACT.md) records interaction ownership. Amiri and IBM Plex Sans Arabic are served locally. Whole Arabic words retain shaping; identifiers and Latin names use bidi isolation. Canvas calligraphy waits for the actual font and has an HTML fallback.

Scrolling remains native. One scheduled observer aligns formations with reserved stages rather than placing them over prose. OS reduced motion is respected, and a manual pause persists across reloads. Without WebGL, the count, narrative and complete searchable archive remain available. Record details use a native dialog with Escape and focus restoration.

## Structure

- `backend/data/`: CSV validation, atomic snapshots, provenance and refresh CLI.
- `backend/routers/`: records/statistics API and optional LangChain archivist.
- `backend/algorithms/`: search and teaching implementations of sort algorithms.
- `frontend/src/components/narrative/`: story, searchable archive and archivist.
- `frontend/src/components/particles/`: instanced human formations.
- `frontend/src/lib/`: API client, scroll coordinator, typed state.
- `docs/implementation-plan.md`: enhancement plan and review focus.

Built by [Mohammed Babaqi](https://github.com/MohammedBabaqi). Dataset maintained by [Tech For Palestine](https://github.com/TechForPalestine/palestine-datasets); preserve source attribution when reusing the records.
