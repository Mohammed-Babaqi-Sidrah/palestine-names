# Memorial interaction contract

Visual system: [DESIGN.md](DESIGN.md). UI locale is Arabic (`ar`); names retain their source spelling.

The home route preserves the original six chapters. Search is reached through the original statistics-section button and opens `/archive`; it does not insert an additional chapter or change the home header.

| Capability | Canonical owner | Source of truth | Allowed variants | Verification |
|---|---|---|---|---|
| Search/pagination | LivingArchiveScene | URL query and records API | Name, exact age, source/name/age order | Edits reset page; history restores; stale work aborted; clear restores input focus; no-results and retry tested. |
| Select/Listbox | Native select | LivingArchiveScene sort state | Source, name, age | OS owns popup; visible Arabic label, keyboard selection. |
| Form | LivingArchiveScene / ArchivistLetterScene | Component input state | Search and assistant | Native labeled controls; noValidate; inline validation; preserve input on failure; block duplicate requests. |
| Scrollbar | globals.css | CSS design tokens | Forced colors | Visible tokenized scrollbar; stable gutter; native fallback. |
| Record details | RecordDialog | Source record | Archive, spotlight, assistant | Native dialog Escape and focus placement/restoration; no hover required. |
| Dataset status | DatasetNote | Dataset API metadata | Fresh, stale, bundled | Successful check differs from new names; unknown provenance dates stay unknown. |
| Async resilience | api.ts | AbortSignal and current request | Retry and cancel | Timeout/cancel; old responses cannot overwrite filters; assistant failure preserves question. |
| Motion | Navbar / useScrollStory | Particle store and OS preference | Suspended flow, morph, settled, reduced | OS preference; one scroll observer; original viewport centres; bounded downward current from scroll input; chapter morph without wraps; hover/tap in all floating fields and morphs; hover holds the chosen soul; reduced motion zeros current and snaps; original finale centre; no idle loop or manual pause; natural scrolling. |

Table Selection, CRUD and Toast are not applicable: the public archive is read-only. Search dates remain available via the API; this surface offers name and exact-age filters, so no calendar is needed. Rendering silhouettes uses a labeled sample, with complete paginated records as the accessible equivalent.
