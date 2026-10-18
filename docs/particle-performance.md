# Particle performance — 15 October 2026

The renderer budgets work independently of the display refresh rate. The first three shapes progressively disperse into a cached wide field as the reader leaves each chapter, following the original main progression. Chapter changes gather into the next shape with the existing 900 ms eased morph; the tree, quiet field and finale keep that later passage. Stopping holds the current pose and stops rendering once it settles. Reduced motion bypasses dispersal and snaps to complete shapes. The historical experiments below record the user's evolving motion brief; the final subsection describes the current contract.

## Resource limits

| Device hints | Maximum figures | Maximum pixel ratio | Paint cap |
| --- | ---: | ---: | ---: |
| At most 4 reported CPU cores or 4 GB memory | 600 | 1 | 30 fps |
| Other narrow viewports, below 760 px | 1,000 | 1.25 | 60 fps |
| Other viewports | 2,400 | 1.25 | 60 fps |

These hints are conservative, not a GPU benchmark. Actual count also depends on available records, and the caption reports that rendered sample. The full archive and exact statistics remain independent of the visual budget. WebGL-free reading/search and OS reduced motion remain available.

One instanced render pass writes scale/translation directly into reusable matrices. Per-mode colours and chapter-departure positions are cached; colour uploads occur on formation/highlight changes, rather than every frame. A coalesced timer enforces the paint budget, including on high-refresh displays. Settled and hidden pages stop painting. Markdown rendering code is requested only when an assistant answer exists.

## Renderer optimization at commit 4c737b5

Baseline: commit `e6ddfe3`. Same production build mode, local API/snapshot, Chrome, cold browser contexts, DPR 2, two runs per case. Desktop: 1440 × 1000. Mobile simulation: 390 × 844 with touch and **4× CPU throttling**, without overriding hardware hints (1,000 figures). Each run measures a 3.5-second continuous native scroll at 0.55 px/ms. Chrome CDP supplies scripting/task duration; WebGL instrumentation counts actual instanced draws and buffer uploads. The host's browser RAF ran at approximately 240 Hz; browser RAF intervals are **not** particle paint cadence.

| Metric, mean of two runs | Desktop before → after | Throttled mobile before → after |
| --- | ---: | ---: |
| Scripting during 3.5 s scroll | 649.5 → 218.6 ms (−66.3%) | 1744.3 → 945.5 ms (−45.8%) |
| Browser task time during scroll | 901.5 → 467.8 ms | 2747.3 → 1908.7 ms |
| Actual instanced draws during scroll | 831.5 → 209 | 830 → 208 |
| Buffer data uploaded during scroll | 151.7 → 32.2 MB (−78.8%) | 63.1 → 13.3 MB (−78.9%) |
| Initial encoded JavaScript | 423,293 → 379,631 bytes (−10.3%) | 423,293 → 379,631 bytes |
| Canvas backing pixels | 2160 × 1500 → 1800 × 1250 | 585 × 1266 → 487 × 1055 |
| Draws during 500 ms settled idle | 0 → 0 | 0 → 0 |

Final individual scripting samples were 219.56 / 217.69 ms desktop and 951.83 / 939.14 ms mobile. The improvement exceeds the observed variation. Initial scroll-to-next-draw samples were 10.9–11.8 ms desktop and 13.7–14.0 ms mobile. This last metric measures a draw following input, not a hardware input-latency guarantee.

First particle draw stayed within roughly the same range: baseline 450–497 ms desktop / 1371–1410 ms mobile; final 451–547 ms / 1412–1483 ms. Smaller initial JavaScript is demonstrated; faster first paint is **not** established by this test. This is a controlled local comparison, not real-user Core Web Vitals, network testing, battery measurement or a promise of a particular frame rate on every device.

## Experiment ledger at commit 4c737b5

| Attempt | Measurement | Decision |
| --- | --- | --- |
| Reuse palette/transport buffers, direct matrices, lower DPR, own capped render pass | Intermediate scripting: 172–220 ms desktop, 712–743 ms mobile; substantially below baseline | Keep the coherent renderer changes. |
| Lazy-load answer Markdown | Initial JavaScript 423,293 → about 379,600 bytes | Keep; answer rendering and safe Markdown tests pass. |
| Add requested olive sprig and shorten gathering pause | Final scripting remains 66% / 46% below baseline; branch verified on desktop/mobile | Keep the requested visual and responsiveness changes. |
| Wake the coalesced timer just before the frame deadline | Intermediate ~49–51 paints/s → final ~59–60 paints/s on the 240 Hz host | Keep for smoother scrolling; final measured costs above include it. The callback still enforces the cap. |

No backend or data-pipeline change was needed. The existing memorial endpoint already sends gzip-compressed data. No new dependencies were added.

## Regression checks

`frontend/tests/memorial.spec.ts` instruments real WebGL calls. A device reporting two cores / 2 GB receives 600 instances, stops drawing at idle, stays within its scroll paint budget and sends no repeated colour uploads within one formation. The olive-branch test verifies both wood and leaf colours while retaining the readable record/dialog. Both new tests failed against the previous production build before implementation.

At that revision the complete 26-case desktop/mobile suite passed, including actual downward travel, gathering, reduced motion, WebGL fallback, finale alignment, safe Markdown and archive interactions. Additional local browser checks passed for hover-colour restoration, resize, hidden/resumed rendering and WebGL context loss/restoration. Desktop/mobile captures had no uncaught page errors or horizontal overflow. Lint, TypeScript, production build, strict UI audit and design-token lint passed.

## Earlier follow-up: chapter entry, hover and flag colours (15 October)

The user's clarification replaces continuous scroll-driven displacement with finite chapter journeys. Within-chapter scrolling no longer wakes the renderer. Chapter entry snapshots the current pose, carries figures downward and assembles the next shape; upward navigation reverses travel and a new chapter can interrupt from the current pose. The 900 ms clock completes even after a single scroll input. Reduced motion cancels it and snaps. Declaration mode now participates in both hover and tap picking; controls, record cards and drag gestures remain excluded. The opening numeral uses the existing flag palette in spatial black/white/green bands with a red triangle.

The same two-run 3.5-second production profile now measures 142.08 / 151.91 ms scripting and 84 / 85 draws on desktop; 640.85 / 655.36 ms and 62 / 62 draws with mobile CPU throttling. Mean buffer uploads are 13.04 MB desktop / 3.99 MB mobile. Initial encoded JavaScript is 379,674 bytes and settled idle draws remain zero. This saves additional work by implementing the requested stillness between chapters; it does not demonstrate a faster render of identical motion. The probe's time from the *first within-chapter scroll* to the first draw now includes intentionally waiting until chapter entry, so it must not be interpreted as input latency.

All 30 desktop/mobile browser cases pass. Eight focused cases failed against the preceding production build before these changes, reproducing missing declaration hover/tap, the monochrome number, within-chapter displacement and excess paints. The updated checks require stillness within a chapter, visible downward travel continuing without more input, eventual idle stop, the limited-device paint cap, all four flag colours, and working olive-branch hover/tap. This supersedes the older test that required displacement on every scroll. Existing archive, Markdown, age, fallback and reduced-motion checks remain green.

## Earlier section-linked placement — superseded 17 October experiment

The latest approved clarification supersedes within-chapter viewport pinning. The renderer keeps the approved shape dimensions, colours and 900 ms eased morph, but the vertical destination follows section bounds: `max(rect.top, min(0, rect.bottom - innerHeight)) + innerHeight * approvedAnchor`. Long chapters hold the composition only while filling the viewport; their entering/leaving edges carry it with the page. The morph follows the incoming section's live destination without forced offscreen wraps. Position metadata uses a direct subscription, avoiding React Canvas reconfiguration for each scroll update.

Tests observe an actual 180 px GPU translation with the opening section and the same displacement in reverse, continuous no-wrap morphs, finale alignment relative to its section bounds, the low-resource paint cap and stopped idle work. Eight focused cases failed against `16bb6f7` before the fix. The full 30-case desktop/mobile suite passes. A mobile particle tap also exposed a real dialog bug: its synthesized click immediately dismissed the newly opened backdrop. Dismissal now requires a gesture that began on the backdrop; the strengthened test checks both persistent opening and deliberate dismissal. A transient initial-font-layout measurement was synchronized without relaxing the finale's original tolerance.

The same two-run production scroll probe on 17 October records scripting of 171.92 / 182.72 ms desktop and 756.11 / 918.15 ms with 4× mobile CPU throttling. Actual scroll draws are 208 / 210 desktop and 171 / 171 mobile, under the existing 60 fps ceiling; idle draws remain zero in all runs. The low-hardware regression separately verifies the 600-instance / 30 fps budget. Initial encoded JavaScript is 379,697 bytes. This behavior intentionally paints during section movement, so the preceding revision's lower draw count from viewport pinning is not a like-for-like performance target. These are laboratory measurements, not real-user guarantees.

Desktop/mobile motion captures have no uncaught page errors or horizontal overflow. Hover-colour restoration, resizing, hidden-page recovery and WebGL context loss/restoration pass. Lint, TypeScript, production build, design-token lint and strict UI audit pass. Read-only source review found no Important/Critical findings. No new dependencies or pipeline changes were needed.

## Earlier suspended current and interactive fields — superseded

The user corrected the prior section-following interpretation. Figures now stay at the approved viewport centres while scroll input adds a soft downward current: 25% of a bounded scroll displacement, capped at 10% of viewport height before cached per-figure variation. The current decays to exactly zero; no full-screen loop or autonomous falling continues at idle. Upward input reverses it. Reduced motion zeros it and snaps. The existing 900 ms chapter morph is retained.

Every floating mode, including the quiet archivist field, supports hover and taps during morphs. Hover pins the chosen figure's X/Y with a small retention radius so its name stays readable; click resolution uses that same retained identity. Touch captures the pressed record before it drifts, but drag/scroll gestures and controls still block selection. A source-review finding about mismatched hover/click radii was fixed and covered by the retained-label-to-dialog regression.

Flag visibility uses darker muted red/green/black and a weathered bone-white ink, with less paper wash only over the number and finale. There is no glow, filter, second draw pass or new dependency. The closing documentation note is ordinary Arabic text with one static geometric drop; it adds no motion workload.

The final 32-case desktop/mobile suite passes. The focused run on `63f42bf` reproduced nine failures for the superseded anchors, absent downward flow, bright palette and disabled floating interactions; the existing resource tests remained green. New checks cover gap/morph and settled quiet-field interaction, pinned hover, the exact record on click, the darker palette and the Arabic closing note. Lint, TypeScript, build, strict UI audit and design-token lint pass. Desktop/mobile captures have no page errors or horizontal overflow.

The same production probe records 171.90 / 166.21 ms scripting desktop and 818.48 / 746.53 ms with 4× mobile CPU throttling. Draws over the 3.5-second scroll are 203 / 210 desktop and 208 / 207 mobile, respecting the existing 60 fps ceiling. All four runs have zero settled idle draws. Initial encoded JavaScript is 380,188 bytes; the 600-instance / 30 fps low-hardware budget is independently verified by browser regression. These are historical local measurements of that superseded behavior, not universal hardware or input-latency guarantees.

## Current correction: original-main dispersal and inspection of settled shapes — 18 October 2026

The first three formations now use the original main departure curve: `clamp((chapterProgress - .13) * 1.8, 0, 1)`. Each figure progressively interpolates from its form towards cached deterministic positions spanning 85% of viewport width and 58% of height, with scale .095. Positions are centred in the full viewport, including when the map's settled stage is narrower. There are no random calculations or allocations per figure per frame. Stopping holds that spread instead of gathering prematurely; the next chapter gathers from the current pose. The existing 900 ms morph through the tree, quiet archivist field and finale is retained. No bounded downward current, wrapping or autonomous idle motion remains.

Picking is restricted to complete, settled shapes. Native scroll immediately clears hover and readiness; picking resumes only after 120 ms without input and once X/Y positions settle. Dispersal, chapter morphs and the quiet field remain visual only. Hover depth/scale feedback does not revoke positional readiness. Controls, drag guards, retained hover-to-click identity and deliberate dialog backdrop dismissal remain intact. Reduced motion bypasses dispersal and snaps directly to complete shapes.

The opening number retains the approved muted flag inks and reduced paper wash. The finale restores its original red #e4312b, green #149954, white #ffffff and black #1e221e, together with the default paper wash. The exact remembrance sentence now sits in the navbar with no drop icon: an 88 px desktop header and a stable 112 px mobile header, with the drawer below it. No pipeline or dependency changes were needed.

The 32-case desktop/mobile suite passes. A focused run against `a05ecb5` reproduced eight failures for absent progressive dispersal, active picking during scrolling, the darkened finale and the missing navbar note; both resource cases remained green. Current GPU regressions cover increasing departure, wide suspended spread, eventual gathering, zero idle updates, reduced motion, settled interaction and blocked interaction separately during input, a shape-to-shape morph, paused dispersal and the quiet field. Browser captures at 320, 390, 820 and 1440 px show no page errors, horizontal overflow or clipped remembrance text; the drawer clears the header. Hover-colour restoration, resize, hidden-page pause/resume and WebGL context loss/restoration pass. Lint, TypeScript, production build, strict UI audit and design-token lint pass.

Using the same two-run production probe described above, scripting is 173.49 / 180.55 ms desktop and 929.57 / 843.02 ms with 4× mobile CPU throttling. Actual draws over 3.5 seconds are 208 / 210 desktop and 208 / 209 mobile. All runs have zero settled idle draws. Encoded initial JavaScript is 380,126 bytes. The limited-hardware regression separately retains 600 figures and a 30 fps ceiling. These samples verify the retained budgets for the corrected animation; the previous motion differs and its lower scripting samples are not an identical-workload comparison. They do not establish performance on every physical device.
