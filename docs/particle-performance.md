# Particle performance — 15 October 2026

The renderer now budgets work independently of the display refresh rate. Shapes hold still after gathering; scrolling wakes the same mesh, reads the current scroll position and carries its figures downward. Gathering begins after a 60 ms pause. Reduced motion skips travel.

## Resource limits

| Device hints | Maximum figures | Maximum pixel ratio | Paint cap |
| --- | ---: | ---: | ---: |
| At most 4 reported CPU cores or 4 GB memory | 600 | 1 | 30 fps |
| Other narrow viewports, below 760 px | 1,000 | 1.25 | 60 fps |
| Other viewports | 2,400 | 1.25 | 60 fps |

These hints are conservative, not a GPU benchmark. Actual count also depends on available records, and the caption reports that rendered sample. The full archive and exact statistics remain independent of the visual budget. WebGL-free reading/search and OS reduced motion remain available.

One instanced render pass writes scale/translation directly into reusable matrices. Per-mode colours and transport randomness are cached; colour uploads occur on formation/highlight changes, rather than every frame. A coalesced timer enforces the paint budget, including on high-refresh displays. Settled and hidden pages stop painting. Markdown rendering code is requested only when an assistant answer exists.

## Before and after

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

## Experiment ledger

| Attempt | Measurement | Decision |
| --- | --- | --- |
| Reuse palette/transport buffers, direct matrices, lower DPR, own capped render pass | Intermediate scripting: 172–220 ms desktop, 712–743 ms mobile; substantially below baseline | Keep the coherent renderer changes. |
| Lazy-load answer Markdown | Initial JavaScript 423,293 → about 379,600 bytes | Keep; answer rendering and safe Markdown tests pass. |
| Add requested olive sprig and shorten gathering pause | Final scripting remains 66% / 46% below baseline; branch verified on desktop/mobile | Keep the requested visual and responsiveness changes. |
| Wake the coalesced timer just before the frame deadline | Intermediate ~49–51 paints/s → final ~59–60 paints/s on the 240 Hz host | Keep for smoother scrolling; final measured costs above include it. The callback still enforces the cap. |

No backend or data-pipeline change was needed. The existing memorial endpoint already sends gzip-compressed data. No new dependencies were added.

## Regression checks

`frontend/tests/memorial.spec.ts` instruments real WebGL calls. A device reporting two cores / 2 GB receives 600 instances, stops drawing at idle, stays within its scroll paint budget and sends no repeated colour uploads within one formation. The olive-branch test verifies both wood and leaf colours while retaining the readable record/dialog. Both new tests failed against the previous production build before implementation.

The complete 26-case desktop/mobile suite passes, including actual downward travel, gathering, reduced motion, WebGL fallback, finale alignment, safe Markdown and archive interactions. Additional local browser checks pass for hover-colour restoration, resize, hidden/resumed rendering and WebGL context loss/restoration. Final desktop/mobile captures have no uncaught page errors or horizontal overflow. Lint, TypeScript, production build, strict UI audit and design-token lint pass.
