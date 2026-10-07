<div align="center">

# 🚀 VITASTRA
### Astronaut Health Intelligence

**Offline-first · AI-guided decision support · Real-time mission health monitoring**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-View%20App-6366f1?style=for-the-badge&logo=vercel)](https://github.com/nishatkh/VITASTRA)
[![Tech Stack](https://img.shields.io/badge/React%2019-TypeScript-3178c6?style=for-the-badge&logo=typescript)](https://github.com/nishatkh/VITASTRA)
[![PWA](https://img.shields.io/badge/PWA-Offline%20Ready-22c55e?style=for-the-badge&logo=googlechrome)](https://github.com/nishatkh/VITASTRA)

</div>

---

## 🎯 What is VITASTRA?

**VITASTRA** is a mission-critical health intelligence platform designed for deep-space astronauts. It combines real-time physiological monitoring, AI-guided triage, and offline-first architecture to keep crews safe when communication delays make remote consultation impossible.

> **Decision support, never diagnosis.** VITASTRA surfaces signals and recommends actions — humans decide.

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🫀 **Heart & Circulation** | Real-time ECG, HRV trends, arrhythmia detection |
| 🦴 **Bone & Muscle** | Countermeasure tracking, treadmill outage logging, risk curves |
| 🧠 **Cognitive & Balance** | CUSUM-based drift detection, cognitive load assessment |
| 👁️ **Vision & Fluid Shift** | ICP proxy monitoring, VIIP risk scoring |
| ☢️ **Radiation Monitor** | NASA DONKI integration, shelter checklists, cumulative dose |
| 🧬 **Immune Stress** | Biomarker trends, stress-immune correlation |
| 🌍 **Environment** | CO₂, O₂, pressure, humidity — all in one view |
| 😔 **Isolation & Mood** | Psychological health tracking with Coach guidance |
| 🤖 **AI Health Coach** | Procedure-cited recommendations with delay-aware scheduling |
| 🔔 **4-Level Alert System** | WATCH → ADVISORY → CAUTION → EMERGENCY triage lanes |
| 📋 **SBAR Export** | Clinical handoff reports ready to transmit |
| 📡 **Offline-First PWA** | Full functionality with zero connectivity via IndexedDB + Service Worker |

---

## 🏗️ Architecture

```
vitastra/
├── src/
│   ├── api/           # Mock data layer (seeded PRNG, NASA RadLab / DONKI)
│   ├── components/    # Shared UI primitives (AlertCounter, Charts, ECG, WhyDrawer…)
│   ├── modules/       # Feature modules — one folder per health domain
│   │   ├── heart/     ├── bone/     ├── immune/    ├── vision/
│   │   ├── radiation/ ├── mood/     ├── environment/ ├── cognitive/
│   │   ├── hazards/   ├── triage/   ├── coach/     └── twin/
│   ├── screens/       # App-level views (Home, Alerts, Timeline, Privacy…)
│   ├── sim/           # Physics engine, CUSUM, demo script, validation
│   ├── store/         # Zustand + IndexedDB persistence
│   ├── hooks/         # useSimClock, useEval, custom React hooks
│   └── styles/        # Design tokens (CSS custom properties)
├── public/            # PWA manifest, icons, service worker
└── scripts/           # NASA data fetcher, PWA icon generator
```

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install          # or: pnpm install

# Start development server (http://localhost:8443)
npm run dev

# Build for production
npm run build && npm run preview
```

**Optional:** Fetch live NASA data once into a local SQLite cache:
```bash
python scripts/fetch_nasa_data.py
```

---

## 🎬 3-Minute Judge Demo

Open the **Demo Controls** panel (bottom-right corner → *More → Demo Controls*), press **Auto-play**, or step through manually:

| Step | What to look for |
|------|-----------------|
| **1. Hazard Map** | Five hazards → five outcome cascades |
| **2. Timeline Scrub** | Drag Day 1 → 6 months. Risk curves thicken |
| **3. Silent Conflict** | "I feel fine" while vision drifts (CUSUM alert) |
| **4. Alert Compression** | 14 raw signals collapse → 2 smart alerts. Tap "Why?" |
| **5. Health Coach** | Cited procedure chips, 20-min communication delay |
| **6. Countermeasure Gap** | Go offline → log treadmill outage → bone risk rises |
| **7. Triage Hand-off** | Lanes re-sort by delay. Export SBAR → slide to send |

---

## 🧩 Design Principles

### 📡 Offline-First
All data persists in **IndexedDB** via a custom `persist.ts` layer. A Workbox service worker pre-caches every asset. The app works identically with zero connectivity.

### 🛡️ Decision Support, Not Diagnosis
Every alert includes a **"Why am I seeing this?"** drawer with source citations. The `AdviceFooter` component is present on every recommendation screen.

### 🔬 Data Honesty
`SourceChip` components label every data point as `SYNTHETIC | NASA-DONKI | SEEDED`. No data is presented without provenance.

### ⏱️ Delay-Aware
Triage lanes account for Earth communication delay (configurable 0–24 min). Coach scheduling adjusts countermeasure windows accordingly.

### 🔐 Privacy by Design
Tiered privacy controls, audit chain with cryptographic hashing (`lib/hash.ts`), and local-only storage — no data leaves the device.

---

## 📊 Coverage Checklist (24 Design Goals)

| # | Goal | Files |
|---|------|-------|
| 1 | Heart & Circulation | `modules/heart/index.tsx` |
| 2 | Bone & Muscle | `modules/bone/index.tsx` |
| 3 | Immune Stress | `modules/immune/index.tsx` |
| 4 | Vision & Fluid Shift | `modules/vision/index.tsx` |
| 5 | Radiation + shelter checklist | `modules/radiation/index.tsx` |
| 6 | Isolation & Mood | `modules/mood/index.tsx` |
| 7 | Closed Environment | `modules/environment/index.tsx` |
| 8 | Thinking & Balance | `modules/cognitive/index.tsx` |
| 9 | Personal Baseline | `screens/Baseline.tsx`, `sim/engine.ts` |
| 10 | Four alert levels | `components/Level.tsx`, `screens/Alerts.tsx` |
| 11 | Offline mode and queue | `hooks/useEval.ts`, `screens/Settings.tsx` |
| 12 | Timeline & Reports | `screens/Timeline.tsx`, `lib/export.ts` |
| 13 | Privacy & Security, audit chain | `screens/Privacy.tsx`, `lib/hash.ts` |
| 14 | D1 Hazard-to-Outcome Map | `modules/hazards/index.tsx` |
| 15 | D2 Silent-Signal Scheduler | `modules/scheduler/index.tsx` |
| 16 | D3 Countermeasure Reality Check | `modules/bone/index.tsx` |
| 17 | D4 Delay-aware Triage | `modules/triage/index.tsx`, `sim/engine.ts` |
| 18 | D5 Contested-Pattern View | `modules/contested/index.tsx` |
| 19 | D6 Simulator & Validation | `modules/validation/index.tsx`, `sim/validation.ts` |
| 20 | Body Twin | `modules/twin/index.tsx` |
| 21 | Sensor-Fault Check | `modules/sensor/index.tsx` |
| 22 | Alert-Fatigue Counter, risk chain | `components/AlertCounter.tsx`, `components/WhyDrawer.tsx` |
| 23 | Privacy Tiers | `screens/Privacy.tsx`, `components/ui.tsx` |
| 24 | Health Coach | `modules/coach/index.tsx` |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **UI Framework** | React 19 + TypeScript 5.7 |
| **Styling** | Tailwind CSS v4 (via `@tailwindcss/vite`) |
| **Build** | Vite 8 |
| **Routing** | React Router v8 |
| **State** | Zustand v5 + IndexedDB (via `idb`) |
| **Data Fetching** | TanStack Query v5 |
| **Charts** | Recharts v3 + custom SVG (ECG, CUSUM) |
| **Animation** | Framer Motion v13 |
| **Offline / PWA** | Workbox (via `vite-plugin-pwa`) |
| **Validation** | Zod v4 |
| **Icons** | Lucide React |

---

## 📄 Data Sources

All physiological data is **synthetic** (seeded PRNG — deterministic, reproducible, shareable).  
Radiation and solar event labels reference **NASA RadLab** and **NASA DONKI** APIs.

---

## 👤 Author

**Nishat Khan** · [@nishatkh](https://github.com/nishatkh)

---

<div align="center">

*"Gather, evaluate, act — because in space, the next doctor is 20 minutes away."*

</div>

