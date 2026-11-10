<div align="center">

<img src="https://i.postimg.cc/wxN8W5t4/Whats-App-Image-2026-11-08-at-10-36-37-PM-Photoroom.png" alt="VITASTRA Logo" width="96" height="96" style="border-radius:20px;" />

# VITASTRA
### Astronaut Health monitoring Platform

**Understand the body. Connect the risks. Act before a silent problem becomes a mission-critical one.**

*NASA International Space Apps Challenge 2026 · Team: **Zero Gravity Minds***

[![Live Demo](https://img.shields.io/badge/Live%20Demo-View%20App-6366f1?style=for-the-badge&logo=vercel&logoColor=white)](https://github.com/nishatkh/VITASTRA)
[![React 19](https://img.shields.io/badge/React%2019-TypeScript%205.7-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://github.com/nishatkh/VITASTRA)
[![PWA](https://img.shields.io/badge/PWA-Offline%20Ready-22c55e?style=for-the-badge&logo=googlechrome&logoColor=white)](https://github.com/nishatkh/VITASTRA)
[![NASA OSDR](https://img.shields.io/badge/NASA%20OSDR-OSD--569%20%7C%20OSD--575-0b3d91?style=for-the-badge&logo=nasa&logoColor=white)](https://osdr.nasa.gov/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

</div>

---

## What is VITASTRA?

**VITASTRA** is a mission-critical astronaut health intelligence and clinical decision-support platform for deep-space long-duration missions — Moon, Mars, L1/L2, and deep-space transits.

A conventional dashboard tells an astronaut what their heart rate is right now. **VITASTRA tells the astronaut what has *changed*, how it connects to the mission environment, whether the evidence is reliable, what to check next, and what can safely wait for Earth.**

VITASTRA connects four things that conventional health dashboards treat separately:

| Layer | What it tracks |
|---|---|
| <img src="docs/icons/astronaut.svg" width="18" height="18" align="center" alt="Astronaut" /> **The Astronaut** | Vitals, sleep, mood, exercise, symptoms, biological samples, and active health checks |
| <img src="docs/icons/environment.svg" width="18" height="18" align="center" alt="Environment" /> **The Environment** | Radiation, cabin air (CO₂, O₂), temperature, pressure, and mission conditions |
| <img src="docs/icons/mission.svg" width="18" height="18" align="center" alt="Mission" /> **The Mission** | Workload, communication delay, equipment availability, and time in microgravity |
| <img src="docs/icons/evidence.svg" width="18" height="18" align="center" alt="Evidence" /> **The Evidence** | Real NASA research, each astronaut's personal baseline, confidence levels, and data quality |

> **Decision support, never diagnosis.** VITASTRA surfaces biological signals, tracks individual baselines, and recommends validated operational procedures — flight surgeons and astronauts decide.

---

## The Problem VITASTRA Solves

NASA identifies **five hazards of human spaceflight**:

1. <img src="docs/icons/radiation.svg" width="16" height="16" align="center" alt="Radiation" /> **Space radiation**
2. <img src="docs/icons/isolation.svg" width="16" height="16" align="center" alt="Isolation" /> **Isolation and confinement**
3. <img src="docs/icons/distance.svg" width="16" height="16" align="center" alt="Distance" /> **Distance from Earth**
4. <img src="docs/icons/gravity.svg" width="16" height="16" align="center" alt="Gravity" /> **Altered gravity fields**
5. <img src="docs/icons/hostile.svg" width="16" height="16" align="center" alt="Hostile" /> **Hostile or closed environments**

These hazards **interact**. Microgravity, stress, poor sleep, radiation, and cabin air conditions can contribute to overlapping changes across immune function, cardiovascular health, vision, bone and muscle, and cognition — often silently, without noticeable symptoms.

Long-duration missions create a compounding problem: health changes develop gradually, real-time Earth support may be delayed by up to 40 minutes, and there is no way to rely on symptoms alone.

VITASTRA uses **personal baselines, scheduled biological surveillance, connected risk chains, transparent confidence levels, and onboard decision support** to close that gap.

---

## Core Capabilities

| Feature Module | Technology & Source | What It Does |
|---|---|---|
| **Inspiration4 Research Intelligence** | NASA OSDR OSD-569 & OSD-575 | Interactive multi-panel dashboard (CBC, CMP, Cytokines, Cardiovascular) across 4 civilian astronauts (C001–C004), L-92 to R+194 |
| **NASA Five Hazards Map** | NASA HRP Architecture | Systems-biology graph connecting 5 hazards to 9 health domains |
| **Silent Biological Risk Engine** | CUSUM & Multi-domain Checks | Scheduled surveillance for vision (SANS), cognitive speed (PVT), balance sway, sleep efficiency, and viral shedding |
| **Saliva-Based Immune Monitoring** | Artemis II Saliva Protocol | 7-stage sample lifecycle (Scheduled → Collected → Stored at −80°C → Submitted → Processing → Received → Reviewed) tracking VZV, EBV, cortisol |
| **Bone & Muscle Scorecard** | NASA HRP Countermeasures | Planned vs. delivered mechanical load (ARED, CEVIS, T2), hardware outage logging, and adherence scoring |
| **Space Biology Research Library** | Peer-Reviewed NASA Studies | Filterable catalog of 8 space biology studies — iPSC neural organoids, cardiac tissue chips, kidney chips, lung chips |
| **Evidence-Based Health Coach** | Grounded Rules Engine | Explains baseline shifts, cites flight procedures (MED, SANS, ECLSS), and strictly refuses to fabricate medical advice |
| **Delay-Aware Medical Reporting** | Structured NASA SBAR | Formal clinical handoff (Situation, Background, Assessment, Recommendation) with 0–40 min light-delay state machine |
| **Radiation & Space Weather** | NASA DONKI & RadLab | Absorbed dose (mGy → mSv), Solar Superstorm flare catalog (GOES-16 X8.7), and storm shelter checklist |
| **Sensor & Data Quality Engine** | Plausibility Validation | System-wide detection of missing values, sensor dropouts, implausible bounds, and stale readings |
| **Personal Health Baseline** | Statistical Baseline Engine | Mean, SD, Median, MAD, Z-scores with strict N≥2 sufficiency — sparse data stays uncalculated |
| **Four-Level Alert Lifecycle** | NASA-STD-3001 Triage | Distinct shapes (Circle, Diamond, Triangle, Octagon) with lifecycle states: New → Acknowledged → Resolved → Dismissed |

---

## Real NASA Data Integrations

VITASTRA strictly follows **Zero Fabrication** — no simulated measurements are ever presented as real telemetry.

| NASA Dataset | Source / Accession | Records | Status |
|---|---|---|---|
| Inspiration4 Whole Blood (CBC) | NASA OSDR OSD-569 | 553 | <img src="docs/icons/check-verified.svg" width="15" height="15" align="center" alt="Verified" /> **Fully Working** |
| Inspiration4 Serum (CMP) | NASA OSDR OSD-575 | 531 | <img src="docs/icons/check-verified.svg" width="15" height="15" align="center" alt="Verified" /> **Fully Working** |
| Inspiration4 Multiplex Cytokines | NASA OSDR OSD-575 | 1,988 | <img src="docs/icons/check-verified.svg" width="15" height="15" align="center" alt="Verified" /> **Fully Working** |
| Inspiration4 Cardiovascular Markers | NASA OSDR OSD-575 | 252 | <img src="docs/icons/check-verified.svg" width="15" height="15" align="center" alt="Verified" /> **Fully Working** |
| NASA DONKI Space Weather | `api.nasa.gov/DONKI` | Live + Archive | <img src="docs/icons/check-verified.svg" width="15" height="15" align="center" alt="Verified" /> **Working (Solar Fallback)** |
| NASA RadLab Radiation Physics | `visualization.osdr.nasa.gov` | Daily Dosimetry | <img src="docs/icons/check-verified.svg" width="15" height="15" align="center" alt="Verified" /> **Fully Working (LEO)** |
| NASA ISS Environmental Telemetry | NASA EDA / ECLSS | Continuous | <img src="docs/icons/check-verified.svg" width="15" height="15" align="center" alt="Verified" /> **Fully Working** |

### Scientific Data Quality Rules

- **Race-based eGFR exclusion:** `eGFR AFRICAN AMERICAN` and `eGFR NON-AFR. AMERICAN` are strictly excluded in compliance with modern clinical nephrology consensus.
- **Sex-labeled analytes** (e.g. `HEMATOCRIT (FEMALE)`) are normalized to standard clinical nomenclature; original raw string preserved in `raw_analyte`.
- **Preflight baseline sufficiency:** Minimum **two valid preflight observations** required before computing SD and postflight Z-scores.
- **Missing values remain missing:** No silent imputation or interpolation — ever.

---

## Quick Start

### Prerequisites

| Tool | Version |
|---|---|
| Node.js | v20+ (v22+ recommended) |
| npm | v10+ (bundled with Node) |
| Python | v3.10+ *(optional — for data ingestion scripts only)* |

### Installation & Development

```bash
# 1. Clone the repository
git clone https://github.com/nishatkh/VITASTRA.git
cd VITASTRA

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
# → App available at http://localhost:8443
```

### Environment Variables *(Optional — for live NASA DONKI API)*

The app works fully offline without any environment variables. The NASA DONKI integration falls back to a verified archived Solar Superstorm dataset when no API key is provided.

Create a `.env.local` file in the project root to enable live NASA API access:

```env
# Optional: NASA API key for live DONKI space weather data
# Get your free key at https://api.nasa.gov/
VITE_NASA_API_KEY=your_nasa_api_key_here
```

> `.env*` files are excluded from git by `.gitignore` — your key will never be committed.

### NASA Data Ingestion *(Optional — data already included in `src/data/`)*

```bash
# Re-run the repeatable NASA OSDR ingestion pipeline
python scripts/ingest_nasa_data.py

# Run the automated scientific integrity verification suite
python scripts/verify_vitastra.py
```

### Production Build

```bash
# Build for production (generates PWA service worker)
npm run build

# Preview the production build locally
npm run preview
```

---

## Technical Architecture

```
VITASTRA/
├── src/
│   ├── api/                    # API layer: HTTP client, Zod schemas, TanStack Query hooks
│   │   ├── clients.ts          # NASA DONKI, RadLab, ECLSS API clients
│   │   ├── hooks.ts            # React Query data-fetching hooks
│   │   ├── schemas.ts          # Zod validation schemas for all data types
│   │   └── mock.ts             # Offline fallback mock data
│   ├── components/             # Shared UI primitives and layout
│   │   ├── AppFrame.tsx        # Root shell: WebGL background, navbar, timeline bar
│   │   ├── Charts.tsx          # Recharts wrappers (ECG, trend, bar, radar)
│   │   ├── Layout.tsx          # Page layout, offline banner, section wrappers
│   │   └── ui/                 # Liquid-glass navbar, shader background (WebGL)
│   ├── data/
│   │   ├── processed/          # Normalized NASA datasets (JSON — bundled with app)
│   │   └── raw/                # Preserved original NASA OSDR CSV submissions
│   ├── modules/                # Health domain intelligence modules (one per domain)
│   │   ├── bone/               # Countermeasure scorecard & hardware outage logger
│   │   ├── coach/              # Evidence-grounded health coach (rules engine)
│   │   ├── cognitive/          # PVT reaction test & balance sway tracker
│   │   ├── contested/          # Contested-pattern low-confidence view
│   │   ├── environment/        # Cabin CO₂, pressure, O₂, temperature (ECLSS)
│   │   ├── hazards/            # NASA Five Hazards-to-Outcomes interactive map
│   │   ├── heart/              # Cardiovascular baseline, ECG animation
│   │   ├── immune/             # Saliva sample lifecycle tracker (7-stage)
│   │   ├── mood/               # Private circadian & behavioral check-in
│   │   ├── radiation/          # RadLab dosimetry & DONKI solar storm monitor
│   │   ├── scheduler/          # Silent biological risk surveillance scheduler
│   │   ├── sensor/             # Sensor data quality & plausibility tester
│   │   ├── triage/             # Delay-aware SBAR medical handoff reporting
│   │   ├── twin/               # Physiological expected-vs-actual digital twin
│   │   └── validation/         # 100-crew detector validation simulator
│   ├── screens/                # Top-level route views
│   │   ├── Home.tsx            # Mission dashboard with live vitals
│   │   ├── Inspiration4.tsx    # NASA OSDR multi-panel research dashboard
│   │   ├── Timeline.tsx        # Mission timeline & analytics
│   │   ├── Alerts.tsx          # Four-level alert lifecycle manager
│   │   ├── Baseline.tsx        # Personal statistical baseline engine
│   │   ├── ResearchLibrary.tsx # Space biology research catalog
│   │   └── ...                 # Settings, Sources, Privacy, More
│   ├── services/
│   │   ├── baseline/           # Baseline engine: Mean, SD, Median, MAD, Z-score
│   │   ├── data-validation/    # Sensor plausibility & quality validator
│   │   └── nasa/               # NASA DONKI live client & error handling
│   ├── store/
│   │   ├── useApp.ts           # Zustand global state (day, astronaut, alerts)
│   │   └── persist.ts          # IndexedDB offline persistence layer
│   ├── lib/
│   │   ├── hash.ts             # SHA-256 cryptographic audit chain
│   │   └── export.ts           # Data export utilities
│   └── styles/
│       └── tokens.css          # Design tokens (liquid-glass palette, spacing)
├── docs/
│   └── data-sources.md         # Comprehensive NASA dataset documentation
├── scripts/
│   ├── ingest_nasa_data.py     # Repeatable NASA OSDR ingestion pipeline
│   ├── fetch_nasa_data.py      # NASA DONKI live fetch helper
│   └── verify_vitastra.py      # Automated scientific integrity test suite
└── public/                     # PWA manifest, icons (192px, 512px)
```

### Technology Stack

| Layer | Technology |
|---|---|
| **UI Framework** | React 19, TypeScript 5.7 |
| **Routing** | React Router v8 (file-based, 29 routes) |
| **Data Fetching** | TanStack React Query v5 |
| **State Management** | Zustand v5 |
| **Offline Storage** | IndexedDB via `idb` |
| **Charts** | Recharts v3 |
| **Animations** | Framer Motion v13 |
| **Styling** | Tailwind CSS v4 (Vite plugin) |
| **Build Tool** | Vite 8, Rolldown |
| **PWA** | vite-plugin-pwa + Workbox |
| **Schema Validation** | Zod v4 |
| **Visual Effects** | Custom WebGL shaders (GLSL — no three.js dependency) |
| **Formatting** | oxfmt |

---

## Application Routes

| Route | Module | Description |
|---|---|---|
| `/` | Home | Live mission dashboard with vitals strip and timeline bar |
| `/body` | Heart | Cardiovascular baseline, ECG animation, HRV trends |
| `/bone` | Bone | Countermeasure scorecard (ARED, CEVIS, T2) |
| `/immune` | Immune | Saliva sample lifecycle tracker |
| `/vision` | (via scheduler) | SANS vision check scheduling |
| `/radiation` | Radiation | RadLab dosimetry + DONKI solar storm monitor |
| `/mood` | Mood | Private circadian & behavioral check-in |
| `/env` | Environment | ECLSS cabin telemetry (CO₂, O₂, pressure, temp) |
| `/cognitive` | Cognitive | Cognitive baseline dashboard |
| `/cognitive/test` | CognitiveTest | PVT reaction-time test |
| `/checks` | Scheduler | Silent biological risk surveillance schedule |
| `/coach` | Coach | Evidence-based health coach |
| `/twin` | Twin | Physiological digital twin (expected vs. actual) |
| `/sensor` | Sensor | Data quality & plausibility tester |
| `/contested` | Contested | Low-confidence pattern view |
| `/baseline` | Baseline | Personal statistical baseline engine |
| `/alerts` | Alerts | Four-level alert lifecycle manager |
| `/timeline` | Timeline | Mission timeline & analytics |
| `/inspiration4` | Inspiration4 | NASA OSDR multi-panel research dashboard |
| `/research` | ResearchLibrary | Space biology research catalog |
| `/mc/hazards` | Hazards | NASA Five Hazards-to-Outcomes map |
| `/mc/triage` | Triage | Delay-aware SBAR medical handoff |
| `/mc/validation` | Validation | 100-crew detector validation simulator |

---

## Privacy & Security by Design

| Feature | Implementation |
|---|---|
| **Offline-First Storage** | All check-ins, baselines, and logs stored in client-side IndexedDB — zero unprompted transmission |
| **Role-Based Privacy Tiers** | Three tiers: *Private to Astronaut*, *Medical Officer Only*, *Mission Control* — psychological data never auto-shared |
| **Cryptographic Audit Chain** | Audit events linked with SHA-256 hashes (`lib/hash.ts`) to prevent silent log alteration |
| **Anonymized Research Data** | Inspiration4 IDs strictly preserved as `C001`–`C004` — no demographic re-identification |
| **No API Key Exposure** | Environment variables gated behind `VITE_` prefix; `.env*` excluded from git |

---

## Responsive Breakpoints

VITASTRA is designed and validated across all viewports:

| Breakpoint | Layout |
|---|---|
| **Mobile (360–390px)** | Compact floating navbar, 2-column vitals grid, touch-scrollable pill navigation |
| **Tablet (768px)** | Adaptive multi-column grid, side-by-side assessment panels |
| **Laptop & Desktop (1024px–1920px)** | Full multi-pane mission control with persistent astronaut strip, SVG hazard map, and data tables |

---

## Scientific Limitations & Disclosures

1. **Decision support only.** VITASTRA identifies statistical deviations from personal baselines. It does not diagnose clinical disease.
2. **Inspiration4 cohort boundary.** The Inspiration4 study represents four healthy civilian crewmembers on a 3-day flight. Findings cannot be generalized as universal spaceflight norms.
3. **Sample ≠ result.** A saliva sample marked "collected" is not a laboratory test result. VITASTRA clearly distinguishes collection from analysis.
4. **Organoid models ≠ astronaut physiology.** Tissue-chip and organoid research provides cellular insight, not clinical proof of pathology in living crewmembers.
5. **Mechanical load ≠ bone density.** Countermeasure logs record delivered mechanical load, not in-vivo bone mineral density.
6. **Population estimates ≠ individual predictions.** The ~1–1.5% per month bone density loss is a population average. VITASTRA does not apply it as an individual forecast.

---

## Development Scripts

```bash
npm run dev       # Start Vite development server (port 8443)
npm run build     # Production build with PWA service worker
npm run preview   # Preview production build locally
npm run format    # Format source files with oxfmt
```

```bash
python scripts/ingest_nasa_data.py   # Re-ingest NASA OSDR datasets into src/data/
python scripts/fetch_nasa_data.py    # Fetch latest DONKI events from NASA API
python scripts/verify_vitastra.py    # Run scientific integrity verification suite
```

---

## Team & Attribution

**Team Name:** Zero Gravity Minds
**Team Leader:** Sadiya Islam Sujana
Developed for the **NASA International Space Apps Challenge 2026**.

| # | Member | Role |
|---|---|---|
| 1 | **Sadiya Islam Sujana** | Team Leader |
| 2 | **MD. Nahidur Rahman Khan Nishat** | Software Developer & Researcher |
| 3 | **Ibrahim Bin Sultan** | Developer |
| 4 | **Jayed Alam** | Video Editor & Motion Designer |
| 5 | **Md Solayman Hossain Shawon** | Security Researcher |
| 6 | **Nafisa Tabassum Nusrat** | Developer |

---

## NASA Resources & References

| Resource | URL |
|---|---|
| NASA Five Hazards of Human Spaceflight | https://www.nasa.gov/hrp/hazards/ |
| NASA Human Research Program | https://www.nasa.gov/hrp/ |
| NASA OSDR Open Science Data Repository | https://osdr.nasa.gov/ |
| NASA DONKI Space Weather API | https://api.nasa.gov/ |
| Inspiration4 OSD-569 (CBC) | https://osdr.nasa.gov/bio/repo/data/studies/OSD-569 |
| Inspiration4 OSD-575 (CMP & Cytokines) | https://osdr.nasa.gov/bio/repo/data/studies/OSD-575 |
| NASA Immune Biomarkers / Artemis II | https://www.nasa.gov/reference/immune-biomarkers/ |
| NASA Bone & Muscle Countermeasures | https://www.nasa.gov/reference/risk-of-spaceflight-induced-bone-changes/ |
| Neural Organoids ISS Study (PMC11631337) | https://pmc.ncbi.nlm.nih.gov/articles/PMC11631337/ |
| NASA RadLab Radiation Data | https://visualization.osdr.nasa.gov/ |

---

<div align="center">

**VITASTRA · Zero Gravity Minds · NASA Space Apps Challenge 2026**

*Built with real NASA data. Offline-first. Decision support, never diagnosis.*

</div>
