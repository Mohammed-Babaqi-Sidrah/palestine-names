# Memorial interaction contract

Visual system: [DESIGN.md](DESIGN.md). UI locale is Arabic (`ar`); names retain their source spelling.

The home route preserves the original six chapters. Search is reached through the original statistics-section button and opens `/archive`; it does not insert an additional chapter. Both routes share the same navbar.

| Capability | Canonical owner | Source of truth | Allowed variants | Verification |
|---|---|---|---|---|
| Search/pagination | LivingArchiveScene | URL query and records API | Name, exact age, source/name/age order | Edits reset page; history restores; stale work aborted; clear restores input focus; no-results and retry tested. |
| Select/Listbox | Native select | LivingArchiveScene sort state | Source, name, age | OS owns popup; visible Arabic label, keyboard selection. |
| Form | LivingArchiveScene / ArchivistLetterScene | Component input state | Search and assistant | Native labeled controls; noValidate; inline validation; preserve input on failure; block duplicate requests. |
| Scrollbar | globals.css | CSS design tokens | Forced colors | Visible tokenized scrollbar; stable gutter; native fallback. |
| Record details | RecordDialog | Source record | Archive, spotlight, assistant | Native dialog Escape and focus placement/restoration; no hover required. |
| Dataset status | DatasetNote | Dataset API metadata | Fresh, stale, bundled | Successful check differs from new names; unknown provenance dates stay unknown. |
| Source acknowledgement | QuietFinaleScene / SourceAcknowledgement.module.css | TFP names documentation and repository | Closing colophon | Credit Ministry lists via Tech For Palestine, thank contributors, isolate the English name, preserve keyboard focus and readable 320px wrapping; source links use safe new tabs. |
| Async resilience | api.ts | AbortSignal and current request | Retry and cancel | Timeout/cancel; old responses cannot overwrite filters; assistant failure preserves question. |
| Memorial navigation | Navbar | CHAPTERS and scroll progress | Home and archive | Preserve brand, index control, drawer, progress rule and visible focus; remembrance sentence replaces centre label without a drop; stable 88px desktop / 112px mobile header; mobile drawer clears the header; no clipping or horizontal overflow. |
| Motion | useScrollStory / HumanInstancedMesh | Particle store and OS preference | Progressive departure, morph, settled, reduced | Native scrolling; one observer; original fixed viewport centres; first three forms disperse towards cached wide-field positions with `clamp((chapterProgress - .13) * 1.8, 0, 1)`; later chapters retain a 900 ms eased morph; no bounded downward current, wraps, idle loop or manual pause; reduced motion shows complete forms directly. |
| Figure interaction | HumanInstancedMesh / RecordDialog | Settled shape and source record | Complete number, map, sprig, tree and finale shapes | Hover/tap disabled while scrolling and until 120 ms of quiet, during departure/morphs and in the quiet archivist field; clear hover on departure; no pinning during motion; retain control exclusions, drag guard and dialog focus behavior. |

Table Selection, CRUD and Toast are not applicable: the public archive is read-only. Search dates remain available via the API; this surface offers name and exact-age filters, so no calendar is needed. Rendering silhouettes uses a labeled sample, with complete paginated records as the accessible equivalent.

The cached departure field uses a flowing, softly scattered S-curve with tapered ends instead of uniform rectangular occupancy. This changes only the spread geometry; the approved progression, morph timing, settled-only picking and performance budgets remain.

The opening number retains its dark flag inks (#a52b28, #1c6840, #bbb7ad, #151a16) and reduced paper wash. The finale uses the original flag palette (#e4312b, #149954, #fff, #1e221e) and default paper wash. Neither adds a glow. The remembrance sentence is exactly «هؤلاء مَن وُثِّقَت أسماؤهم… وليسوا كلَّ مَن فقدنا.» in deep-red Amiri in the navbar, with responsive wrapping, no drop and no duplicate finale note.
