import { useState } from "react"
import {
  Database,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Radio,
  FileText,
  HardDrive,
  RefreshCw,
} from "lucide-react"
import { Screen } from "../components/Layout"
import { Card, Title, SourceChip } from "../components/ui"
import datasetMeta from "../data/processed/dataset_metadata.json"

export default function Sources() {
  const [pipelineRunning, setPipelineRunning] = useState(false)
  const [pipelineStatus, setPipelineStatus] = useState<string | null>(null)

  const meta = datasetMeta as any

  return (
    <Screen>
      <div className="col-span-full">
        <Title a="NASA Data" b="Sources & Architecture" />
      </div>

      {/* Main Philosophy Card */}
      <Card className="col-span-full p-5 space-y-3">
        <div className="flex items-center gap-2.5 font-semibold text-[17px] text-ink">
          <ShieldCheck className="size-5 text-signal" />
          Strict Data Provenance: Real NASA Data, Zero Fabrication
        </div>
        <p className="text-[14.5px] leading-relaxed text-label">
          In strict compliance with VITASTRA development rules, every health measurement and environmental reading in this system is traceable to authoritative NASA open research, verified spaceflight repositories, or designated isolated test fixtures. <strong>No fake astronaut telemetry or simulated lab results are presented as real data.</strong>
        </p>
      </Card>

      {/* Ingested NASA Datasets */}
      <div className="col-span-full space-y-4">
        <h3 className="text-[20px] font-semibold text-ink">Connected NASA Datasets & Repositories</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* OSD-569 */}
          <div className="rounded-[28px] border border-border liquid-glass-clear p-5 shadow-xs space-y-3.5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="rounded-full bg-signal/15 px-3 py-0.5 text-[11.5px] font-semibold text-signal">
                  Fully Integrated · 553 Records
                </span>
                <h4 className="mt-1.5 text-[17px] font-semibold text-ink">
                  Inspiration4 Whole Blood (CBC)
                </h4>
                <div className="text-[12.5px] text-label font-mono">NASA OSDR Study: OSD-569</div>
              </div>
              <SourceChip kind="nasa" label="OSD-569" />
            </div>

            <p className="text-[13px] text-label leading-relaxed">
              Complete Blood Count (CBC) including White Blood Cells, Hemoglobin, Hematocrit, and Platelets across 4 anonymized participants (C001–C004) at timepoints L-92, L-44, L-3, R+1, R+45, R+82, and R+194.
            </p>

            <div className="rounded-xl liquid-glass-clear p-3 text-[12px] text-label space-y-1 font-mono">
              <div>Source File: LSDS-7_Complete_Blood_Count_CBC.upload_SUBMITTED.csv</div>
              <div>Benchmark Check: C001 WBC at L-92 = 5.4 Thousand/uL (Verified)</div>
            </div>

            <div className="pt-1">
              <a
                href="https://osdr.nasa.gov/osdr/data/osd/meta/569"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-[13px] font-medium text-accent hover:underline"
              >
                View on NASA OSDR
                <ExternalLink className="size-3.5" />
              </a>
            </div>
          </div>

          {/* OSD-575 */}
          <div className="rounded-[28px] border border-border liquid-glass-clear p-5 shadow-xs space-y-3.5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="rounded-full bg-signal/15 px-3 py-0.5 text-[11.5px] font-semibold text-signal">
                  Fully Integrated · 2,771 Records
                </span>
                <h4 className="mt-1.5 text-[17px] font-semibold text-ink">
                  Inspiration4 Serum (CMP & Cytokines)
                </h4>
                <div className="text-[12.5px] text-label font-mono">NASA OSDR Study: OSD-575</div>
              </div>
              <SourceChip kind="nasa" label="OSD-575" />
            </div>

            <p className="text-[13px] text-label leading-relaxed">
              Comprehensive Metabolic Panel (CMP) via Quest Diagnostics and multiplex immune/cardiovascular cytokine profiles via Eve Technologies. Includes Glucose, Electrolytes, BUN, and 50+ inflammatory markers.
            </p>

            <div className="rounded-xl liquid-glass-clear p-3 text-[12px] text-label space-y-1 font-mono">
              <div>Source Files: LSDS-8_CMP, LSDS-8_Immune, LSDS-8_Cardiovascular</div>
              <div>Benchmark Check: C001 Glucose at L-92 = 83 mg/dL (Verified)</div>
            </div>

            <div className="pt-1">
              <a
                href="https://osdr.nasa.gov/osdr/data/osd/meta/575"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-[13px] font-medium text-accent hover:underline"
              >
                View on NASA OSDR
                <ExternalLink className="size-3.5" />
              </a>
            </div>
          </div>

          {/* NASA DONKI */}
          <div className="rounded-[28px] border border-border liquid-glass-clear p-5 shadow-xs space-y-3.5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="rounded-full bg-signal/15 px-3 py-0.5 text-[11.5px] font-semibold text-signal">
                  Active Connector + Verified Archive
                </span>
                <h4 className="mt-1.5 text-[17px] font-semibold text-ink">
                  NASA DONKI Space Weather API
                </h4>
                <div className="text-[12.5px] text-label font-mono">api.nasa.gov / DONKI</div>
              </div>
              <SourceChip kind="nasa" label="DONKI" />
            </div>

            <p className="text-[13px] text-label leading-relaxed">
              Database Of Notifications, Knowledge, Information (DONKI) tracked by NASA Space Radiation Analysis Group (SRAG) and NOAA SWPC. Integrates solar flares (FLR), coronal mass ejections (CME), and geomagnetic storms (GST).
            </p>

            <div className="rounded-xl liquid-glass-clear p-3 text-[12px] text-label space-y-1 font-mono">
              <div>Instruments: GOES-16 EXIS XRS, SOHO LASCO, SDO AIA</div>
              <div>Historical Sequence: May 2024 Solar Superstorm (AR3664)</div>
            </div>

            <div className="pt-1">
              <a
                href="https://kauai.ccmc.gsfc.nasa.gov/DONKI/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-[13px] font-medium text-accent hover:underline"
              >
                Visit NASA DONKI Portal
                <ExternalLink className="size-3.5" />
              </a>
            </div>
          </div>

          {/* NASA RadLab & EDA */}
          <div className="rounded-[28px] border border-border liquid-glass-clear p-5 shadow-xs space-y-3.5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="rounded-full bg-signal/15 px-3 py-0.5 text-[11.5px] font-semibold text-signal">
                  Physics Telemetry Integration
                </span>
                <h4 className="mt-1.5 text-[17px] font-semibold text-ink">
                  NASA OSDR RadLab & EDA
                </h4>
                <div className="text-[12.5px] text-label font-mono">visualization.osdr.nasa.gov</div>
              </div>
              <SourceChip kind="nasa" label="RadLab" />
            </div>

            <p className="text-[13px] text-label leading-relaxed">
              Environmental radiation physics telemetry from ISS detectors (Liulin-5, REM) and Environmental Data Application (EDA) cabin ECLSS variables (CO2, pressure, temperature, oxygen partial pressure).
            </p>

            <div className="rounded-xl liquid-glass-clear p-3 text-[12px] text-label space-y-1 font-mono">
              <div>RadLab Absorbed Dose: 0.25 - 0.55 mGy/day LEO baseline</div>
              <div>Quality Factor Q = 2.0 (Biological Effectiveness Assumption)</div>
            </div>

            <div className="pt-1">
              <a
                href="https://visualization.osdr.nasa.gov/radlab"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-[13px] font-medium text-accent hover:underline"
              >
                Visit NASA RadLab
                <ExternalLink className="size-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Repeatable Ingestion & Normalization Architecture */}
      <Card className="col-span-full p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="label">Repeatable Pipeline Architecture</div>
            <h4 className="text-[18px] font-semibold text-ink">Local Data Architecture</h4>
          </div>
          <span className="rounded-full liquid-glass-clear px-3 py-1 font-mono text-[12px] text-label">
            v1.0.0
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[13px]">
          <div className="rounded-2xl liquid-glass-clear p-3.5 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-ink">
              <HardDrive className="size-4" />
              data/raw/
            </div>
            <p className="text-label text-[12px]">
              Preserves exact original submitted NASA CSV files without in-place modification.
            </p>
          </div>

          <div className="rounded-2xl liquid-glass-clear p-3.5 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-ink">
              <Database className="size-4" />
              data/processed/
            </div>
            <p className="text-label text-[12px]">
              Stores normalized records with parsed timepoints, validated units, and computed preflight baselines.
            </p>
          </div>

          <div className="rounded-2xl liquid-glass-clear p-3.5 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-ink">
              <FileText className="size-4" />
              docs/data-sources.md
            </div>
            <p className="text-label text-[12px]">
              Complete technical specification of variables, units, exclusions, and citations.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border p-4 text-[13.5px] leading-relaxed text-label space-y-2">
          <div className="font-semibold text-ink">Documented Ingestion Exclusions & Rules:</div>
          <ul className="list-disc pl-4 space-y-1 text-[13px]">
            <li><strong>Race-based eGFR exclusion:</strong> Outdated race-based eGFR equations (African American and Non-African American) are excluded from analysis to conform to modern nephrology standards.</li>
            <li><strong>Sex-labeled analytes:</strong> Normalized while preserving original raw clinical strings in <code className="liquid-glass-clear px-1 py-0.5 rounded text-[11.5px]">raw_analyte</code>. SEX column is omitted from patient-facing screens.</li>
            <li><strong>Preflight baseline sufficiency:</strong> Minimum 2 valid preflight observations required for standard deviation and z-score calculations. Missing observations remain uncalculated rather than silently fabricated.</li>
          </ul>
        </div>
      </Card>
    </Screen>
  )
}


