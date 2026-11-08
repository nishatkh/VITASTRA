import { useState } from "react"
import {
  Download,
  Satellite,
  FileText,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  Plus,
  ShieldCheck,
  FileCheck,
} from "lucide-react"
import { Card, Segmented, AdviceFooter } from "../../components/ui"
import { AlertBadge } from "../../components/Level"
import { SlideToAct } from "../../components/SlideToAct"
import {
  useEvaluation,
  useTriage,
  useSBAR,
  useSetDelay,
  useConnection,
  useApp,
} from "../../api/hooks"
import { exportJson, exportPdf } from "../../lib/export"

const LANES = [
  { id: "act", title: "Act now", sub: "Decide on board" },
  { id: "monitor", title: "Monitor", sub: "Keep watching" },
  { id: "earth", title: "Can wait for Earth", sub: "Send in report" },
] as const

const DELAYS = ["0", "5", "20", "40"] as const

export type SbarStatus = "Drafted" | "Ready for review" | "Transmitting" | "Sent" | "Received" | "Reviewed"

export interface StructuredMedicalReport {
  id: string
  title: string
  missionDay: number
  generatedAt: string
  status: SbarStatus
  delayMin: number
  situation: string
  background: string
  assessment: string
  recommendation: string
  observedMeasurements: string
  symptoms: string
  dataQualityStatus: string
  timelineContext: string
}

const INITIAL_REPORTS: StructuredMedicalReport[] = [
  {
    id: "SBAR-042-01",
    title: "Mild Hypercapnia & Sleep Fragmentation",
    missionDay: 42,
    generatedAt: "2026-10-06T14:30:00Z",
    status: "Sent",
    delayMin: 20,
    situation: "Dr. Vasquez exhibits a 14% HRV decline and sustained cabin CO2 elevation to 4,350 ppm on Mission Day 42.",
    background: "Nominal health baseline over first 40 days. Heavy EVA suit pre-breathe over days 40-41 altered sleep schedule. ECLSS Node 2 scrubber canister approaching scheduled replacement interval.",
    assessment: "Coupled physiological adaptation: mild sleep fragmentation elevating stress index, while localized cabin CO2 accumulation induces compensatory cerebral vasodilation (mild headache reported at 14:22 UTC). No acute cardiac or neurological compromise.",
    recommendation: "1. Advance Node 2 scrubber canister swap to today. 2. Authorize 45 minutes protected rest tonight. 3. Re-evaluate morning HRV prior to EVA-2 go/no-go. 4. If HRV remains >10% below baseline, defer EVA to secondary window.",
    observedMeasurements: "HRV: 48 ms (baseline 52 ms). Cabin CO2: 4,350 ppm. Resting HR: 62 bpm. SpO2: 97.8%.",
    symptoms: "Mild frontal headache (scale 2/10), subjective ocular tiredness.",
    dataQualityStatus: "Validated: Telemetry verified across wearable sensor and fixed ECLSS monitoring grid.",
    timelineContext: "Occurred during 20-minute communication latency transit window.",
  },
]

export default function Triage() {
  const day = useApp((s) => s.day)
  const delay = useApp((s) => s.delay)
  const setAppDelay = useApp((s) => s.setDelay)
  const { data: ev } = useEvaluation(day)
  const { data: triageData } = useTriage(delay)
  const setDelay = useSetDelay()

  const [reports, setReports] = useState<StructuredMedicalReport[]>(INITIAL_REPORTS)
  const [activeReportId, setActiveReportId] = useState<string>(INITIAL_REPORTS[0].id)
  const [showCreateModal, setShowCreateModal] = useState(false)

  // New Report Form State
  const [newTitle, setNewTitle] = useState("")
  const [newSit, setNewSit] = useState("")
  const [newBack, setNewBack] = useState("")
  const [newAssess, setNewAssess] = useState("")
  const [newRec, setNewRec] = useState("")
  const [newSymp, setNewSymp] = useState("")
  const [newMeas, setNewMeas] = useState("")

  const activeReport = reports.find((r) => r.id === activeReportId) || reports[0]

  const rtt = delay * 2
  const secs = delay * 60
  const items = triageData ?? []

  const handleTransmitReport = (id: string) => {
    // Realistic delay state machine: Drafted -> Transmitting -> Sent
    setReports((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r
        return { ...r, status: delay === 0 ? "Sent" : "Transmitting" }
      })
    )

    if (delay > 0) {
      setTimeout(() => {
        setReports((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: "Sent" } : r))
        )
      }, Math.min(3000, delay * 100))
    }
  }

  const handleCreateReport = (e: React.FormEvent) => {
    e.preventDefault()
    const newId = `SBAR-042-0${reports.length + 1}`
    const created: StructuredMedicalReport = {
      id: newId,
      title: newTitle || "Clinical Handoff Report",
      missionDay: day + 1,
      generatedAt: new Date().toISOString(),
      status: "Drafted",
      delayMin: delay,
      situation: newSit || "Reported clinical concern under surveillance.",
      background: newBack || "Mission Day 42 adaptation timeline.",
      assessment: newAssess || "Physiological telemetry compared against 30-day baseline.",
      recommendation: newRec || "Follow standard mission clinical practice guidelines.",
      observedMeasurements: newMeas || "Resting HR, HRV, SpO2, and cabin environmental readings.",
      symptoms: newSymp || "None reported.",
      dataQualityStatus: "Validated telemetry",
      timelineContext: `Generated with ${delay} min one-way light delay.`,
    }

    setReports([created, ...reports])
    setActiveReportId(newId)
    setShowCreateModal(false)
    setNewTitle("")
    setNewSit("")
    setNewBack("")
    setNewAssess("")
    setNewRec("")
  }

  const exportPdfNow = () => {
    exportPdf(`vitastra-${activeReport.id}`, `VITASTRA Medical Report: ${activeReport.title}`, [
      ["Report ID", activeReport.id],
      ["Status", activeReport.status],
      ["Mission Day", `Day ${activeReport.missionDay}`],
      ["Communication Delay", `${activeReport.delayMin} min one-way (${activeReport.delayMin * 2} min RTT)`],
      ["Situation", activeReport.situation],
      ["Background", activeReport.background],
      ["Assessment", activeReport.assessment],
      ["Recommendation", activeReport.recommendation],
      ["Observed Measurements", activeReport.observedMeasurements],
      ["Reported Symptoms", activeReport.symptoms],
      ["Data Quality", activeReport.dataQualityStatus],
      ["Clinical Disclaimer", "VITASTRA decision support advises. The Flight Surgeon and approved procedures decide."],
    ])
  }

  const exportJsonNow = () => {
    exportJson(`vitastra-${activeReport.id}`, activeReport)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-[44px] font-light leading-[1.05] tracking-[-0.03em] sm:text-[56px] md:text-[68px]">
          <span className="block text-ink-2">Delay-Aware Triage</span>& Medical Reporting
        </h1>
        <p className="max-w-3xl text-[14.5px] sm:text-[15.5px] leading-relaxed text-label">
          Structured SBAR (Situation, Background, Assessment, Recommendation) handoff reporting calibrated for deep-space light-time latency. When communications lag between 5 and 40 minutes round-trip, VITASTRA categorizes interventions into local autonomous actions versus reports queued for Earth review.
        </p>
      </div>

      {/* Latency Simulator & Ground Communication Link */}
      <Card className="p-4 sm:p-5 space-y-4">
        <div className="grid items-center gap-5 md:grid-cols-[minmax(0,340px)_1fr]">
          <div>
            <div className="label mb-2">One-Way Light Delay (Minutes)</div>
            <Segmented
              label="Communication delay"
              value={String(delay) as typeof DELAYS[number]}
              options={DELAYS}
              onChange={(v) => {
                const dVal = Number(v) as 0 | 5 | 20 | 40
                setAppDelay(dVal)
                setDelay.mutate(dVal)
              }}
            />
          </div>

          <div>
            <div className="relative h-14" role="img" aria-label={`Signal latency: ${delay} min one way, ${rtt} min round trip`}>
              <div className="absolute left-4 right-4 top-1/2 h-px bg-border" />
              <div className="absolute left-0 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full liquid-glass-dark text-white">
                <Satellite size={16} strokeWidth={1.5} />
              </div>
              <div className="absolute right-0 top-1/2 size-9 -translate-y-1/2 rounded-full bg-gradient-to-br from-border to-ink-3" />
              {delay > 0 && (
                <div
                  className="absolute top-1/2 size-3 -translate-y-1/2 rounded-full bg-signal shadow-[0_0_14px_var(--signal-soft)]"
                  style={{ animation: `travel ${Math.max(1.6, delay / 6)}s linear infinite` }}
                />
              )}
              <style>{`@keyframes travel{from{left:28px}to{left:calc(100% - 40px)}}@media (prefers-reduced-motion:reduce){[style*="travel"]{animation:none!important;left:50%}}`}</style>
            </div>
            <div className="mt-1 text-[13px] text-label">
              {delay === 0
                ? "Low-Earth Orbit real-time link. Ground Flight Surgeons can respond immediately."
                : `Round trip latency ~${rtt} minutes (${secs} seconds one-way). Urgent actions MUST be executed autonomously on board.`}
            </div>
          </div>
        </div>
      </Card>

      {/* Triage Lanes Grid */}
      <div className="grid gap-4 lg:grid-cols-3">
        {LANES.map((ln) => {
          const list = items.filter((i) => i.lane === ln.id)
          return (
            <section
              key={ln.id}
              aria-label={ln.title}
              className={`min-h-40 rounded-[28px] p-4 sm:p-5 flex flex-col justify-between ${ln.id === "act" ? "bg-nav text-on-nav shadow-md" : "liquid-glass-clear border border-border"
                }`}
            >
              <div>
                <div className="mb-3 flex items-baseline justify-between border-b pb-2 border-border/30">
                  <h2 className="text-[19px] font-semibold tracking-tight">{ln.title}</h2>
                  <span className={`text-[12px] ${ln.id === "act" ? "text-on-nav/70" : "text-label"}`}>
                    {ln.sub}
                  </span>
                </div>

                <ul className="flex flex-col gap-2.5">
                  {list.length === 0 && (
                    <li className={`rounded-2xl border border-dashed px-4 py-5 text-[13px] text-center ${ln.id === "act" ? "border-on-nav/20 text-on-nav/60" : "border-border text-label"
                      }`}>
                      No signals currently in this lane
                    </li>
                  )}
                  {list.map((i) => (
                    <li
                      key={i.alertId}
                      className={`rounded-[20px] p-3.5 transition-all ${ln.id === "act"
                          ? "liquid-glass-dark text-white border border-white/10"
                          : "liquid-glass-clear text-ink border border-border shadow-xs"
                        }`}
                    >
                      <div className="mb-1.5 flex items-center justify-between">
                        <AlertBadge level={i.level} dark={ln.id === "act"} />
                        <span className="text-[11px] font-mono opacity-80">
                          Wait: {i.canWaitMinutes}m
                        </span>
                      </div>
                      <div className="text-[15px] font-semibold leading-tight">{i.title}</div>
                      <div className={`mt-1 text-[12px] leading-snug ${ln.id === "act" ? "text-white/80" : "text-label"
                        }`}>
                        {i.reason}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {ln.id === "act" && (
                <div className="mt-4 pt-3 border-t border-white/10 text-[11.5px] text-on-nav/70">
                  *Autonomous protocol MED-4.2 pre-authorized for on-board crew execution without ground hold.
                </div>
              )}
            </section>
          )
        })}
      </div>

      {/* Structured SBAR Medical Report Management */}
      <Card className="p-5 sm:p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
          <div>
            <div className="label">Structured Clinical Handoff (NASA SBAR Standard)</div>
            <h3 className="text-[20px] font-semibold text-ink">
              {activeReport.id}: {activeReport.title}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-1.5 rounded-full liquid-glass-clear px-4 py-1.5 text-[12.5px] font-medium text-ink hover:bg-border transition-colors"
            >
              <Plus className="size-3.5" /> New SBAR Draft
            </button>
            <button
              onClick={exportPdfNow}
              className="inline-flex items-center gap-1.5 rounded-full liquid-glass-clear px-4 py-1.5 text-[12.5px] font-medium text-ink hover:bg-border transition-colors"
            >
              <Download className="size-3.5" /> PDF
            </button>
            <button
              onClick={exportJsonNow}
              className="inline-flex items-center gap-1.5 rounded-full liquid-glass-clear px-4 py-1.5 text-[12.5px] font-medium text-ink hover:bg-border transition-colors"
            >
              <Download className="size-3.5" /> JSON
            </button>
          </div>
        </div>

        {/* Transmission & Review Status Strip */}
        <div className="rounded-2xl liquid-glass-clear p-4 flex flex-wrap items-center justify-between gap-3 text-[13px]">
          <div className="flex items-center gap-3">
            <span className={`inline-flex rounded-full px-3 py-1 text-[12px] font-semibold ${activeReport.status === "Sent" || activeReport.status === "Received" || activeReport.status === "Reviewed"
                ? "bg-signal/15 text-signal"
                : activeReport.status === "Transmitting"
                  ? "bg-accent/15 text-accent animate-pulse"
                  : "bg-warning/15 text-warning"
              }`}>
              {activeReport.status}
            </span>
            <span className="text-label">
              Generated Day {activeReport.missionDay} · Latency: {activeReport.delayMin} min
            </span>
          </div>

          {activeReport.status !== "Sent" && activeReport.status !== "Reviewed" && (
            <button
              onClick={() => handleTransmitReport(activeReport.id)}
              className="inline-flex items-center gap-1.5 rounded-full liquid-glass-dark px-4 py-1.5 text-[12.5px] font-semibold text-white hover:bg-border-strong transition-colors"
            >
              <Send className="size-3.5" /> Transmit to Flight Surgeon
            </button>
          )}
        </div>

        {/* Four SBAR Pillars */}
        <div className="space-y-4 text-[14px] leading-relaxed">
          <div className="rounded-2xl liquid-glass-clear p-4 space-y-1">
            <div className="label !text-accent font-bold">S — Situation</div>
            <p className="text-ink font-medium">{activeReport.situation}</p>
          </div>

          <div className="rounded-2xl liquid-glass-clear p-4 space-y-1">
            <div className="label !text-accent font-bold">B — Background</div>
            <p className="text-label">{activeReport.background}</p>
          </div>

          <div className="rounded-2xl liquid-glass-clear p-4 space-y-1">
            <div className="label !text-accent font-bold">A — Assessment</div>
            <p className="text-label">{activeReport.assessment}</p>
          </div>

          <div className="rounded-2xl liquid-glass-clear p-4 space-y-1">
            <div className="label !text-accent font-bold">R — Recommendation / Requested Action</div>
            <p className="text-ink font-medium">{activeReport.recommendation}</p>
          </div>
        </div>

        {/* Telemetry and Symptoms Summary Box */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[13px]">
          <div className="rounded-xl liquid-glass-clear p-3.5 space-y-1">
            <div className="font-semibold text-ink">Recorded Telemetry Measurements:</div>
            <div className="text-label">{activeReport.observedMeasurements}</div>
          </div>
          <div className="rounded-xl liquid-glass-clear p-3.5 space-y-1">
            <div className="font-semibold text-ink">Reported Subjective Symptoms:</div>
            <div className="text-label">{activeReport.symptoms}</div>
          </div>
        </div>
      </Card>

      {/* New SBAR Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-nav/60 backdrop-blur-xs">
          <form
            onSubmit={handleCreateReport}
            className="w-full max-w-lg max-h-[90dvh] overflow-y-auto rounded-[32px] liquid-glass-clear p-6 shadow-2xl border border-border space-y-4 text-[13.5px]"
          >
            <h3 className="text-[18px] font-semibold text-ink">Draft Structured Medical Handoff (SBAR)</h3>

            <div>
              <label className="label mb-1 block">Report Title</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. SANS Visual Acuity Drift Surveillance"
                className="w-full rounded-2xl border border-border liquid-glass-clear px-4 py-2 text-ink"
              />
            </div>

            <div>
              <label className="label mb-1 block">Situation (Brief summary of concern)</label>
              <textarea
                rows={2}
                required
                value={newSit}
                onChange={(e) => setNewSit(e.target.value)}
                placeholder="Observed parameter shift..."
                className="w-full rounded-2xl border border-border liquid-glass-clear p-3 text-ink"
              />
            </div>

            <div>
              <label className="label mb-1 block">Background (Clinical context & mission day)</label>
              <textarea
                rows={2}
                value={newBack}
                onChange={(e) => setNewBack(e.target.value)}
                placeholder="Past 72 hours workload, baseline status..."
                className="w-full rounded-2xl border border-border liquid-glass-clear p-3 text-ink"
              />
            </div>

            <div>
              <label className="label mb-1 block">Assessment (Coupled signals & baseline deviation)</label>
              <textarea
                rows={2}
                value={newAssess}
                onChange={(e) => setNewAssess(e.target.value)}
                placeholder="Differential interpretation without definitive diagnosis..."
                className="w-full rounded-2xl border border-border liquid-glass-clear p-3 text-ink"
              />
            </div>

            <div>
              <label className="label mb-1 block">Recommendation (Requested procedure / action)</label>
              <textarea
                rows={2}
                value={newRec}
                onChange={(e) => setNewRec(e.target.value)}
                placeholder="Next check schedule, countermeasure adjustment..."
                className="w-full rounded-2xl border border-border liquid-glass-clear p-3 text-ink"
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="rounded-full px-4 py-2 text-label hover:text-ink"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-full liquid-glass-dark px-5 py-2 font-semibold text-white hover:bg-border-strong"
              >
                Save SBAR Draft
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}



