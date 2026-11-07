# NASA Data Sources & Reusable Architecture Documentation
### VITASTRA — Astronaut Health Intelligence Platform

This document details the real NASA datasets integrated into **VITASTRA**, their retrieval and normalization pipelines, handling of documented data-quality nuances, and scientific limitations.

---

## 1. Summary of Integrated NASA Datasets

| Dataset Name | Organization | Study ID | Original Filename | Variables / Panels | Status |
|---|---|---|---|---|---|
| **SpaceX Inspiration4 Whole Blood (CBC)** | NASA OSDR | OSD-569 | `LSDS-7_Complete_Blood_Count_CBC.upload_SUBMITTED.csv` | WBC, RBC, HGB, HCT, MCV, MCH, MCHC, Platelets | **Fully Integrated (553 records)** |
| **Inspiration4 Blood Serum (CMP)** | NASA OSDR | OSD-575 | `LSDS-8_Comprehensive_Metabolic_Panel_CMP.upload_SUBMITTED.csv` | Glucose, BUN, Creatinine, Electrolytes, Liver enzymes | **Fully Integrated (531 records)** |
| **Inspiration4 Multiplex Immune Cytokines** | NASA OSDR | OSD-575 | `LSDS-8_Multiplex_serum.immune.EvePanel_SUBMITTED.csv` | 50+ Cytokines, Chemokines, Growth factors (Eve Technologies) | **Fully Integrated (1,988 records)** |
| **Inspiration4 Cardiovascular Biomarkers** | NASA OSDR | OSD-575 | `LSDS-8_Multiplex_serum.cardiovascular.EvePanel_SUBMITTED.csv` | Cardiovascular inflammatory markers (a-2 Macroglobulin, etc.) | **Fully Integrated (252 records)** |
| **Space Weather Database (DONKI)** | NASA GSFC / SRAG | API | `https://api.nasa.gov/DONKI/` | Solar Flares (FLR), CMEs, Geomagnetic Storms (GST) | **Active API + Verified May 2024 Archive** |
| **Space Radiation Physics (RadLab)** | NASA OSDR | RadLab | `visualization.osdr.nasa.gov/radlab` | Absorbed dose rate (mGy/day), Liulin-5 & REM telemetry | **Fully Integrated (0.25–0.55 mGy/day LEO baseline)** |
| **Environmental Data Application (EDA)** | NASA OSDR | EDA | `osdr.nasa.gov/bio/repo/data/studies/OSD-44` | Cabin CO2 (ppm), Cabin Pressure (kPa), Temperature (°C), O2 (%) | **Fully Integrated** |
| **Space Biology Research Intelligence** | NASA OSDR / ISS NL | Multi | PMC11631337, CubeLab HSAPIENS, Tissue Chips in Space | 3D Neural Organoids, Cardiac tissue chips, Kidney chips, Lung chips | **Fully Integrated (8 Peer-Reviewed Studies)** |

---

## 2. NASA OSDR Inspiration4 (OSD-569 & OSD-575) Pipeline

### 2.1 Anonymized Research Participants & Mission Timepoints
- **Subjects:** `C001`, `C002`, `C003`, `C004` (Four civilian crewmembers).
- **Mission Duration:** Approximately 3 days (~71 hours, 575 km orbital apogee).
- **Documented Timepoints:**
  - `L-92`: 92 days prior to launch (Baseline 1)
  - `L-44`: 44 days prior to launch (Baseline 2)
  - `L-3`: 3 days prior to launch (Baseline 3)
  - `R+1`: 1 day post-splashdown (Mission Day +4)
  - `R+45`: 45 days post-splashdown (Mission Day +48)
  - `R+82`: 82 days post-splashdown (Mission Day +85)
  - `R+194`: 194 days post-splashdown (Mission Day +197)

### 2.2 Data Ingestion & Quality Handling Rules
1. **Preservation of Raw Files:** Original submitted CSV files are preserved intact in `data/raw/` and `src/data/raw/`.
2. **Exclusion of Outdated Race-Based eGFR:** Rows containing `eGFR AFRICAN AMERICAN` and `eGFR NON-AFR. AMERICAN` are strictly excluded from statistical calculations and marked with `data_quality_status: "excluded_outdated_race_egfr"` in accordance with contemporary clinical nephrology consensus.
3. **Sex-Labeled Analytes:** Markers with gender suffixes (e.g., `HEMATOCRIT (FEMALE)`) are normalized to `HEMATOCRIT` for cross-cohort analysis while retaining the exact original clinical label in `raw_analyte`. The `SEX` column is omitted from patient-facing screens to protect participant privacy.
4. **Preflight Baseline Sufficiency:** Standard deviation and z-score calculations strictly require **at least 2 valid preflight observations** (`L-92`, `L-44`, `L-3`). If fewer than 2 observations exist, `baseline_status` is marked as `insufficient_preflight_data` and no z-score is calculated.
5. **Missing Values:** Missing laboratory tests (e.g., sparse `BUN/CREATININE RATIO` marked `NA` or `(calc)`) remain unrecorded; **no values are interpolated, fabricated, or silently imputed**.
6. **Preflight Baseline vs Lab Ranges:** Individual preflight baselines (personal mean ± standard deviation) are used for longitudinal personal change detection. Changing external commercial reference ranges between timepoints are not treated as personalized baselines.

### 2.3 Benchmark Verification
The repeatable ingestion script (`scripts/ingest_nasa_data.py`) verifies exact values against NASA OSDR submitted files:
- **C001 WBC at L-92:** Exactly `5.4 Thousand/uL` (Matched).
- **C001 Glucose at L-92:** Exactly `83 mg/dL` (Matched).

---

## 3. NASA DONKI Space Weather Integration

- **Endpoint:** `https://api.nasa.gov/DONKI/FLR` (Solar Flares)
- **Live Connector:** `src/services/nasa/donkiService.ts` queries the live endpoint with timeout and status handling.
- **Verified Offline Archive:** Real event telemetry from the historic **May 2024 Solar Superstorm (Active Region 3664)**, including the **X8.7 flare (largest of Solar Cycle 25)**, X5.8, X3.9, and X2.2 flares, CME velocity models, and G5 Extreme geomagnetic storm records.
- **Scientific Disclosure:** A solar flare or CME notification indicates space weather activity, **not a measured individual astronaut radiation dose**.

---

## 4. Space Radiation Dosimetry (RadLab)

- **Source:** NASA OSDR RadLab physics database.
- **Detector Telemetry:** ISS Liulin-5 and Radiation Environment Monitor (REM) LEO orbit dosimetry.
- **Absorbed Dose Rate:** ~0.25 to 0.55 mGy/day average in low Earth orbit.
- **Quality Factor:** Conversion to biological effective dose equivalent (mSv) utilizes an assumed quality factor $Q = 2.0$, representing biological damage across high-LET heavy ions and trapped protons.
- **Career Threshold:** 600 mSv career limit under NASA Standard STD-3001.

---

## 5. Space Biology Research Intelligence Library

The library in `src/screens/ResearchLibrary.tsx` integrates 8 peer-reviewed space biology studies:
1. **Neural Organoids on ISS:** CubeLab HSAPIENS (PMC11631337) — Human iPSC-derived 3D cortical organoids.
2. **Engineered Heart Tissue:** NASA Tissue Chips in Space / Stanford Cardiovascular Institute.
3. **Astronaut Immune Dysregulation:** NASA JSC Immunology Artemis II & ISS saliva studies (Crucian et al.).
4. **Bone Demineralization & ARED:** NASA Human Research Program Bone Laboratory (Sibonga et al.).
5. **Proximal Tubule Kidney-on-a-Chip:** NASA / NCATS / University of Washington Kidney Research Institute.
6. **Airway Lung Chip in Closed Environments:** NASA Space Biology / Wyss Institute.
7. **Gut-Immune Axis & Enteroids:** NASA Space Biology / Stanford / OSD-630.
8. **Skeletal Muscle Atrophy Countermeasures:** NASA HRP / ESA muscle biopsy cohorts.

**Clinical Translation Boundary:** In vitro organoid and tissue-chip models provide vital cellular mechanisms, but **are never presented as proof of human clinical pathology without in vivo astronaut validation**.

---

## 6. How to Re-Run Data Ingestion

```bash
# Ingest official NASA OSDR OSD-569 and OSD-575 files and build normalized dataset
python scripts/ingest_nasa_data.py
```
Outputs are generated in:
- `data/raw/` & `src/data/raw/`
- `data/processed/inspiration4_normalized.json`
- `data/processed/dataset_metadata.json`

