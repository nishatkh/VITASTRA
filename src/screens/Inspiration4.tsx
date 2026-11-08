import { useState, useMemo } from "react"
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
  ReferenceArea,
} from "recharts"
import {
  FlaskConical,
  AlertTriangle,
  Info,
  ExternalLink,
  ShieldAlert,
  ChevronDown,
  Database,
  CheckCircle2,
  Calendar,
} from "lucide-react"
import { Screen } from "../components/Layout"
import { Card, Title, SourceChip } from "../components/ui"
import normalizedData from "../data/processed/inspiration4_normalized.json"
import datasetMeta from "../data/processed/dataset_metadata.json"

export interface Inspiration4Record {
  subject_id: string
  timepoint: string
  days_from_launch: number | null
  panel: string
  marker: string
  value: number | null
  unit: string
  range_min: number | null
  range_max: number | null
  raw_analyte: string
  source_study: string
  source_file: string
  sample_date: string
  data_quality_status: string
  baseline_mean?: number | null
  baseline_sd?: number | null
  baseline_n?: number
  z_score?: number | null
  baseline_status?: string
  baseline_note?: string
}

const CREWS = ["C001", "C002", "C003", "C004"]
const PANELS = ["CBC", "CMP", "Immune Cytokines", "Cardiovascular Biomarkers"]

export default function Inspiration4() {
  const [selectedCrew, setSelectedCrew] = useState<string>("C001")
  const [selectedPanel, setSelectedPanel] = useState<string>("CBC")
  const [selectedMarker, setSelectedMarker] = useState<string>("WHITE BLOOD CELL COUNT")
  const [activeTab, setActiveTab] = useState<"timeseries" | "table" | "baseline">("timeseries")

  const allRecords = normalizedData as Inspiration4Record[]

  // Filter markers available for the selected crew and panel
  const availableMarkers = useMemo(() => {
    const set = new Set<string>()
    for (const r of allRecords) {
      if (r.subject_id === selectedCrew && r.panel === selectedPanel && r.data_quality_status !== "excluded_outdated_race_egfr") {
        set.add(r.marker)
      }
    }
    const list = Array.from(set).sort()
    return list
  }, [allRecords, selectedCrew, selectedPanel])

  // If selected marker is not in available markers, switch to the first one
  const currentMarker = useMemo(() => {
    if (availableMarkers.includes(selectedMarker)) {
      return selectedMarker
    }
    return availableMarkers[0] || ""
  }, [availableMarkers, selectedMarker])

  // Get matching records for time-series and table
  const markerRecords = useMemo(() => {
    return allRecords
      .filter(
        (r) =>
          r.subject_id === selectedCrew &&
          r.panel === selectedPanel &&
          r.marker === currentMarker
      )
      .sort((a, b) => (a.days_from_launch ?? 0) - (b.days_from_launch ?? 0))
  }, [allRecords, selectedCrew, selectedPanel, currentMarker])

  const baselineInfo = useMemo(() => {
    if (markerRecords.length === 0) return null
    const first = markerRecords[0]
    return {
      mean: first.baseline_mean ?? null,
      sd: first.baseline_sd ?? null,
      n: first.baseline_n ?? 0,
      status: first.baseline_status ?? "unknown",
      note: first.baseline_note ?? null,
      unit: first.unit,
    }
  }, [markerRecords])

  // Chart data formatting
  const chartData = useMemo(() => {
    return markerRecords.map((r) => ({
      timepoint: r.timepoint,
      days: r.days_from_launch,
      value: r.value,
      zScore: r.z_score,
      baselineMean: baselineInfo?.mean ?? null,
      baselineUpper: baselineInfo && baselineInfo.mean !== null && baselineInfo.sd !== null ? +(baselineInfo.mean + 1.5 * baselineInfo.sd).toFixed(2) : null,
      baselineLower: baselineInfo && baselineInfo.mean !== null && baselineInfo.sd !== null ? +(baselineInfo.mean - 1.5 * baselineInfo.sd).toFixed(2) : null,
      status: r.data_quality_status,
      unit: r.unit,
    }))
  }, [markerRecords, baselineInfo])

  const studyId = markerRecords[0]?.source_study || (selectedPanel === "CBC" ? "OSD-569" : "OSD-575")
  const sourceFileName = markerRecords[0]?.source_file || "NASA OSDR Submitted File"

  return (
    <Screen>
      <div className="col-span-full">
        <Title a="Inspiration4" b="NASA OSDR Research" />
      </div>

      {/* Mandatory Scientific Honesty Banner */}
      <section className="col-span-full rounded-[24px] liquid-glass-clear border border-accent/30 p-4 sm:p-5 shadow-xs">
        <div className="flex items-start gap-3.5">
          <Info className="mt-0.5 size-6 shrink-0 text-accent" />
          <div className="space-y-1">
            <h2 className="text-[16px] sm:text-[18px] font-semibold text-ink tracking-tight">
              Historical Inspiration4 research data — not live monitoring of current astronauts.
            </h2>
            <p className="text-[13px] sm:text-[14px] leading-relaxed text-label">
              This intelligence module visualizes real, verified human biomedical datasets from the SpaceX Inspiration4 mission hosted on the{" "}
              <strong>NASA Open Science Data Repository (OSDR studies OSD-569 and OSD-575)</strong>. Data was collected by Quest Diagnostics, Eve Technologies, and Weill Cornell Medicine from four anonymized civilian crewmembers (C001–C004) across preflight (L-92 to L-3) and postflight (R+1 to R+194) periods.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Selectors Bar */}
      <Card className="col-span-full p-4 sm:p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Crew Selector */}
          <div>
            <label htmlFor="crew-select" className="label mb-1.5 block">
              Participant (Anonymized ID)
            </label>
            <div className="relative">
              <select
                id="crew-select"
                value={selectedCrew}
                onChange={(e) => setSelectedCrew(e.target.value)}
                className="w-full appearance-none rounded-2xl border border-border liquid-glass-clear px-4 py-2.5 text-[14px] font-medium text-ink shadow-xs focus:border-accent focus:outline-none"
              >
                {CREWS.map((c) => (
                  <option key={c} value={c}>
                    Participant {c} (Civilian Astronaut)
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3.5 top-3.5 size-4 text-label" />
            </div>
          </div>

          {/* Panel Selector */}
          <div>
            <label htmlFor="panel-select" className="label mb-1.5 block">
              Assay Panel
            </label>
            <div className="relative">
              <select
                id="panel-select"
                value={selectedPanel}
                onChange={(e) => {
                  setSelectedPanel(e.target.value)
                  setSelectedMarker("") // Reset to trigger auto-select
                }}
                className="w-full appearance-none rounded-2xl border border-border liquid-glass-clear px-4 py-2.5 text-[14px] font-medium text-ink shadow-xs focus:border-accent focus:outline-none"
              >
                {PANELS.map((p) => (
                  <option key={p} value={p}>
                    {p} {p === "CBC" ? "(OSD-569 Whole Blood)" : "(OSD-575 Serum)"}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3.5 top-3.5 size-4 text-label" />
            </div>
          </div>

          {/* Marker Selector */}
          <div className="sm:col-span-2 lg:col-span-1">
            <label htmlFor="marker-select" className="label mb-1.5 block">
              Analyte / Biomarker ({availableMarkers.length} available)
            </label>
            <div className="relative">
              <select
                id="marker-select"
                value={currentMarker}
                onChange={(e) => setSelectedMarker(e.target.value)}
                className="w-full appearance-none rounded-2xl border border-border liquid-glass-clear px-4 py-2.5 text-[14px] font-medium text-ink shadow-xs focus:border-accent focus:outline-none"
              >
                {availableMarkers.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3.5 top-3.5 size-4 text-label" />
            </div>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("timeseries")}
              className={`rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors ${activeTab === "timeseries"
                  ? "bg-cyan-600 text-white"
                  : "liquid-glass-clear text-label hover:text-ink"
                }`}
            >
              Time-Series Trajectory
            </button>
            <button
              onClick={() => setActiveTab("table")}
              className={`rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors ${activeTab === "table"
                  ? "bg-cyan-600 text-white"
                  : "liquid-glass-clear text-label hover:text-ink"
                }`}
            >
              Submitted Data Table ({markerRecords.length})
            </button>
            <button
              onClick={() => setActiveTab("baseline")}
              className={`rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors ${activeTab === "baseline"
                  ? "bg-cyan-600 text-white"
                  : "liquid-glass-clear text-label hover:text-ink"
                }`}
            >
              Preflight Baseline Audit
            </button>
          </div>

          <div className="flex items-center gap-2 text-[12px] text-label">
            <span className="inline-block size-2 rounded-full bg-signal" />
            Verified NASA submitted records
          </div>
        </div>
      </Card>

      {/* Main Visualization View */}
      {activeTab === "timeseries" && (
        <Card className="col-span-full p-4 sm:p-6">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <div className="label">Analyte Trajectory & Mission Milestones</div>
              <h3 className="text-[20px] sm:text-[24px] font-light tracking-tight text-ink">
                {currentMarker}{" "}
                <span className="text-[14px] font-normal text-label">
                  ({markerRecords[0]?.unit || "unit"})
                </span>
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded-full bg-border px-3 py-1 text-[12px] font-medium text-ink">
                Participant: {selectedCrew}
              </span>
              <SourceChip kind="nasa" label={studyId} />
            </div>
          </div>

          {/* Time-Series Chart */}
          <div className="h-[280px] sm:h-[340px] w-full" role="img" aria-label={`Trajectory for ${currentMarker}`}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 15, right: 20, left: 0, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.6} />
                <XAxis
                  dataKey="timepoint"
                  tick={{ fontSize: 12, fill: "var(--ink-2)" }}
                  tickLine={false}
                  axisLine={{ stroke: "var(--border)" }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "var(--ink-2)" }}
                  tickLine={false}
                  axisLine={{ stroke: "var(--border)" }}
                  domain={["auto", "auto"]}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null
                    const d = payload[0].payload
                    return (
                      <div className="rounded-2xl border border-border liquid-glass-dark p-3 text-[13px] text-on-nav shadow-xl">
                        <div className="font-semibold">{d.timepoint} (Day {d.days})</div>
                        <div className="mt-1">
                          Observed: <span className="font-bold">{d.value !== null ? d.value : "Missing"}</span> {d.unit}
                        </div>
                        {d.zScore !== null && (
                          <div className="text-[12px] text-on-nav/80">
                            Baseline z-score: <span className="font-medium">{d.zScore > 0 ? `+${d.zScore}` : d.zScore}</span>
                          </div>
                        )}
                        {d.baselineMean !== null && (
                          <div className="text-[11px] text-on-nav/60">
                            Preflight baseline mean: {d.baselineMean} {d.unit}
                          </div>
                        )}
                      </div>
                    )
                  }}
                />

                {/* Preflight Baseline ±1.5 SD Band if available */}
                {baselineInfo && baselineInfo.mean !== null && baselineInfo.sd !== null && (
                  <ReferenceArea
                    y1={+(baselineInfo.mean - 1.5 * baselineInfo.sd).toFixed(2)}
                    y2={+(baselineInfo.mean + 1.5 * baselineInfo.sd).toFixed(2)}
                    fill="var(--accent)"
                    fillOpacity={0.12}
                    label={{
                      value: "Preflight Baseline (±1.5 SD)",
                      position: "insideTopLeft",
                      fontSize: 10,
                      fill: "var(--accent)",
                      opacity: 0.8,
                    }}
                  />
                )}

                {/* Launch Marker (L-0) */}
                <ReferenceLine
                  x="L-3"
                  stroke="var(--signal)"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: "🚀 Launch (L-0)",
                    position: "insideTopRight",
                    fontSize: 11,
                    fill: "var(--signal)",
                  }}
                />

                {/* Splashdown / Return Marker (R+1) */}
                <ReferenceLine
                  x="R+1"
                  stroke="var(--accent)"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: "🌊 Splashdown (R+0)",
                    position: "insideTopLeft",
                    fontSize: 11,
                    fill: "var(--accent)",
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="var(--ink)"
                  strokeWidth={2.2}
                  dot={{ r: 5, fill: "var(--ink)", strokeWidth: 2, stroke: "var(--canvas)" }}
                  activeDot={{ r: 7 }}
                  connectNulls={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Chart Legend and Mission Explanations */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[12px] text-label border-t border-border pt-3">
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full liquid-glass-dark" /> Observed Lab Measurement
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-4 rounded-xs bg-accent/20 border border-accent/40" /> Individual Preflight Baseline (±1.5 SD)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-0.5 w-4 bg-signal" /> Launch / Recovery Boundary
              </span>
            </div>

            <div className="italic">
              *Missing points in line indicate unmeasured scheduled timepoints. No values are interpolated.
            </div>
          </div>
        </Card>
      )}

      {/* Raw Submitted Data Table */}
      {activeTab === "table" && (
        <Card className="col-span-full overflow-hidden p-0">
          <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between">
            <div>
              <div className="label">Normalized Dataset Records</div>
              <div className="text-[15px] font-medium text-ink">
                {selectedCrew} · {selectedPanel} · {currentMarker}
              </div>
            </div>
            <span className="text-[12px] text-label">{markerRecords.length} records in study</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13.5px]">
              <thead className="liquid-glass-clear text-[12px] font-semibold text-label uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Timepoint</th>
                  <th className="py-3 px-4">Days from Launch</th>
                  <th className="py-3 px-4">Normalized Value</th>
                  <th className="py-3 px-4">Submitted Range</th>
                  <th className="py-3 px-4">Raw Analyte Label</th>
                  <th className="py-3 px-4">Baseline Z-Score</th>
                  <th className="py-3 px-4">Quality Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {markerRecords.map((r, i) => (
                  <tr key={i} className="hover:liquid-glass-clear/50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-ink">{r.timepoint}</td>
                    <td className="py-3 px-4 tabular-nums text-label">
                      {r.days_from_launch !== null ? (r.days_from_launch > 0 ? `+${r.days_from_launch}` : r.days_from_launch) : "—"}
                    </td>
                    <td className="py-3 px-4 font-medium tabular-nums text-ink">
                      {r.value !== null ? `${r.value} ${r.unit}` : <span className="text-label italic">Missing</span>}
                    </td>
                    <td className="py-3 px-4 text-label tabular-nums">
                      {r.range_min !== null && r.range_max !== null
                        ? `${r.range_min} - ${r.range_max}`
                        : "—"}
                    </td>
                    <td className="py-3 px-4 text-label font-mono text-[12px]">
                      {r.raw_analyte}
                    </td>
                    <td className="py-3 px-4 tabular-nums">
                      {r.z_score !== null && r.z_score !== undefined ? (
                        <span className={`font-semibold ${Math.abs(r.z_score) >= 2 ? "text-warning" : "text-ink"}`}>
                          {r.z_score > 0 ? `+${r.z_score}` : r.z_score}
                        </span>
                      ) : (
                        <span className="text-label text-[11px]">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${r.data_quality_status === "valid"
                          ? "bg-signal/10 text-signal"
                          : "bg-warning/15 text-warning"
                        }`}>
                        {r.data_quality_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Preflight Baseline Audit View */}
      {activeTab === "baseline" && (
        <Card className="col-span-full p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[20px] font-semibold text-ink">
              Preflight Baseline Audit: {currentMarker}
            </h3>
            <span className="text-[12px] text-label">Participant: {selectedCrew}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl liquid-glass-clear p-4">
              <div className="text-[12px] text-label">Preflight Mean (L-92, L-44, L-3)</div>
              <div className="mt-1 text-[26px] font-semibold tabular-nums text-ink">
                {baselineInfo?.mean !== null ? `${baselineInfo?.mean} ${baselineInfo?.unit}` : "N/A"}
              </div>
            </div>
            <div className="rounded-2xl liquid-glass-clear p-4">
              <div className="text-[12px] text-label">Sample Standard Deviation (s)</div>
              <div className="mt-1 text-[26px] font-semibold tabular-nums text-ink">
                {baselineInfo?.sd !== null ? `± ${baselineInfo?.sd} ${baselineInfo?.unit}` : "N/A"}
              </div>
            </div>
            <div className="rounded-2xl liquid-glass-clear p-4">
              <div className="text-[12px] text-label">Preflight Observations Used</div>
              <div className="mt-1 text-[26px] font-semibold tabular-nums text-ink">
                {baselineInfo?.n ?? 0} <span className="text-[14px] font-normal text-label">samples</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl liquid-glass-clear p-4 text-[13.5px] leading-relaxed text-label space-y-2">
            <div className="font-semibold text-ink">Statistical Preflight Methodology:</div>
            <p>
              Preflight baselines are established strictly using pre-launch measurements (L-92, L-44, L-3). In accordance with NASA biomedical data standards, a minimum of <strong>two valid preflight observations</strong> is required to compute dispersion (standard deviation) and calculate postflight z-scores. Changing laboratory reference ranges between preflight and postflight are not treated as personalized baselines.
            </p>
            {baselineInfo?.note && (
              <p className="text-warning font-medium">Notice: {baselineInfo.note}</p>
            )}
          </div>
        </Card>
      )}

      {/* Cohort Limitations & Scientific Disclosures */}
      <section className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4 sm:p-5 space-y-2.5">
          <div className="flex items-center gap-2 text-ink font-semibold text-[15px]">
            <ShieldAlert className="size-4 text-warning" />
            Study Cohort Limitations
          </div>
          <ul className="space-y-1.5 text-[13px] text-label list-disc pl-4">
            <li><strong>Small cohort:</strong> Exactly four civilian participants (C001, C002, C003, C004).</li>
            <li><strong>Short duration:</strong> Three-day low-Earth orbit mission (~575 km apogee). Findings cannot be directly extrapolated to 6-month ISS expeditions or multi-year Mars transits.</li>
            <li><strong>Intermittent sampling:</strong> Preflight and postflight venipuncture sampling rather than continuous in-flight blood monitoring.</li>
            <li><strong>Generalizability:</strong> Biological responses represent individual physiological adaptations and must not be interpreted as universal astronaut norms.</li>
          </ul>
        </Card>

        <Card className="p-4 sm:p-5 space-y-2.5">
          <div className="flex items-center gap-2 text-ink font-semibold text-[15px]">
            <Database className="size-4 text-accent" />
            Data Provenance & Attribution
          </div>
          <div className="text-[13px] text-label space-y-1.5">
            <div><strong>Repository:</strong> NASA Open Science Data Repository (OSDR)</div>
            <div><strong>Study Accession:</strong> {studyId}</div>
            <div><strong>Authoritative Source File:</strong> <span className="font-mono text-[11.5px]">{sourceFileName}</span></div>
            <div>
              <strong>Original Study Link:</strong>{" "}
              <a
                href={studyId === "OSD-569" ? "https://osdr.nasa.gov/osdr/data/osd/meta/569" : "https://osdr.nasa.gov/osdr/data/osd/meta/575"}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-medium text-accent hover:underline"
              >
                osdr.nasa.gov/osdr/data/osd/meta/{studyId === "OSD-569" ? "569" : "575"}
                <ExternalLink className="size-3" />
              </a>
            </div>
            <div className="pt-1 text-[11.5px] text-ink-3">
              Outdated race-based eGFR analytes have been excluded from calculations in accordance with contemporary clinical nephrology consensus and NASA guidelines.
            </div>
          </div>
        </Card>
      </section>
    </Screen>
  )
}



