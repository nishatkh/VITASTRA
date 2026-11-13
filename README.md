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
[![License](https://img.shields.io/badge/License-NASA%20Exempt%20%7C%20Restricted-blue?style=for-the-badge)](LICENSE)

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

## 05. Data Used

*List each dataset with a link and one line on how we used it.*

### NASA Data
*Every NASA dataset we used. Judges check this against our demo.*

#### 1. Inspiration4 Complete Blood Count (CBC)
- **Dataset name:** NASA OSDR Study OSD-569: Inspiration4 Complete Blood Count (CBC)
- **Link:** https://osdr.nasa.gov/bio/repo/data/studies/OSD-569
- **How we used it:** We ingested longitudinal preflight (L-92, L-44, L-3) and postflight (R+1, R+45, R+82, R+194) hematology panels across all 4 crew members to calculate individual physiological baselines, standard deviations, and post-mission immune recovery trajectories.

#### 2. Inspiration4 Comprehensive Metabolic Panel (CMP)
- **Dataset name:** NASA OSDR Study OSD-575: Inspiration4 Comprehensive Metabolic Panel (CMP)
- **Link:** https://osdr.nasa.gov/bio/repo/data/studies/OSD-575
- **How we used it:** We ingested longitudinal blood serum chemistry (electrolytes, glucose, BUN, creatinine, liver enzymes) to track metabolic, renal, and liver function trends across mission phases.

#### 3. Inspiration4 Multiplex Serum Cytokines Panel
- **Dataset name:** NASA OSDR Study OSD-575: Inspiration4 Multiplex Serum Cytokines (EvePanel)
- **Link:** https://osdr.nasa.gov/bio/repo/data/studies/OSD-575
- **How we used it:** We extracted longitudinal cytokine and chemokine concentrations (IL-6, IL-8, TNF-alpha, IFN-gamma) to evaluate in-flight and post-flight immune activation and systemic inflammatory responses.

#### 4. Inspiration4 Cardiovascular Biomarkers Panel
- **Dataset name:** NASA OSDR Study OSD-575: Inspiration4 Cardiovascular Biomarkers
- **Link:** https://osdr.nasa.gov/bio/repo/data/studies/OSD-575
- **How we used it:** We integrated circulating cardiac biomarkers to monitor cardiovascular stress, microvascular remodeling, and microgravity fluid shift adaptations.

#### 5. NASA DONKI Space Weather Database
- **Dataset name:** NASA Space Weather Database Of Notifications, Knowledge, Information (DONKI) API & Flare Archive
- **Link:** https://api.nasa.gov/
- **How we used it:** We integrated real-time and historical solar flare (FLR), coronal mass ejection (CME), and solar particle event (SEP) feeds to trigger autonomous crew radiation alerts and storm shelter checklists.

#### 6. NASA RadLab Radiation Physics Dosimetry
- **Dataset name:** NASA OSDR RadLab Radiation Dosimetry Dataset
- **Link:** https://visualization.osdr.nasa.gov/
- **How we used it:** We analyzed International Space Station radiation physics data and daily absorbed dose rates to benchmark in-cabin ionizing radiation baselines and solar storm hazard thresholds.

#### 7. NASA Environmental Data Application (EDA) / ISS ECLSS Telemetry
- **Dataset name:** NASA OSDR Environmental Data Application (EDA) & ISS Life Support Telemetry
- **Link:** https://osdr.nasa.gov/
- **How we used it:** We modeled nominal and elevated cabin environmental metrics (ambient CO₂ in ppm, cabin pressure in kPa, O₂ partial pressure, temperature, and humidity) to drive the Closed Environment intelligence module.

#### 8. NASA Five Hazards of Human Spaceflight
- **Dataset name:** NASA Five Hazards of Human Spaceflight
- **Link:** https://www.nasa.gov/hrp/hazards/
- **How we used it:** We used this framework to structure the cross-hazard risk engine and connect spaceflight stressors (radiation, isolation, distance, microgravity, closed environment) to linked physiological health outcomes.

#### 9. NASA Human Research Program (HRP)
- **Dataset name:** NASA Human Research Program
- **Link:** https://www.nasa.gov/hrp/
- **How we used it:** We used HRP evidence books, human system risk matrices, and clinical research literature to formulate clinical decision support rules, alert thresholds, and mission countermeasure protocols.

#### 10. NASA OSDR Open Science Data Repository
- **Dataset name:** NASA OSDR Open Science Data Repository
- **Link:** https://osdr.nasa.gov/
- **How we used it:** We used the central NASA OSDR platform to discover, query, and download space omics, environmental telemetry, and astronaut biomedical research datasets.

#### 11. NASA OSDR Kidney-on-a-Chip Microgravity Study
- **Dataset name:** NASA OSDR Study OSD-44: Proximal Tubule Kidney-on-a-Chip Assessment
- **Link:** https://osdr.nasa.gov/bio/repo/data/studies/OSD-44
- **How we used it:** We referenced in the Space Biology Research Intelligence Library to understand proximal tubular transport, altered 1,25-dihydroxyvitamin D metabolism, and hypercalciuric stone risk.

#### 12. NASA OSDR Astronaut Gut Microbiome Metagenomics
- **Dataset name:** NASA OSDR Study OSD-630: Multi-omics Gut Microbiome Shifts in Spaceflight
- **Link:** https://osdr.nasa.gov/bio/repo/data/studies/OSD-630
- **How we used it:** We referenced in the research intelligence library to model spaceflight-induced microbiome depletion (*Faecalibacterium prausnitzii*) and intestinal tight-junction permeability shifts.

#### 13. NASA ISS Engineered Heart Tissue & Microphysiological Systems
- **Dataset name:** NASA ISS Research: Engineered Heart Tissue and Cardiac Microphysiological Systems
- **Link:** https://www.nasa.gov/missions/station/iss-research/its-always-heart-month-on-the-space-station/
- **How we used it:** We sourced functional contraction mechanics, calcium-handling kinetics, and myofibril disarray evidence for the cardiovascular research intelligence model.

#### 14. NASA JSC Immunology Laboratory Viral Shedding Cohort
- **Dataset name:** NASA Johnson Space Center Immunology Laboratory Longitudinal Data: Latent Herpesvirus Reactivation
- **Link:** https://www.nasa.gov/reference/risk-of-altered-immune-system-responses/
- **How we used it:** We utilized clinical rates of latent herpesvirus (EBV, VZV, CMV) shedding in saliva as sensitive non-invasive biomarkers of crew stress and T-cell dysfunction.

### Other Space Agency Data
*ESA, JAXA, CSA, ISRO and other partner agencies.*

#### 1. European Space Agency (ESA) Life Sciences & NASA HRP Joint Study
- **Dataset name:** European Space Agency (ESA) Life Sciences & NASA HRP Joint Muscle Countermeasure Studies
- **Link:** https://www.nasa.gov/humans-in-space/counteracting-bone-and-muscle-loss-in-microgravity/
- **How we used it:** We referenced long-duration astronaut muscle biopsy cohorts and countermeasure efficacy data (ARED resistive exercise and CEVIS cycle ergometry) to model muscle fiber-type transformation and post-landing functional readiness.

### Other Datasets
*Any other data source, library or API we drew on.*

#### 1. ISS Human 3D Neural Organoids Microfluidics Study (PMC11631337)
- **Dataset name:** Nature Communications / UCSD Sanford Stem Cell Institute / Axiom Space ISS Neural Organoids
- **Link:** https://pmc.ncbi.nlm.nih.gov/articles/PMC11631337/
- **How we used it:** We utilized peer-reviewed research on human 3D cortical neural organoids cultured on the ISS (CubeLab HSAPIENS payload launched aboard SpaceX CRS-19 & Axiom-2) to model microgravity-induced neurocellular stress, synaptic alterations, and tau phosphorylation.

#### 2. Human Lung Airway-Capillary Microfluidic Chip
- **Dataset name:** Harvard University Wyss Institute for Biologically Inspired Engineering / Nature Microgravity
- **Link:** https://www.nasa.gov/missions/station/iss-research/space-station-cell-studies/
- **How we used it:** We referenced human airway epithelial and endothelial organ-chip responses to elevated cabin CO₂ (4,000 ppm) and particulate simulant to model pulmonary mucosal defense compromises in closed habitats.

#### 3. 3D Engineered Heart Tissue (Biowire II) Microphysiological System
- **Dataset name:** Stanford Cardiovascular Institute / NIH NCATS Tissue Chips in Space
- **Link:** https://www.nasa.gov/missions/station/iss-research/its-always-heart-month-on-the-space-station/
- **How we used it:** We sourced cardiomyocyte twitch force reduction, calcium handling kinetics, and myofibril disarray evidence to inform our cardiovascular deconditioning intelligence model.

#### 4. Proximal Tubule Kidney-on-a-Chip Assessment
- **Dataset name:** University of Washington Kidney Research Institute / NIH NCATS
- **Link:** https://osdr.nasa.gov/bio/repo/data/studies/OSD-44
- **How we used it:** We referenced proximal tubule transport and vitamin D bio-activation data to model hypercalciuria and spaceflight nephrolithiasis risk.

#### 5. Clinical Laboratory Reference Standards
- **Dataset name:** Mayo Clinic Laboratories & Wintrobe Clinical Hematology Reference Standards
- **Link:** https://www.mayocliniclabs.com/
- **How we used it:** We incorporated established standard clinical laboratory reference intervals for routine blood, metabolic, and liver analytes to benchmark values alongside personalized astronaut baselines.

---

### Ingestion Summary & Records

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

## Quick Start & Reproduction

VITASTRA is engineered as a **100% Zero-Configuration, Offline-First Progressive Web App (PWA)**. All verified NASA OSDR Inspiration4 datasets, space weather archives, and research intelligence models are pre-bundled and pre-indexed in `src/data/`. **No API keys, environment files, or external services are needed to run or evaluate the full platform.**

### Prerequisites

| Tool | Version Requirement | Purpose |
|---|---|---|
| **Node.js** | v20+ (v22+ LTS recommended) | Runtime environment |
| **npm** | v10+ (bundled with Node) | Package manager |

### 3-Step Setup

```bash
# 1. Clone the repository
git clone https://github.com/nishatkh/VITASTRA.git
cd VITASTRA

# 2. Install dependencies
npm install

# 3. Start the application
npm run dev
```

Open your browser to **`http://localhost:8443`** to access the live mission control interface.

### Production Build & Offline PWA

```bash
# Build production bundle with offline PWA service worker
npm run build

# Preview production build locally
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
| **Zero External Network Dependencies** | 100% self-contained client execution with pre-indexed verified datasets; zero credentials or external telemetry leakage |

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

## Development & Verification Scripts

### Application Execution
```bash
npm run dev       # Start Vite development server (port 8443)
npm run build     # Production build with PWA service worker
npm run preview   # Preview production build locally
npm run format    # Format source files with oxfmt
```

### Automated Scientific Verification Suite
Evaluators can independently audit the scientific reproducibility and mathematical integrity of our normalized Inspiration4 datasets, preflight baselines, and hazard cross-links using the automated verification suite:

```bash
python scripts/verify_vitastra.py
```
> **Audit Coverage:** Runs 100% locally with zero external network dependencies. Validates strict $N \ge 2$ baseline rules, Bessel's sample correction, race-free eGFR exclusions, and confirms exact numerical benchmark matches against official NASA OSDR submitted files.

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

## License

This project is licensed under a **Custom Restricted License with NASA Exemption**:
- **NASA Permitted Use:** Unrestricted, royalty-free, perpetual authorization is granted to the **National Aeronautics and Space Administration (NASA)** and its associated programs to use, modify, deploy, and distribute the software for mission, scientific, operational, and research purposes without copyright restrictions.
- **Other Parties:** All rights reserved. Any use, copying, modification, or distribution by other organizations or third parties requires prior explicit written permission from the authors (**Zero Gravity Minds**).

See the [LICENSE](LICENSE) file for complete legal terms.

---

## Use of AI *

*Every AI tool we used, what we used it for, and the data it worked on.*

### Summary Table

| AI Tool / Framework | What We Used It For | Data It Worked On |
|---|---|---|
| **Google Gemini (Gemini 2.5 Pro & Flash)** *(via Antigravity Assistant)* | Architectural design, full-stack React 19/TypeScript scaffolding, refactoring complex multi-panel state, responsive layout engineering, and formulating the automated verification test suite (`scripts/verify_vitastra.py`). | Application source code (`src/`), data parsing scripts (`scripts/`), and JSON schemas. **Zero real astronaut health data or personal medical records were processed by external models.** |
| **Anthropic Claude 3.5 Sonnet** *(via Antigravity Assistant)* | Algorithmic optimization for mathematical baseline models, Bessel's sample correction logic, WebGL shader performance tuning, and technical documentation synthesis. | Component code, mathematical algorithms, and public documentation. |
| **Statistical AI & Anomaly Detection Algorithms** *(In-App Engine)* | Continuous physiological surveillance using **CUSUM (Cumulative Sum Control Charts)**, **Robust Z-Score modeling (Median Absolute Deviation)**, and multi-hazard Bayesian risk correlation. | Bundled longitudinal NASA OSDR Inspiration4 vitals, daily telemetry streams, and personal baseline distributions. |
| **LLM-Assisted Research Literature Structuring** | Parsing, categorizing, and structuring complex scientific relationships from NASA Human Research Program (HRP) Evidence Books, NASA OSDR publications, and PMC papers into machine-readable JSON schemas (`hazards_map_data.json` & `space_biology_research.json`). | Publicly available peer-reviewed space biology papers and open NASA research reports. |
| **Deterministic Clinical Expert Engine** *(Zero-Hallucination Design)* | Autonomous clinical decision support for deep space: intentionally built as a **deterministic expert rules engine** citing NASA flight rules (MED, SANS, ECLSS) rather than unconstrained generative text to guarantee zero medical hallucinations. | Onboard IndexedDB baselines, telemetry bounds, and verified NASA flight operational procedures. |

---

### Detailed Breakdown of AI Utilization

#### 1. Software Engineering & Architecture Acceleration
We utilized **Google Gemini 2.5 Pro & Flash** alongside **Claude 3.5 Sonnet** within the Antigravity developer environment as pair programmers to:
- Generate type-safe Zod schemas and TypeScript interfaces for complex NASA OSDR panels (553 CBC records, 531 CMP records, 1,988 cytokine measurements).
- Build lightweight, high-performance custom WebGL shaders (`src/components/ui/WebGLBackground.tsx`) for a liquid-glass mission control interface without heavy 3D engine overhead.
- Develop the automated scientific integrity test suite (`scripts/verify_vitastra.py`) that programmatically verifies baseline calculations against official NASA submitted datasets.

#### 2. Space Biology Knowledge Engineering & Ontology Formulation
Translating narrative clinical research into structured decision logic is a major bottleneck in aerospace medicine. We utilized LLMs to:
- Synthesize evidence classifications (Established Evidence, Emerging Research, Experimental Evidence) from NASA Human Research Program Evidence Books and NASA OSDR research.
- Map the interconnected pathways between the **5 Hazards of Human Spaceflight** (Radiation, Isolation, Distance, Microgravity, Closed Environment) and 9 physiological organ domains into a queryable graph.
- All AI-structured clinical rules and literature cross-references were manually audited and verified against original NASA source documentation.

#### 3. Onboard Machine Learning & Statistical Anomaly Detection
VITASTRA embeds statistical machine learning and anomaly detection algorithms directly into the client runtime:
- **CUSUM (Cumulative Sum Control Charts):** Tracks cumulative deviations from personal baselines to catch gradual, subclinical physiological drift (e.g. resting heart rate elevation, HRV depression) before acute symptoms manifest.
- **Robust Z-Score Estimation:** Uses median and Median Absolute Deviation (MAD) alongside Bessel's corrected standard deviation ($N \ge 2$ preflight threshold) to prevent outliers from distorting clinical baselines.
- **Sensor Plausibility Validation:** Algorithmic verification of incoming biometric telemetry against physiological limits to instantly detect sensor dropouts, lead detachments, and implausible readings.

#### 4. Medical AI Safety & "Zero-Hallucination" Architecture
In deep-space long-duration missions (with up to 40-minute round-trip comms latency), **astronaut life safety depends on deterministic certainty**. Unconstrained generative AI models are prone to probabilistic hallucination, making them hazardous for autonomous clinical diagnosis:
- **Rule-Grounded Decision Support:** Our in-app "Health Coach" and SBAR triage assistant are deliberately architected as **deterministic expert rules engines**. Recommendations strictly cite NASA Flight Rules, Spaceflight Clinical Standards (NASA-STD-3001), and standard flight medical procedures (MED, SANS, ECLSS).
- **Clear Clinical Translation Boundaries:** The engine explicitly flags experimental evidence (e.g., in vitro organoid microchips) and clearly discloses that cellular stress markers do not equate to proven pathology in living astronauts.
- **Decision Support, Never Diagnosis:** VITASTRA calculates statistical shifts and suggests validated operational procedures — the flight surgeon and crew always maintain final clinical authority.

#### 5. Data Privacy & AI Governance
- **Zero Data Leakage:** All baseline calculations, symptom logs, psychological check-ins, and medical reports run **100% client-side in IndexedDB**.
- **No External Inference on Astronaut Data:** No astronaut physiological measurements or mission records are ever transmitted to external AI APIs or third-party cloud models.

---

## References *

*Every source, paper, dataset, library and asset we drew on, with links where available.*

### 1. NASA Datasets & Technical Publications
- **NASA OSDR Study OSD-569 (Inspiration4 Complete Blood Count):** [https://osdr.nasa.gov/bio/repo/data/studies/OSD-569](https://osdr.nasa.gov/bio/repo/data/studies/OSD-569)
- **NASA OSDR Study OSD-575 (Inspiration4 CMP, Cytokines, Cardiovascular Panels):** [https://osdr.nasa.gov/bio/repo/data/studies/OSD-575](https://osdr.nasa.gov/bio/repo/data/studies/OSD-575)
- **NASA DONKI Space Weather Database & API:** [https://api.nasa.gov/](https://api.nasa.gov/) · Direct catalog: [https://kauai.ccmc.gsfc.nasa.gov/DONKI/](https://kauai.ccmc.gsfc.nasa.gov/DONKI/)
- **NASA RadLab Radiation Physics Dosimetry Portal:** [https://visualization.osdr.nasa.gov/](https://visualization.osdr.nasa.gov/)
- **NASA OSDR Open Science Data Repository:** [https://osdr.nasa.gov/](https://osdr.nasa.gov/)
- **NASA Five Hazards of Human Spaceflight:** [https://www.nasa.gov/hrp/hazards/](https://www.nasa.gov/hrp/hazards/)
- **NASA Human Research Program (HRP) Evidence Books:** [https://www.nasa.gov/hrp/](https://www.nasa.gov/hrp/)
- **NASA Spaceflight Human-System Standard (NASA-STD-3001, Vol 1 & 2):** [https://www.nasa.gov/hrp/standards/](https://www.nasa.gov/hrp/standards/)
- **NASA Immune Biomarkers & Artemis II Saliva Protocol:** [https://www.nasa.gov/reference/immune-biomarkers/](https://www.nasa.gov/reference/immune-biomarkers/)
- **NASA Bone & Muscle Countermeasures Evidence:** [https://www.nasa.gov/reference/risk-of-spaceflight-induced-bone-changes/](https://www.nasa.gov/reference/risk-of-spaceflight-induced-bone-changes/)
- **NASA Risk of Altered Immune System Responses:** [https://www.nasa.gov/reference/risk-of-altered-immune-system-responses/](https://www.nasa.gov/reference/risk-of-altered-immune-system-responses/)
- **NASA OSDR Study OSD-44 (Proximal Tubule Kidney Chip in Microgravity):** [https://osdr.nasa.gov/bio/repo/data/studies/OSD-44](https://osdr.nasa.gov/bio/repo/data/studies/OSD-44)
- **NASA OSDR Study OSD-630 (Astronaut Gut Microbiome Metagenomics):** [https://osdr.nasa.gov/bio/repo/data/studies/OSD-630](https://osdr.nasa.gov/bio/repo/data/studies/OSD-630)
- **NASA ISS Engineered Heart Tissue & Cardiac Microphysiological Systems:** [https://www.nasa.gov/missions/station/iss-research/its-always-heart-month-on-the-space-station/](https://www.nasa.gov/missions/station/iss-research/its-always-heart-month-on-the-space-station/)

### 2. Partner Space Agency & Academic Research
- **European Space Agency (ESA) Life Sciences & NASA Joint Muscle Countermeasures:** [https://www.nasa.gov/humans-in-space/counteracting-bone-and-muscle-loss-in-microgravity/](https://www.nasa.gov/humans-in-space/counteracting-bone-and-muscle-loss-in-microgravity/)
- **ISS Human 3D Neural Organoids (Nature Communications / PMC11631337):** [https://pmc.ncbi.nlm.nih.gov/articles/PMC11631337/](https://pmc.ncbi.nlm.nih.gov/articles/PMC11631337/)
- **Airway Epithelial Response & Closed Environment Lung Chip (Harvard Wyss Institute / Nature Microgravity):** [https://www.nasa.gov/missions/station/iss-research/space-station-cell-studies/](https://www.nasa.gov/missions/station/iss-research/space-station-cell-studies/)
- **National Kidney Foundation & American Society of Nephrology (Race-Free eGFR Consensus Guidelines):** [https://www.kidney.org/professionals/kdoqi/gfr_calculator](https://www.kidney.org/professionals/kdoqi/gfr_calculator)
- **Clinical Laboratory Reference Intervals (Mayo Clinic Laboratories / Wintrobe Clinical Hematology):** [https://www.mayocliniclabs.com/](https://www.mayocliniclabs.com/)

### 3. Software Libraries & Open Source Frameworks
- **React 19 & React DOM 19:** [https://react.dev/](https://react.dev/)
- **TypeScript 5.7:** [https://www.typescriptlang.org/](https://www.typescriptlang.org/)
- **Vite 8 & Rolldown:** [https://vite.dev/](https://vite.dev/)
- **Tailwind CSS v4:** [https://tailwindcss.com/](https://tailwindcss.com/)
- **React Router v8:** [https://reactrouter.com/](https://reactrouter.com/)
- **TanStack React Query v5:** [https://tanstack.com/query/](https://tanstack.com/query/)
- **Zustand v5:** [https://zustand-demo.pmnd.rs/](https://zustand-demo.pmnd.rs/)
- **Recharts v3:** [https://recharts.org/](https://recharts.org/)
- **Framer Motion v13:** [https://motion.dev/](https://motion.dev/)
- **idb (IndexedDB):** [https://github.com/jakearchibald/idb](https://github.com/jakearchibald/idb)
- **Lucide React Icons:** [https://lucide.dev/](https://lucide.dev/)
- **Zod v4:** [https://zod.dev/](https://zod.dev/)
- **Vite PWA Plugin & Workbox:** [https://vite-pwa-org.netlify.app/](https://vite-pwa-org.netlify.app/)
- **Oxfmt Formatter:** [https://oxc.rs/](https://oxc.rs/)

### 4. Typography & Visual Assets
- **Google Fonts (Outfit, Inter Tight, Doto):** [https://fonts.google.com/](https://fonts.google.com/)
- **NASA Space Mission Graphic Standards & Insignia:** [https://www.nasa.gov/](https://www.nasa.gov/)

---

<div align="center">

**VITASTRA · Zero Gravity Minds · NASA Space Apps Challenge 2026**

*Built with real NASA data. Offline-first. Decision support, never diagnosis.*

</div>
