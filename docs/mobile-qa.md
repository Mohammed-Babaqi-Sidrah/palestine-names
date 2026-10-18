# Phone verification — 18 October 2026

Tested the production build in Chrome with touch emulation and DPR 2:

| Layout | Viewport |
| --- | --- |
| Narrow portrait | 320 × 740 |
| Portrait | 360 × 800, 390 × 844, 430 × 932 |
| Landscape | 844 × 390 |

All six chapters, the footer and /archive were inspected. No uncaught page errors or document-level horizontal overflow remained. Navigation opens below the masthead, its final link is reachable in short landscape viewports, and choosing a chapter closes the menu. Source artwork loads. Record dialogs stay within the viewport and their close control remains usable.

## Corrections

- Age segments were as narrow as 16px at 320px; the 0–4 range wrapped and its percentage escaped its segment. At <=1000px an accurately proportional track now sits above the existing category buttons in a two-column legend. All targets are at least 44px, labels stay on one line, percentages retain their precision and selection still announces the cohort. The wide desktop spectrum remains unchanged.
- Native sort labels were clipped on narrow phones. Filters now stack at <=480px.
- The assistant input was 15px. It now uses 16px on phone-sized layouts; this avoids a common small-input auto-zoom trigger, though physical iOS keyboard behavior was not tested.
- Brand/source links and footer social links now have at least 44px touch dimensions.

The focused new regressions failed against 1d74853 before implementation. All 38 desktop/mobile Playwright cases pass against the production build, including category shares as small as 1%, tap/selection feedback, true track proportions, control sizes and full selected labels. A viewport/scroll test was synchronized with the actual footer mask update, retaining its boundary assertions.

A single confirmation batch repeats the five viewport checks. At 320px and in landscape, controlled long Arabic/English names, a six-column Markdown table and a long code line remain contained; code scrolls internally and referenced records open/close correctly. These response fixtures do not call an external AI service. Lint, types, production build, strict UI audit and design-token lint are recorded with the final change.

This verifies browser emulation and the local production build. Physical Android/iOS devices and Safari were not exercised. Particle resource limits and motion regressions remain in the full suite; no GPU behavior or data pipeline was changed for this refinement.
