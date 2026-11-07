<div align="center">

# VITASTRA
### Astronaut Health Intelligence Platform
**Real NASA-Data-Driven · Offline-First · Delay-Aware Triage · Evidence-Based Surveillance**

NASA International Space Apps Challenge 2026 · Team: **Zero Gravity Minds**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-View%20App-6366f1?style=for-the-badge&logo=vercel)](https://github.com/nishatkh/VITASTRA)
[![Tech Stack](https://img.shields.io/badge/React%2019-TypeScript-3178c6?style=for-the-badge&logo=typescript)](https://github.com/nishatkh/VITASTRA)
[![PWA](https://img.shields.io/badge/PWA-Offline%20Ready-22c55e?style=for-the-badge&logo=googlechrome)](https://github.com/nishatkh/VITASTRA)
[![NASA OSDR](https://img.shields.io/badge/NASA%20OSDR-OSD--569%20%7C%20OSD--575-0b3d91?style=for-the-badge&logo=nasa)](https://osdr.nasa.gov/)

</div>

---

## What is VITASTRA?

**VITASTRA** is a mission-critical astronaut health intelligence and clinical decision-support platform designed for deep-space long-duration missions (Moon, Mars, L1/L2, and deep-space transits).

VITASTRA combines **real, verified NASA research data** (OSDR Inspiration4 OSD-569 whole-blood CBC and OSD-575 serum CMP & cytokines), **NASA Five-Hazard risk mapping**, **delay-aware medical reporting (SBAR)**, **saliva-based immune surveillance**, **bone & muscle countermeasure scoring**, **sensor data quality validation**, and an **evidence-grounded health coach** with offline-first PWA architecture.

> **Decision support, never diagnosis.** VITASTRA surfaces biological signals, tracks individual baselines, and recommends validated operational procedures — flight surgeons and astronauts decide.

---

## Core Capabilities & Feature Overview

| Feature Module | Technology & Source | Operational Scope |
|---|---|---|
| **Inspiration4 Research Intelligence** | NASA OSDR OSD-569 & OSD-575 | Interactive multi-panel dashboard (CBC, CMP, Cytokines) across all 4 civilian astronauts (C001–C004) across L-92 to R+194. |
| **NASA Five Hazards-to-Outcomes Map** | NASA HRP Architecture | Systems-biology graph connecting Radiation, Isolation, Distance, Altered Gravity, and Hostile Environments to 9 health domains. |
| **Silent Biological Risk Surveillance** | CUSUM & Multi-domain Checks | Scheduled surveillance tracking for vision (SANS), cognitive speed (PVT), balance sway, sleep efficiency, and viral shedding. |
| **Saliva-Based Immune Monitoring** | Artemis II Saliva Protocol | Complete 7-stage sample lifecycle (Scheduled → Collected → Stored at -80°C → Submitted → Processing → Result Received → Reviewed) tracking VZV, EBV, and cortisol. |
| **Bone & Muscle Protection Scorecard** | NASA HRP Countermeasures | Delivered vs planned mechanical load tracking (ARED, CEVIS, T2), hardware outage logging, and adherence scoring. |
| **Space Biology Research Library** | Peer-Reviewed NASA Studies | Filterable catalog of 8 space biology studies (iPSC neural organoids PMC11631337, cardiac tissue chips, kidney chips, lung chips). |
| **Evidence-Based Health Coach** | Grounded Rules Engine | Explains baseline shifts, identifies missing data, cites flight procedures (MED, SANS, ECLSS), and strictly refuses to fabricate medical advice. |
| **Delay-Aware Medical Reporting** | Structured NASA SBAR | Formal clinical handoff reporting (Situation, Background, Assessment, Recommendation) with 0–40 min light-delay transmission state machine. |
| **Radiation & Space Weather Monitor** | NASA DONKI & RadLab | Absorbed dose (mGy) to effective dose (mSv) conversion, Solar Superstorm flare catalog (GOES-16 X8.7), and gloved storm shelter checklist. |
| **Sensor & Data Quality Intelligence** | Plausibility Validation Engine | System-wide detection of missing values, sensor dropouts, implausible bounds, and stale readings. |
| **Personal Health Baseline** | Statistical Baseline Engine | Individualized baseline calculations (Mean, SD, Median, MAD, Z-scores) with strict N≥2 sufficiency requirements. |
| **Four-Level Alert Lifecycle** | NASA-STD-3001 Geometric Triage | Distinct geometric shapes (Circle, Diamond, Triangle, Octagon) with full lifecycle states (New, Acknowledged, Resolved, Dismissed). |

---

## Real NASA Data Integration Matrix

VITASTRA adheres strictly to **Rule 2: Zero data fabrication or simulated measurements presented as real telemetry**.

| NASA Dataset | Source / Accession | Total Records | Integration Status |
|---|---|---|---|
| **Inspiration4 Whole Blood (CBC)** | NASA OSDR OSD-569 | 553 records | **Fully Working (Normalized & Verified)** |
| **Inspiration4 Serum (CMP)** | NASA OSDR OSD-575 | 531 records | **Fully Working (Normalized & Verified)** |
| **Inspiration4 Multiplex Cytokines** | NASA OSDR OSD-575 | 1,988 records | **Fully Working (Normalized & Verified)** |
| **Inspiration4 Cardiovascular Markers** | NASA OSDR OSD-575 | 252 records | **Fully Working (Normalized & Verified)** |
| **NASA DONKI Space Weather** | `api.nasa.gov/DONKI` | Live API + Archive | **Working with Verified Solar Superstorm Archive Fallback** |
| **NASA RadLab Radiation Physics** | `visualization.osdr.nasa.gov` | Daily Dosimetry | **Fully Working (0.25–0.55 mGy/day LEO Baseline)** |
| **NASA ISS Environmental Telemetry** | NASA EDA / ECLSS | Continuous Telemetry | **Fully Working (CO2, Pressure, Temp, O2)** |

### Scientific Data Quality Rules
- **Outdated race-based eGFR equations** (`eGFR AFRICAN AMERICAN` and `eGFR NON-AFR. AMERICAN`) are strictly excluded from analysis calculations and documented in compliance with modern clinical nephrology consensus.
- **Sex-labeled analytes** (e.g. `HEMATOCRIT (FEMALE)`) are normalized to standard clinical nomenclature while preserving the original raw clinical string in `raw_analyte`.
- **Preflight baseline sufficiency:** A minimum of **two valid preflight observations** is required to compute standard deviations and postflight z-scores. Sparse measurements remain uncalculated rather than silently fabricated.
- **Missing values remain missing:** Unrecorded tests are never silently imputed or interpolated.

---

## Quick Start & Setup

### Prerequisites
- **Node.js**: v20+ (recommended v22+)
- **Python**: v3.10+ (for data ingestion and verification suite)

```bash
# 1. Clone repository
git clone https://github.com/nishatkh/VITASTRA.git
cd VITASTRA

# 2. Install dependencies
npm install

# 3. (Optional) Run the repeatable NASA data ingestion pipeline
python scripts/ingest_nasa_data.py

# 4. Run automated platform verification suite
python scripts/verify_vitastra.py

# 5. Start development server (http://localhost:8443 or dynamic port)
npm run dev

# 6. Build for production (includes PWA service worker generation)
npm run build
npm run preview
```

---

## Technical Architecture

```
VITASTRA/
├── src/
│   ├── api/                  # API layer, schemas (Zod), and query hooks
│   ├── components/           # UI primitives, Charts, AppFrame, Layout, WhyDrawer
│   ├── data/
│   │   ├── processed/        # Normalized Inspiration4 dataset, DONKI archive, Research library
│   │   └── raw/              # Preserved original submitted NASA CSV files
│   ├── modules/              # Health domain intelligence modules
│   │   ├── bone/             # Countermeasure scorecard & outage logger
│   │   ├── coach/            # Evidence-grounded health coach
│   │   ├── cognitive/        # PVT reaction test & balance sway
│   │   ├── environment/      # Cabin CO2, pressure, oxygen, temp
│   │   ├── hazards/          # NASA Five Hazards-to-Outcomes Map
│   │   ├── heart/            # Cardiovascular baseline & ECG line
│   │   ├── immune/           # Saliva sample lifecycle tracker
│   │   ├── mood/             # Private circadian & behavioral check-in
│   │   ├── radiation/        # RadLab dosimetry & DONKI solar storm monitor
│   │   ├── scheduler/        # Silent biological risk surveillance
│   │   ├── sensor/           # Data quality & plausibility tester
│   │   ├── triage/           # Delay-aware SBAR handoff reporting
│   │   ├── twin/             # Physiological expected vs actual twin
│   │   └── validation/       # 100-crew detector validation simulator
│   ├── screens/              # Top-level views (Inspiration4, ResearchLibrary, Baseline, Alerts, Sources...)
│   ├── services/
│   │   ├── baseline/         # Baseline engine (Mean, SD, Median, MAD, Z-score)
│   │   ├── data-validation/  # Sensor plausibility & quality validator
│   │   └── nasa/             # NASA DONKI live client & error handling
│   ├── store/                # Zustand state & IndexedDB offline persistence
│   └── styles/               # CSS tokens & Tailwind CSS v4
├── docs/
│   └── data-sources.md       # Comprehensive NASA dataset documentation
├── scripts/
│   ├── ingest_nasa_data.py   # Repeatable NASA OSDR ingestion pipeline
│   └── verify_vitastra.py    # Automated scientific integrity test suite
└── public/                   # PWA manifest, service worker, icons
```

---

## Responsive Viewport Validation

VITASTRA is validated for seamless usability across all responsive breakpoints:
- **Mobile Portrait (360px & 390px):** Optimized header with compact navigation, collapsible status strip, 2-column vitals grid, and touch-scrollable pill navigation.
- **Tablet (768px):** Adaptive multi-column grid, resized Recharts containers, and side-by-side assessment panels.
- **Laptop & Desktop (1024px, 1440px, 1920px):** High-density multi-pane mission control view with persistent astronaut strip, full SVG flow maps, and responsive data tables.

---

## Privacy & Security by Design

- **Offline-First Storage:** All astronaut check-ins, questionnaires, and baseline logs reside in local client-side storage (IndexedDB / LocalStorage) with zero unprompted data transmission.
- **Role-Based Privacy Tiers:** Three distinct access tiers (Private to Astronaut, Medical Officer Only, Mission Control) ensure psychological check-ins remain confidential.
- **Cryptographic Audit Chain:** Audit events are linked with cryptographic SHA-256 hashes (`lib/hash.ts`) to prevent silent log alteration.
- **Anonymized Research Data:** Inspiration4 research data strictly preserves anonymized IDs (`C001`–`C004`) without demographic re-identification.

---

## Scientific Limitations & Disclosures

1. **Not an Autonomous Diagnostic Tool:** VITASTRA provides clinical decision-support and surveillance. It identifies statistical deviations from personal baselines, not clinical disease.
2. **Inspiration4 Cohort Boundary:** The Inspiration4 study represents four healthy civilian crewmembers on a 3-day flight. Findings cannot be generalized as universal human spaceflight norms.
3. **Organoid Models vs Human Astronauts:** Research on 3D neural organoids (PMC11631337) and tissue chips provides valuable cellular insight, but does not prove clinical pathology in living crewmembers.
4. **Mechanical Load vs Bone Density:** Countermeasure logs record mechanical load delivered, not in vivo bone mineral density.

---

## Team & Attribution

**Team Name:** Zero Gravity Minds  
**Team Leader:** Sadiya Islam Sujana  
Developed for the **NASA International Space Apps Challenge 2026**.

| # | Member |
|---|--------|
| 1 | **Sadiya Islam Sujana** (Team Leader) |
| 2 | **MD. Nahidur Rahman Khan Nishat** |
| 3 | **Ibrahim Bin Sultan** |
| 4 | **Jayed Alam** |
| 5 | **Md Solayman Hossain Shawon** |
| 6 | **Nafisa Tabassum Nusrat** |
