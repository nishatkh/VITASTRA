# ASTRA-X

Offline-first astronaut health monitoring. Gather, evaluate, act. Decision support, never diagnosis.
All physiology is synthetic (seeded PRNG). Radiation and solar labels refer to NASA RadLab / DONKI.

## Setup

```
npm install   # or pnpm install
npm run dev   # http://localhost:8443 (PORT to override)
npm run build && npm run preview   # service worker and offline cache work in the build
```

Optional: `python scripts/fetch_nasa_data.py` downloads NASA data once into a local SQLite DB. `node scripts/make-icons.mjs` regenerates PWA icons.

## Layout

Desktop mission-console UI: neon page, charcoal frame (`components/AppFrame.tsx`) with pill tabs, patient strip and a bottom mission-day timeline bar.

`src/components` primitives and shared UI, `src/modules` one folder per feature, `src/screens` app screens, `src/store` zustand and IndexedDB, `src/data` typed seeded data, `src/sim` engine, validation and demo script, `src/hooks`, `src/styles/tokens.css`, `public/manifest.webmanifest`.

## Demo script (about 3 minutes)

Open the Demo Controls button (bottom right, or More > Demo Controls) and press Auto-play, or step through:

1. Hazard map: five hazards, five outcomes.
2. Scrub Day 1 to 6 months. Curves thicken.
3. Checks: "I feel fine" while vision drifts (CUSUM).
4. Alerts: 14 raw signals become 2 alerts. Open "Why am I seeing this?".
5. Coach explains with cited procedure chips, delay set to 20 min.
6. Bone and Muscle: go offline, log a treadmill outage, risk rises.
7. Triage: lanes re-sort by delay. Export the SBAR and slide to send.

## Coverage checklist

| # | Item | Files |
|---|------|-------|
| 1 | Heart & Circulation | `modules/heart/index.tsx` |
| 2 | Bone & Muscle | `modules/bone/index.tsx` |
| 3 | Immune Stress | `modules/immune/index.tsx` |
| 4 | Vision & Fluid Shift | `modules/vision/index.tsx` |
| 5 | Radiation + shelter checklist | `modules/radiation/index.tsx` |
| 6 | Isolation & Mood | `modules/mood/index.tsx` |
| 7 | Closed Environment | `modules/environment/index.tsx` |
| 8 | Thinking & Balance | `modules/cognitive/index.tsx`, `Test.tsx`, `fit.ts` |
| 9 | Personal Baseline | `screens/Baseline.tsx`, `sim/engine.ts` |
| 10 | Four alert levels | `components/Level.tsx`, `screens/Alerts.tsx` |
| 11 | Offline mode and queue | `components/Layout.tsx`, `hooks/useEval.ts`, `screens/Settings.tsx` |
| 12 | Timeline & Reports | `screens/Timeline.tsx`, `lib/export.ts` |
| 13 | Privacy & Security, audit chain | `screens/Privacy.tsx`, `lib/hash.ts`, `store/useApp.ts` |
| 14 | D1 Hazard-to-Outcome Map | `modules/hazards/index.tsx` |
| 15 | D2 Silent-Signal Scheduler | `modules/scheduler/index.tsx` |
| 16 | D3 Countermeasure Reality Check | `modules/bone/index.tsx` |
| 17 | D4 Delay-aware Triage and hand-off | `modules/triage/index.tsx`, `sim/engine.ts` |
| 18 | D5 Contested-Pattern View | `modules/contested/index.tsx` |
| 19 | D6 Simulator and validation | `modules/validation/index.tsx`, `sim/validation.ts` |
| 20 | Body Twin | `modules/twin/index.tsx` |
| 21 | Sensor-Fault Check | `modules/sensor/index.tsx` |
| 22 | Alert-Fatigue Counter, risk chain | `components/AlertCounter.tsx`, `components/WhyDrawer.tsx` |
| 23 | Privacy Tiers | `screens/Privacy.tsx`, `components/ui.tsx` (Segmented) |
| 24 | Health Coach | `modules/coach/index.tsx` |

Golden rules: decision-support wording and "Why am I seeing this?" in `components/WhyDrawer.tsx` and `sim/engine.ts`; data-honesty chips in `components/ui.tsx` (SourceChip) and `screens/Sources.tsx`; offline first in `vite.config.ts` (service worker), `store/persist.ts` (IndexedDB), `public/manifest.webmanifest`; humans decide in `components/ui.tsx` (AdviceFooter).
Data Sources screen: `screens/Sources.tsx`. Demo Mode: `components/DemoDrawer.tsx`, `sim/demo.ts`, `hooks/useSimClock.ts`.
