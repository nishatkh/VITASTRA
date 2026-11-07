import { useState } from "react"
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  Activity,
  Filter,
  Info,
} from "lucide-react"
import { ModuleShell, NextActions } from "../../components/Layout"
import { Card, Segmented, SourceChip } from "../../components/ui"
import { ConfidenceBar } from "../../components/Level"
import { DotWave } from "../../components/DotWave"
import { useEvaluation, useApp } from "../../api/hooks"
import {
  validateMeasurement,
  assessDatasetQuality,
  PHYSIOLOGICAL_PLAUSIBILITY_LIMITS,
  ValidationIssue,
} from "../../services/data-validation/qualityEngine"

const MODES = ["Normal", "Sensor dropout", "Real change", "Implausible reading"] as const

const SAMPLE_TELEMETRY_STREAM: ValidationIssue[] = [
  {
    recordId: "val-001",
    parameter: "SpO2 (Pulse Oximetry)",
    value: 97.8,
    unit: "%",
    timestamp: "2026-10-06T14:40:00Z",
    source: "Continuous Wearable Ring",
    severity: "info",
    qualityStatus: "valid",
    reason: "Consistent with expected range [70 - 100%]. Micro-pulsatile signal verified.",
    includedInCalculations: true,
  },
  {
    recordId: "val-002",
    parameter: "Resting Heart Rate",
    value: 58.2,
    unit: "bpm",
    timestamp: "2026-10-06T14:40:00Z",
    source: "Chest ECG Sensor",
    severity: "info",
    qualityStatus: "valid",
    reason: "Plausible sinus rhythm. Signal-to-noise ratio > 24 dB.",
    includedInCalculations: true,
  },
  {
    recordId: "val-003",
    parameter: "Cabin CO2 Scrubber Bed 2",
    value: 4350,
    unit: "ppm",
    timestamp: "2026-10-06T14:38:00Z",
    source: "Fixed ECLSS Sensor Grid",
    severity: "info",
    qualityStatus: "valid",
    reason: "Dual-beam optical sensor calibrated. Reading consistent across Node 2 sensors.",
    includedInCalculations: true,
  },
  {
    recordId: "val-004",
    parameter: "T2 Treadmill Speed Sensor",
    value: null,
    unit: "m/s",
    timestamp: "2026-10-06T14:35:00Z",
    source: "T2 Vibration Isolation Motor",
    severity: "warning",
    qualityStatus: "missing_value",
    reason: "Missing telemetry packet during treadmill warmup phase.",
    includedInCalculations: false,
  },
  {
    recordId: "val-005",
    parameter: "Capillary Blood Glucose",
    value: 340,
    unit: "mg/dL",
    timestamp: "2026-10-05T08:00:00Z",
    source: "Fingerstick Glucometer (Stale)",
    severity: "error",
    qualityStatus: "implausible_measurement",
    reason: "Single outlier observation (+5.2 SD above personal fasting baseline 83 mg/dL). Optical test strip error suspected.",
    includedInCalculations: false,
  },
]

export default function Sensor() {
  const day = useApp((s) => s.day)
  const { data: ev } = useEvaluation(day)
  const mode = useApp((s) => s.flags.sensorMode)
  const setFlag = useApp((s) => s.setFlag)

  const [interactiveParam, setInteractiveParam] = useState("spo2")
  const [interactiveVal, setInteractiveVal] = useState("98")
  const [testResult, setTestResult] = useState<ValidationIssue | null>(null)

  const cur =
    mode === "none"
      ? "Normal"
      : mode === "dropout"
      ? "Sensor dropout"
      : "Real change"

  const f = ev?.fault
  const trace = Array.from({ length: 48 }, (_, i) =>
    mode === "dropout" && i > 30
      ? 0
      : mode === "real" && i > 30
      ? 0.3 + Math.sin(i) * 0.02
      : 0.75 + Math.sin(i * 0.6) * 0.04
  )

  const qualitySummary = assessDatasetQuality(SAMPLE_TELEMETRY_STREAM)

  const handleRunValidationTest = (e: React.FormEvent) => {
    e.preventDefault()
    const validated = validateMeasurement(
      interactiveParam,
      interactiveVal,
      PHYSIOLOGICAL_PLAUSIBILITY_LIMITS[interactiveParam]?.unit || "",
      new Date().toISOString(),
      "Manual Diagnostic Console"
    )
    setTestResult(validated)
  }

  return (
    <ModuleShell title={["Sensor & Data", "Quality Intelligence"]}>
      {/* Overview Card */}
      <Card className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="label font-semibold text-ink">System-Wide Data Integrity & Fault Isolation</span>
          <SourceChip kind="nasa" label="Validation Architecture" />
        </div>
        <p className="text-[14px] leading-relaxed text-label">
          Spaceflight sensors operate under thermal swings, electromagnetic noise, and motion artifacts. VITASTRA validates every telemetry record before calculating baselines or raising alerts. <strong>Low-quality or implausible data lowers calculation confidence and is isolated from clinical models.</strong>
        </p>
      </Card>

      {/* Dataset Reliability & Confidence Gauge */}
      <Card className="p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
          <div>
            <div className="label">Telemetry Confidence Score</div>
            <h3 className="text-[22px] font-semibold text-ink">
              {Math.round(qualitySummary.overallConfidence * 100)}% Data Reliability
            </h3>
          </div>
          <span className={`inline-flex rounded-full px-3 py-1 text-[12px] font-semibold ${
            qualitySummary.qualityTier === "high"
              ? "bg-signal/15 text-signal"
              : qualitySummary.qualityTier === "moderate"
              ? "bg-accent/15 text-accent"
              : "bg-warning/15 text-warning"
          }`}>
            Status: {qualitySummary.qualityTier.toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[13px]">
          <div className="rounded-xl bg-raised p-3">
            <span className="text-label text-[11px] uppercase">Verified Records</span>
            <div className="text-[20px] font-semibold text-signal mt-0.5">
              {qualitySummary.validCount}
            </div>
          </div>
          <div className="rounded-xl bg-raised p-3">
            <span className="text-label text-[11px] uppercase">Flagged Quality Issues</span>
            <div className="text-[20px] font-semibold text-warning mt-0.5">
              {qualitySummary.issueCount}
            </div>
          </div>
          <div className="rounded-xl bg-raised p-3">
            <span className="text-label text-[11px] uppercase">Excluded from Baselines</span>
            <div className="text-[20px] font-semibold text-ink mt-0.5">
              {qualitySummary.issueCount}
            </div>
          </div>
        </div>
      </Card>

      {/* Interactive Plausibility Engine Test Console */}
      <Card className="p-5 space-y-4">
        <div className="border-b border-border pb-3">
          <div className="label">Diagnostic Plausibility Tester</div>
          <h3 className="text-[17px] font-semibold text-ink">
            Test Arbitrary Telemetry against Physiological Bounds
          </h3>
        </div>

        <form onSubmit={handleRunValidationTest} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="label mb-1 block">Parameter</label>
            <select
              value={interactiveParam}
              onChange={(e) => setInteractiveParam(e.target.value)}
              className="w-full rounded-2xl border border-border bg-surface px-3.5 py-2 text-[13.5px] text-ink"
            >
              <option value="spo2">Blood Oxygen (SpO2 %)</option>
              <option value="heartRate">Heart Rate (bpm)</option>
              <option value="bodyTemp">Core Body Temp (°C)</option>
              <option value="cabinCO2">Cabin CO2 (ppm)</option>
              <option value="reactionTime">Reaction Time (ms)</option>
            </select>
          </div>

          <div>
            <label className="label mb-1 block">Test Value</label>
            <input
              type="text"
              value={interactiveVal}
              onChange={(e) => setInteractiveVal(e.target.value)}
              placeholder="e.g. 0, 98, 150..."
              className="w-full rounded-2xl border border-border bg-surface px-3.5 py-2 text-[13.5px] text-ink"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full rounded-2xl bg-ink py-2 text-[13.5px] font-medium text-canvas hover:bg-border-strong transition-colors"
            >
              Validate Reading
            </button>
          </div>
        </form>

        {testResult && (
          <div className={`rounded-2xl p-4 border text-[13.5px] space-y-1.5 ${
            testResult.qualityStatus === "valid"
              ? "bg-signal/10 border-signal/30 text-ink"
              : "bg-warning/10 border-warning/40 text-ink"
          }`}>
            <div className="flex items-center justify-between">
              <span className="font-semibold flex items-center gap-1.5">
                {testResult.qualityStatus === "valid" ? (
                  <CheckCircle2 className="size-4 text-signal" />
                ) : (
                  <AlertTriangle className="size-4 text-warning" />
                )}
                Quality Status: {testResult.qualityStatus}
              </span>
              <span className="text-[12px] font-mono">
                Included in baseline: {testResult.includedInCalculations ? "YES" : "NO"}
              </span>
            </div>
            <p className="text-[13px] text-label">{testResult.reason}</p>
          </div>
        )}
      </Card>

      {/* Simulated Sensor Mode Drill */}
      <Card className="p-5 space-y-3">
        <div className="label mb-1">Interactive Sensor Dropout Simulation</div>
        <Segmented
          label="Simulated SpO2 signal"
          value={cur}
          options={["Normal", "Sensor dropout", "Real change"]}
          onChange={(v) =>
            setFlag(
              "sensorMode",
              v === "Normal" ? "none" : v === "Sensor dropout" ? "dropout" : "real"
            )
          }
        />
        <div className="mt-4">
          <DotWave
            values={trace}
            rows={7}
            tone={mode === "none" ? "ink" : "red"}
            label="SpO2 signal trace"
          />
        </div>
      </Card>

      {/* Active Validation Issue Registry */}
      <Card className="p-5 space-y-3">
        <div className="label">Telemetry Quality Audit Stream</div>
        <div className="divide-y divide-border text-[13.5px]">
          {SAMPLE_TELEMETRY_STREAM.map((item) => (
            <div key={item.recordId} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-ink">{item.parameter}</span>
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${
                    item.qualityStatus === "valid"
                      ? "bg-signal/15 text-signal"
                      : "bg-warning/15 text-warning"
                  }`}>
                    {item.qualityStatus}
                  </span>
                </div>
                <div className="text-[12.5px] text-label mt-0.5">{item.reason}</div>
              </div>

              <div className="text-right text-[12px] text-label shrink-0">
                <div className="font-mono">{item.value !== null ? `${item.value} ${item.unit}` : "NULL"}</div>
                <div>{item.source}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <NextActions
        items={[
          "Inspect optical finger probe seating if sensor dropout persists for >60 seconds",
          "Clean ECLSS optical CO2 sensor lens during monthly maintenance cycle",
        ]}
      />
    </ModuleShell>
  )
}
