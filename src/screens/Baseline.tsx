import { useState, useMemo } from "react"
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  Info,
  Sliders,
  TrendingUp,
  ShieldCheck,
  Plus,
} from "lucide-react"
import { Screen } from "../components/Layout"
import { Card, Title, SourceChip } from "../components/ui"
import { BaselineChart } from "../components/Charts"
import { useBaselines, useEvaluation } from "../api/hooks"
import { useApp } from "../store/useApp"
import {
  computeBaseline,
  analyzeDeviation,
  BaselineStatistic,
  DeviationAnalysis,
} from "../services/baseline/baselineEngine"
import type { MetricKey } from "../data/types"

const METRICS_CONFIG: Record<
  string,
  { label: string; unit: string; initialHistory: number[]; dec: number }
> = {
  restHR: {
    label: "Resting Heart Rate",
    unit: "bpm",
    initialHistory: [57.5, 59.0, 58.2, 57.8, 58.6, 59.1, 58.0],
    dec: 1,
  },
  hrv: {
    label: "Heart Rate Variability (rMSSD)",
    unit: "ms",
    initialHistory: [54, 52, 50, 53, 51, 52, 53],
    dec: 0,
  },
  spo2: {
    label: "Blood Oxygen Saturation (SpO2)",
    unit: "%",
    initialHistory: [97.8, 98.0, 97.6, 97.9, 97.8, 97.7],
    dec: 1,
  },
  temp: {
    label: "Core/Skin Temperature",
    unit: "°C",
    initialHistory: [36.65, 36.72, 36.68, 36.70, 36.75],
    dec: 2,
  },
  reaction: {
    label: "PVT Reaction Time",
    unit: "ms",
    initialHistory: [240, 248, 245, 250, 242, 246],
    dec: 0,
  },
  vision: {
    label: "Visual Acuity (LogMAR)",
    unit: "logMAR",
    initialHistory: [0.00, 0.02, 0.00, -0.02, 0.00],
    dec: 2,
  },
}

export default function Baseline() {
  const day = useApp((s) => s.day)
  const { data: ev } = useEvaluation(day)

  const [metricKey, setMetricKey] = useState<string>("restHR")
  const [historyMap, setHistoryMap] = useState<Record<string, number[]>>(() => {
    const init: Record<string, number[]> = {}
    for (const [k, cfg] of Object.entries(METRICS_CONFIG)) {
      init[k] = [...cfg.initialHistory]
    }
    return init
  })

  // Test input state
  const [newObsValue, setNewObsValue] = useState<string>("64.5")
  const [deviationResult, setDeviationResult] = useState<DeviationAnalysis | null>(null)

  const currentCfg = METRICS_CONFIG[metricKey]
  const currentHistory = historyMap[metricKey] || []

  // Compute baseline dynamically using our verified engine
  const computedStats: BaselineStatistic = useMemo(() => {
    return computeBaseline(currentHistory, currentCfg.unit, currentCfg.label)
  }, [currentHistory, currentCfg])

  const handleRunAnalysis = (e: React.FormEvent) => {
    e.preventDefault()
    const val = parseFloat(newObsValue)
    if (isNaN(val)) return

    const analysis = analyzeDeviation(val, computedStats)
    setDeviationResult(analysis)
  }

  const handleAddMeasurement = () => {
    const val = parseFloat(newObsValue)
    if (isNaN(val)) return
    setHistoryMap((prev) => ({
      ...prev,
      [metricKey]: [...(prev[metricKey] || []), val],
    }))
  }

  return (
    <Screen>
      <div className="col-span-full">
        <Title a="Personal Astronaut" b="Health Baseline Intelligence" />
      </div>

      {/* Philosophy Card */}
      <Card className="col-span-full p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="label font-semibold text-ink">Strict Scientific Baseline Formulation</span>
          <SourceChip kind="nasa" label="Statistical Engine" />
        </div>
        <p className="text-[14px] leading-relaxed text-label">
          A baseline is established from an astronaut's actual historical measurements, not population averages. VITASTRA uses robust statistical methods (Mean, Standard Deviation, Median, Median Absolute Deviation). <strong>An unusual measurement indicates a statistical shift, never an automated clinical diagnosis.</strong>
        </p>
      </Card>

      {/* Metric Selector & Statistics Grid */}
      <Card className="col-span-full p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
          <div>
            <div className="label">Select Monitored Parameter</div>
            <div className="flex flex-wrap gap-2 mt-1.5">
              {Object.entries(METRICS_CONFIG).map(([k, cfg]) => (
                <button
                  key={k}
                  onClick={() => {
                    setMetricKey(k)
                    setDeviationResult(null)
                    if (k === "restHR") setNewObsValue("64.5")
                    else if (k === "hrv") setNewObsValue("45")
                    else if (k === "spo2") setNewObsValue("96.5")
                    else if (k === "temp") setNewObsValue("37.1")
                    else if (k === "reaction") setNewObsValue("285")
                    else if (k === "vision") setNewObsValue("0.12")
                  }}
                  className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-medium transition-colors ${metricKey === k
                      ? "liquid-glass-dark text-white shadow-xs"
                      : "liquid-glass-clear text-label hover:text-ink"
                    }`}
                >
                  {cfg.label}
                </button>
              ))}
            </div>
          </div>
          <span className="text-[12px] text-label font-mono">
            {currentHistory.length} measurements recorded
          </span>
        </div>

        {/* Statistical Parameters Dashboard */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[13.5px]">
          <div className="rounded-2xl liquid-glass-clear p-3.5 space-y-0.5">
            <span className="text-label text-[11px] uppercase">Baseline Mean</span>
            <div className="text-[22px] font-semibold text-ink tabular-nums">
              {computedStats.mean !== null ? `${computedStats.mean} ${computedStats.unit}` : "N/A"}
            </div>
          </div>

          <div className="rounded-2xl liquid-glass-clear p-3.5 space-y-0.5">
            <span className="text-label text-[11px] uppercase">Standard Deviation (s)</span>
            <div className="text-[22px] font-semibold text-ink tabular-nums">
              {computedStats.sd !== null ? `±${computedStats.sd} ${computedStats.unit}` : "N/A"}
            </div>
          </div>

          <div className="rounded-2xl liquid-glass-clear p-3.5 space-y-0.5">
            <span className="text-label text-[11px] uppercase">Median</span>
            <div className="text-[22px] font-semibold text-ink tabular-nums">
              {computedStats.median !== null ? `${computedStats.median} ${computedStats.unit}` : "N/A"}
            </div>
          </div>

          <div className="rounded-2xl liquid-glass-clear p-3.5 space-y-0.5">
            <span className="text-label text-[11px] uppercase">Median Abs Dev (MAD)</span>
            <div className="text-[22px] font-semibold text-ink tabular-nums">
              {computedStats.mad !== null ? `±${computedStats.mad} ${computedStats.unit}` : "N/A"}
            </div>
          </div>
        </div>
      </Card>

      {/* Interactive Deviation Analysis Tester */}
      <Card className="col-span-full p-5 space-y-4">
        <div className="border-b border-border pb-3">
          <div className="label">Live Measurement Comparison & Z-Score Analysis</div>
          <h3 className="text-[17px] font-semibold text-ink">
            Compare New Measurement against {currentCfg.label} Baseline
          </h3>
        </div>

        <form onSubmit={handleRunAnalysis} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="label mb-1 block">Observed Measurement ({currentCfg.unit})</label>
            <input
              type="text"
              value={newObsValue}
              onChange={(e) => setNewObsValue(e.target.value)}
              className="w-full rounded-2xl border border-border liquid-glass-clear px-4 py-2.5 text-[14px] text-ink focus:border-accent focus:outline-none"
            />
          </div>

          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="rounded-2xl liquid-glass-dark px-5 py-2.5 text-[13.5px] font-medium text-white hover:bg-border-strong transition-colors"
            >
              Calculate Z-Score
            </button>
            <button
              type="button"
              onClick={handleAddMeasurement}
              className="rounded-2xl liquid-glass-clear border border-border px-4 py-2.5 text-[13.5px] font-medium text-ink hover:bg-border transition-colors flex items-center gap-1"
            >
              <Plus className="size-4" /> Add to History
            </button>
          </div>
        </form>

        {deviationResult && (
          <div className={`rounded-2xl p-4 border text-[13.5px] space-y-2 ${deviationResult.classification === "nominal"
              ? "bg-signal/10 border-signal/30 text-ink"
              : deviationResult.classification === "mild_statistical_change"
                ? "bg-accent/10 border-accent/30 text-ink"
                : "bg-warning/10 border-warning/30 text-ink"
            }`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-semibold flex items-center gap-1.5">
                {deviationResult.classification === "nominal" ? (
                  <CheckCircle2 className="size-4 text-signal" />
                ) : (
                  <AlertTriangle className="size-4 text-warning" />
                )}
                Classification: {deviationResult.classification.replace(/_/g, " ").toUpperCase()}
              </span>
              <span className="text-[12px] font-mono">
                Z-Score: <strong>{deviationResult.zScore !== null ? (deviationResult.zScore > 0 ? `+${deviationResult.zScore}` : deviationResult.zScore) : "N/A"}</strong>
              </span>
            </div>

            <p className="text-[13px] leading-relaxed">{deviationResult.explanation}</p>

            <div className="pt-1 text-[11.5px] text-label flex items-center gap-2">
              <span>Uncertainty Level: <strong>{deviationResult.uncertaintyLevel.toUpperCase()}</strong></span>
              <span>·</span>
              <span>Based on {computedStats.sampleCount} verified measurements</span>
            </div>
          </div>
        )}
      </Card>

      {/* Historical Measurements Log */}
      <Card className="col-span-full p-5 space-y-3">
        <div className="label">Measurement History: {currentCfg.label} ({currentHistory.length} points)</div>
        <div className="flex flex-wrap gap-2">
          {currentHistory.map((val, idx) => (
            <span
              key={idx}
              className="rounded-xl liquid-glass-clear px-3 py-1.5 font-mono text-[13px] text-ink border border-border"
            >
              #{idx + 1}: <strong>{val}</strong> {currentCfg.unit}
            </span>
          ))}
        </div>
      </Card>
    </Screen>
  )
}



