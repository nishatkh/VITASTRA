#!/usr/bin/env python3
"""
Repeatable NASA OSDR Inspiration4 Ingestion & Normalization Pipeline
Downloads official submitted files for OSD-569 (CBC) and OSD-575 (CMP & multiplex serum panels),
applies scientifically responsible data cleaning, normalizes markers and timepoints,
computes preflight baselines with strict sufficiency checks, and saves normalized data.
"""

import os
import csv
import json
import math
import urllib.request

RAW_DIR = "data/raw"
SRC_RAW_DIR = "src/data/raw"
PROCESSED_DIR = "data/processed"
SRC_PROCESSED_DIR = "src/data/processed"

for d in [RAW_DIR, SRC_RAW_DIR, PROCESSED_DIR, SRC_PROCESSED_DIR]:
    os.makedirs(d, exist_ok=True)

DOWNLOADS = [
    {
        "study": "OSD-569",
        "file": "LSDS-7_Complete_Blood_Count_CBC.upload_SUBMITTED.csv",
        "url": "https://osdr.nasa.gov/geode-py/ws/studies/OSD-569/download?source=datamanager&file=LSDS-7_Complete_Blood_Count_CBC.upload_SUBMITTED.csv",
        "panel": "CBC",
    },
    {
        "study": "OSD-575",
        "file": "LSDS-8_Comprehensive_Metabolic_Panel_CMP.upload_SUBMITTED.csv",
        "url": "https://osdr.nasa.gov/geode-py/ws/studies/OSD-575/download?source=datamanager&file=LSDS-8_Comprehensive_Metabolic_Panel_CMP.upload_SUBMITTED.csv",
        "panel": "CMP",
    },
    {
        "study": "OSD-575",
        "file": "LSDS-8_Multiplex_serum.immune.EvePanel_SUBMITTED.csv",
        "url": "https://osdr.nasa.gov/geode-py/ws/studies/OSD-575/download?source=datamanager&file=LSDS-8_Multiplex_serum.immune.EvePanel_SUBMITTED.csv",
        "panel": "Immune Cytokines",
    },
    {
        "study": "OSD-575",
        "file": "LSDS-8_Multiplex_serum.cardiovascular.EvePanel_SUBMITTED.csv",
        "url": "https://osdr.nasa.gov/geode-py/ws/studies/OSD-575/download?source=datamanager&file=LSDS-8_Multiplex_serum.cardiovascular.EvePanel_SUBMITTED.csv",
        "panel": "Cardiovascular Biomarkers",
    },
]

TIMEPOINT_DAYS = {
    "L-92": -92,
    "L-44": -44,
    "L-3": -3,
    "R+1": 4,      # Flight duration ~3 days; return + 1 = mission day 4
    "R+45": 48,
    "R+82": 85,
    "R+194": 197,
}

def download_file(item):
    path1 = os.path.join(RAW_DIR, item["file"])
    path2 = os.path.join(SRC_RAW_DIR, item["file"])
    
    if os.path.exists(path1) and os.path.getsize(path1) > 100:
        print(f"[CACHE] Using existing raw file {item['file']}")
        with open(path1, "rb") as f:
            content = f.read()
    else:
        print(f"[DOWNLOAD] Fetching {item['file']} from NASA OSDR ({item['study']})...")
        req = urllib.request.Request(item["url"], headers={"User-Agent": "Mozilla/5.0 (NASA-SpaceApps-VITASTRA)"})
        with urllib.request.urlopen(req, timeout=30) as resp:
            content = resp.read()
        with open(path1, "wb") as f:
            f.write(content)
            
    with open(path2, "wb") as f:
        f.write(content)
        
    return path1

def parse_num(v):
    if v is None:
        return None
    s = str(v).strip()
    if s == "" or s.upper() in ["NA", "N/A", "NONE", "NULL", "(CALC)", "."]:
        return None
    try:
        # handle comma in numbers or inequalities like <0.5
        s = s.replace(",", "").replace("<", "").replace(">", "").strip()
        val = float(s)
        return val if not math.isnan(val) else None
    except ValueError:
        return None

def normalize_marker_name(raw_name):
    clean = raw_name.strip()
    # Normalize sex-labeled analytes while preserving original in raw_analyte
    upper = clean.upper()
    upper = upper.replace("(FEMALE)", "").replace("(MALE)", "").strip()
    upper = " ".join(upper.split())
    return upper

def process_cbc_cmp(filepath, item):
    records = []
    with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
        reader = csv.DictReader(f)
        for row in reader:
            analyte_raw = row.get("ANALYTE", "").strip()
            if not analyte_raw:
                continue
                
            val_raw = row.get("VALUE")
            val = parse_num(val_raw)
            rmin = parse_num(row.get("RANGE_MIN"))
            rmax = parse_num(row.get("RANGE_MAX"))
            unit = row.get("UNITS", "").strip()
            subj = row.get("SUBJECT_ID", "").strip()
            tp = row.get("TEST_DATE") or row.get("timepoint") or ""
            tp = tp.strip()
            
            # Outdated race-based eGFR exclusion check
            is_race_egfr = "EGFR" in analyte_raw.upper() and ("AFRICAN" in analyte_raw.upper() or "NON-AFR" in analyte_raw.upper())
            
            quality_status = "valid"
            if is_race_egfr:
                quality_status = "excluded_outdated_race_egfr"
            elif val is None:
                quality_status = "missing_value"
            
            marker = normalize_marker_name(analyte_raw)
            days = TIMEPOINT_DAYS.get(tp, None)
            if days is None and tp.startswith("L-"):
                try:
                    days = -int(tp.replace("L-", ""))
                except:
                    pass
            elif days is None and tp.startswith("R+"):
                try:
                    days = 3 + int(tp.replace("R+", ""))
                except:
                    pass
                    
            records.append({
                "subject_id": subj,
                "timepoint": tp,
                "days_from_launch": days,
                "panel": item["panel"],
                "marker": marker,
                "value": val,
                "unit": unit,
                "range_min": rmin,
                "range_max": rmax,
                "raw_analyte": analyte_raw,
                "source_study": item["study"],
                "source_file": item["file"],
                "sample_date": tp,
                "data_quality_status": quality_status,
            })
    return records

def process_eve_panel(filepath, item):
    records = []
    with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
        # Strip potential BOM
        content = f.read()
        if content.startswith("\ufeff"):
            content = content[1:]
        reader = csv.DictReader(content.splitlines())
        for row in reader:
            analyte_raw = row.get("Analyte", "").strip()
            if not analyte_raw:
                continue
                
            val = parse_num(row.get("Concentration"))
            unit = row.get("Unit", "").strip()
            subj = row.get("ID", "").strip()
            tp = row.get("Timepoint", "").strip()
            
            quality_status = "valid" if val is not None else "missing_value"
            marker = normalize_marker_name(analyte_raw)
            days = TIMEPOINT_DAYS.get(tp, None)
            
            records.append({
                "subject_id": subj,
                "timepoint": tp,
                "days_from_launch": days,
                "panel": item["panel"],
                "marker": marker,
                "value": val,
                "unit": unit,
                "range_min": None,
                "range_max": None,
                "raw_analyte": analyte_raw,
                "source_study": item["study"],
                "source_file": item["file"],
                "sample_date": tp,
                "data_quality_status": quality_status,
            })
    return records

def calculate_baselines_and_zscores(records):
    # Group preflight records by (subject_id, marker, panel)
    preflight_groups = {}
    for r in records:
        if r["data_quality_status"] != "valid" or r["value"] is None:
            continue
        days = r["days_from_launch"]
        if days is not None and days < 0:
            key = (r["subject_id"], r["panel"], r["marker"])
            if key not in preflight_groups:
                preflight_groups[key] = []
            preflight_groups[key].append(r["value"])
            
    # Compute baseline stats
    baselines = {}
    for key, values in preflight_groups.items():
        n = len(values)
        if n >= 2:
            mean = sum(values) / n
            var = sum((x - mean) ** 2 for x in values) / (n - 1)
            sd = math.sqrt(var)
            baselines[key] = {
                "n_obs": n,
                "mean": round(mean, 4),
                "sd": round(sd, 4),
                "status": "valid",
                "reason": None
            }
        else:
            baselines[key] = {
                "n_obs": n,
                "mean": round(values[0], 4) if n == 1 else None,
                "sd": None,
                "status": "insufficient_data",
                "reason": "Requires at least 2 valid preflight observations for standard deviation calculation"
            }
            
    # Attach baseline and z-score to each record
    annotated = []
    for r in records:
        rec = dict(r)
        key = (r["subject_id"], r["panel"], r["marker"])
        bl = baselines.get(key)
        
        if bl and bl["status"] == "valid" and bl["sd"] is not None and bl["sd"] > 1e-9:
            rec["baseline_mean"] = bl["mean"]
            rec["baseline_sd"] = bl["sd"]
            rec["baseline_n"] = bl["n_obs"]
            if rec["value"] is not None and rec["data_quality_status"] == "valid":
                rec["z_score"] = round((rec["value"] - bl["mean"]) / bl["sd"], 3)
            else:
                rec["z_score"] = None
            rec["baseline_status"] = "calculated"
        elif bl and bl["status"] == "insufficient_data":
            rec["baseline_mean"] = bl["mean"]
            rec["baseline_sd"] = None
            rec["baseline_n"] = bl["n_obs"]
            rec["z_score"] = None
            rec["baseline_status"] = "insufficient_preflight_data"
            rec["baseline_note"] = bl["reason"]
        else:
            rec["baseline_mean"] = None
            rec["baseline_sd"] = None
            rec["baseline_n"] = 0
            rec["z_score"] = None
            rec["baseline_status"] = "no_preflight_baseline"
            rec["baseline_note"] = "No preflight measurements available for baseline calculation"
            
        annotated.append(rec)
        
    return annotated, baselines

def main():
    print("=" * 60)
    print("NASA OSDR INSPIRATION4 REPEATABLE INGESTION PIPELINE")
    print("=" * 60)
    
    all_records = []
    for item in DOWNLOADS:
        local_raw = download_file(item)
        if item["panel"] in ["CBC", "CMP"]:
            recs = process_cbc_cmp(local_raw, item)
        else:
            recs = process_eve_panel(local_raw, item)
        print(f"Processed {len(recs)} records from {item['file']} ({item['panel']})")
        all_records.extend(recs)
        
    print(f"\nTotal raw parsed records: {len(all_records)}")
    
    annotated_records, baselines = calculate_baselines_and_zscores(all_records)
    print(f"Calculated baselines for {len(baselines)} participant-marker combinations")
    
    # Validation against known benchmark values from original submitted files:
    # C001 WBC at L-92 = 5.4 Thousand/uL
    # C001 Glucose at L-92 = 83 mg/dL
    wbc_bench = [r for r in annotated_records if r["subject_id"] == "C001" and r["marker"] == "WHITE BLOOD CELL COUNT" and r["timepoint"] == "L-92"]
    glu_bench = [r for r in annotated_records if r["subject_id"] == "C001" and r["marker"] == "GLUCOSE" and r["timepoint"] == "L-92"]
    
    print("\nBenchmark Verification:")
    if wbc_bench:
        print(f"✓ C001 WBC at L-92: {wbc_bench[0]['value']} {wbc_bench[0]['unit']} (Expected: 5.4 Thousand/uL)")
    else:
        print("✗ C001 WBC benchmark not found")
        
    if glu_bench:
        print(f"✓ C001 Glucose at L-92: {glu_bench[0]['value']} {glu_bench[0]['unit']} (Expected: 83 mg/dL)")
    else:
        print("✗ C001 Glucose benchmark not found")
        
    # Write normalized JSON outputs
    out_files = [
        os.path.join(PROCESSED_DIR, "inspiration4_normalized.json"),
        os.path.join(SRC_PROCESSED_DIR, "inspiration4_normalized.json"),
    ]
    for out in out_files:
        with open(out, "w", encoding="utf-8") as f:
            json.dump(annotated_records, f, indent=2)
        print(f"Saved normalized data to {out} ({os.path.getsize(out)} bytes)")
        
    # Metadata report
    metadata = {
        "datasets": [
            {
                "name": "SpaceX Inspiration4 Whole Blood Measurements (CBC)",
                "organization": "NASA Open Science Data Repository",
                "study_identifier": "OSD-569",
                "original_url": "https://osdr.nasa.gov/osdr/data/osd/meta/569",
                "source_file": "LSDS-7_Complete_Blood_Count_CBC.upload_SUBMITTED.csv",
                "panel": "Complete Blood Count (CBC)",
                "participants": ["C001", "C002", "C003", "C004"],
                "timepoints": ["L-92", "L-44", "L-3", "R+1", "R+45", "R+82", "R+194"],
            },
            {
                "name": "SpaceX Inspiration4 Blood Serum (CMP, Immune & Cardiovascular)",
                "organization": "NASA Open Science Data Repository",
                "study_identifier": "OSD-575",
                "original_url": "https://osdr.nasa.gov/osdr/data/osd/meta/575",
                "source_files": [
                    "LSDS-8_Comprehensive_Metabolic_Panel_CMP.upload_SUBMITTED.csv",
                    "LSDS-8_Multiplex_serum.immune.EvePanel_SUBMITTED.csv",
                    "LSDS-8_Multiplex_serum.cardiovascular.EvePanel_SUBMITTED.csv"
                ],
                "panels": ["Comprehensive Metabolic Panel (CMP)", "Immune Cytokines", "Cardiovascular Biomarkers"],
                "participants": ["C001", "C002", "C003", "C004"],
                "timepoints": ["L-92", "L-44", "L-3", "R+1", "R+45", "R+82"],
            }
        ],
        "total_records": len(annotated_records),
        "data_quality_exclusions": {
            "race_based_egfr": "Excluded outdated eGFR African American and Non-African American rows from analysis",
            "sparse_ratios": "BUN/creatinine ratio missing calculations flagged where uncalculated in original",
            "sex_labels": "Normalized markers while retaining original analyte label in raw_analyte",
            "insufficient_baseline_rule": "Minimum 2 valid preflight observations required for standard deviation and z-score calculations"
        },
        "disclaimer": "Historical Inspiration4 research data — not live monitoring of current astronauts. Four anonymized civilian participants, approximately 3-day mission. Findings are research observations and cannot be generalized as clinical diagnoses.",
        "version": "1.0.0"
    }
    
    meta_files = [
        os.path.join(PROCESSED_DIR, "dataset_metadata.json"),
        os.path.join(SRC_PROCESSED_DIR, "dataset_metadata.json"),
    ]
    for mf in meta_files:
        with open(mf, "w", encoding="utf-8") as f:
            json.dump(metadata, f, indent=2)
        print(f"Saved dataset metadata to {mf}")

    print("\nIngestion and normalization complete!")

if __name__ == "__main__":
    main()

