import { useState } from "react"
import {
  FlaskConical,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Plus,
  ThermometerSnowflake,
  ShieldCheck,
  FileCheck,
} from "lucide-react"
import {
  ModuleShell,
  StatusRow,
  NextActions,
  useModuleAlert,
} from "../../components/Layout"
import { DotNum } from "../../components/DotNum"
import { SourceChip, Card } from "../../components/ui"
import { ConfidenceBar } from "../../components/Level"
import { useEvaluation } from "../../api/hooks"

export type SampleStage =
  | "Scheduled"
  | "Collected"
  | "Stored"
  | "Submitted"
  | "Processing"
  | "Result received"
  | "Reviewed"

export interface ImmuneSample {
  id: string
  sampleType: "Saliva (passive drool)" | "Saliva (synthetic swab)" | "Capillary blood fingerstick"
  scheduledDay: number
  collectionTime: string | null
  storageCondition: "Ambient" | "-20°C Storage" | "-80°C MELFI Freezer" | "Pending collection"
  stage: SampleStage
  biomarkers?: {
    salivaryCortisol?: { value: number; unit: string; baselineRef: string }
    sIgA?: { value: number; unit: string; baselineRef: string }
    vzvDnaCopies?: { value: number; unit: string; baselineRef: string }
    ebvDnaCopies?: { value: number; unit: string; baselineRef: string }
  }
  notes?: string
}

const INITIAL_SAMPLES: ImmuneSample[] = [
  {
    id: "SAL-042-A",
    sampleType: "Saliva (passive drool)",
    scheduledDay: 42,
    collectionTime: "2026-10-06T06:45:00Z",
    storageCondition: "-80°C MELFI Freezer",
    stage: "Result received",
    biomarkers: {
      salivaryCortisol: { value: 0.38, unit: "ug/dL", baselineRef: "Baseline: 0.22 - 0.45 ug/dL (Nominal)" },
      sIgA: { value: 142.5, unit: "ug/mL", baselineRef: "Baseline: 120 - 250 ug/mL (Normal mucosal barrier)" },
      vzvDnaCopies: { value: 0, unit: "copies/mL", baselineRef: "Undetected (No latent VZV reactivation)" },
      ebvDnaCopies: { value: 0, unit: "copies/mL", baselineRef: "Undetected (Nominal latent viral control)" },
    },
    notes: "Waking collection completed before oral intake. Tube #3 placed in MELFI Dewars Tray 2.",
  },
  {
    id: "SAL-045-B",
    sampleType: "Saliva (passive drool)",
    scheduledDay: 45,
    collectionTime: null,
    storageCondition: "Pending collection",
    stage: "Scheduled",
    notes: "Routine post-EVA cycle immune stress sampling per MED-2.7 protocol.",
  },
  {
    id: "BLD-049-C",
    sampleType: "Capillary blood fingerstick",
    scheduledDay: 49,
    collectionTime: null,
    storageCondition: "Pending collection",
    stage: "Scheduled",
    notes: "Monthly immune cell differential check.",
  },
]

const STAGE_ORDER: SampleStage[] = [
  "Scheduled",
  "Collected",
  "Stored",
  "Submitted",
  "Processing",
  "Result received",
  "Reviewed",
]

export default function Immune() {
  const day = 42
  const { data: ev } = useEvaluation(day)
  const a = useModuleAlert("immune")

  const [samples, setSamples] = useState<ImmuneSample[]>(INITIAL_SAMPLES)
  const [selectedSampleId, setSelectedSampleId] = useState<string>(INITIAL_SAMPLES[0].id)
  const [showLogModal, setShowLogModal] = useState(false)

  // New Sample Form State
  const [newType, setNewType] = useState<ImmuneSample["sampleType"]>("Saliva (passive drool)")
  const [newDay, setNewDay] = useState<number>(day + 3)
  const [newNotes, setNewNotes] = useState("")

  const activeSample = samples.find((s) => s.id === selectedSampleId) || samples[0]

  const advanceStage = (id: string) => {
    setSamples((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s
        const currIndex = STAGE_ORDER.indexOf(s.stage)
        if (currIndex >= STAGE_ORDER.length - 1) return s
        const nextStage = STAGE_ORDER[currIndex + 1]

        let updatedStorage = s.storageCondition
        let updatedTime = s.collectionTime

        if (nextStage === "Collected") {
          updatedTime = new Date().toISOString()
          updatedStorage = "-20°C Storage"
        } else if (nextStage === "Stored") {
          updatedStorage = "-80°C MELFI Freezer"
        }

        return {
          ...s,
          stage: nextStage,
          collectionTime: updatedTime,
          storageCondition: updatedStorage,
        }
      })
    )
  }

  const handleCreateSample = (e: React.FormEvent) => {
    e.preventDefault()
    const newId = `SMP-${Math.floor(100 + Math.random() * 900)}`
    const created: ImmuneSample = {
      id: newId,
      sampleType: newType,
      scheduledDay: newDay,
      collectionTime: null,
      storageCondition: "Pending collection",
      stage: "Scheduled",
      notes: newNotes || "Scheduled operational sample collection.",
    }
    setSamples((prev) => [...prev, created])
    setSelectedSampleId(newId)
    setShowLogModal(false)
    setNewNotes("")
  }

  return (
    <ModuleShell title={["Saliva & Immune", "Monitoring"]}>
      {/* Overview Card */}
      <Card className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="label font-semibold text-ink">NASA Artemis II Saliva Biomarker Protocol</span>
          <SourceChip kind="nasa" label="NASA Immunology Lab" />
        </div>
        <p className="text-[14px] leading-relaxed text-label">
          In spaceflight, psychological stress and microgravity alter cellular immunity, potentially leading to subclinical latent viral reactivation (Epstein–Barr virus, Varicella-zoster virus). Non-invasive saliva sampling tracks salivary cortisol, mucosal secretory IgA, and viral shedding before clinical symptoms appear.
        </p>
      </Card>

      {/* Sample Workflow Pipeline Tracker */}
      <Card className="p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
          <div>
            <div className="label">Sample Lifecycle Management</div>
            <h3 className="text-[18px] font-semibold text-ink">
              Sample {activeSample.id} · <span className="font-normal text-label">{activeSample.sampleType}</span>
            </h3>
          </div>
          <button
            onClick={() => setShowLogModal(true)}
            className="inline-flex items-center gap-1.5 rounded-full bg-cyan-600 px-4 py-1.5 text-[13px] font-medium text-white hover:opacity-90 transition-opacity"
          >
            <Plus className="size-4" /> Schedule New Sample
          </button>
        </div>

        {/* Workflow Stages Chevron Strip */}
        <div className="overflow-x-auto pb-1">
          <div className="flex items-center min-w-[620px] gap-1">
            {STAGE_ORDER.map((stage, idx) => {
              const currIdx = STAGE_ORDER.indexOf(activeSample.stage)
              const isPast = idx < currIdx
              const isCurrent = idx === currIdx

              return (
                <div key={stage} className="flex-1 flex items-center">
                  <div
                    className={`flex-1 rounded-xl py-2 px-2.5 text-center text-[12px] font-semibold transition-all ${
                      isCurrent
                        ? "liquid-glass-dark text-white shadow-xs"
                        : isPast
                        ? "bg-signal/20 text-signal border border-signal/30"
                        : "liquid-glass-clear text-label/60"
                    }`}
                  >
                    {stage}
                  </div>
                  {idx < STAGE_ORDER.length - 1 && (
                    <ArrowRight className="size-3.5 mx-1 text-label shrink-0 opacity-40" />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Selected Sample Information & Actions */}
        <div className="rounded-2xl liquid-glass-clear p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-[13px]">
          <div>
            <span className="text-label text-[11px] uppercase">Storage Status</span>
            <div className="font-medium text-ink flex items-center gap-1.5 mt-0.5">
              <ThermometerSnowflake className="size-4 text-accent" />
              {activeSample.storageCondition}
            </div>
          </div>
          <div>
            <span className="text-label text-[11px] uppercase">Collection Timestamp</span>
            <div className="font-medium text-ink mt-0.5">
              {activeSample.collectionTime
                ? new Date(activeSample.collectionTime).toLocaleString()
                : "Awaiting collection"}
            </div>
          </div>
          <div className="flex items-end justify-start sm:justify-end">
            {activeSample.stage !== "Reviewed" ? (
              <button
                onClick={() => advanceStage(activeSample.id)}
                className="rounded-full liquid-glass-dark px-4 py-1.5 text-[12.5px] font-medium text-white hover:bg-border-strong transition-colors"
              >
                Advance to: {STAGE_ORDER[STAGE_ORDER.indexOf(activeSample.stage) + 1]}
              </button>
            ) : (
              <span className="inline-flex items-center gap-1 font-semibold text-signal text-[12.5px]">
                <CheckCircle2 className="size-4" /> Protocol Reviewed
              </span>
            )}
          </div>
        </div>

        {/* Returned Laboratory Biomarkers View */}
        {activeSample.biomarkers ? (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="label !text-ink font-bold">Returned Lab Measurements: {activeSample.id}</div>
              <span className="text-[11.5px] text-signal font-semibold">Quality Verified</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[13.5px]">
              <div className="rounded-xl border border-border p-3.5 liquid-glass-clear space-y-1">
                <div className="flex justify-between items-baseline">
                  <span className="text-label font-medium">Salivary Cortisol</span>
                  <span className="font-semibold text-ink tabular-nums">
                    {activeSample.biomarkers.salivaryCortisol?.value} {activeSample.biomarkers.salivaryCortisol?.unit}
                  </span>
                </div>
                <div className="text-[12px] text-label">{activeSample.biomarkers.salivaryCortisol?.baselineRef}</div>
              </div>

              <div className="rounded-xl border border-border p-3.5 liquid-glass-clear space-y-1">
                <div className="flex justify-between items-baseline">
                  <span className="text-label font-medium">Secretory IgA (sIgA)</span>
                  <span className="font-semibold text-ink tabular-nums">
                    {activeSample.biomarkers.sIgA?.value} {activeSample.biomarkers.sIgA?.unit}
                  </span>
                </div>
                <div className="text-[12px] text-label">{activeSample.biomarkers.sIgA?.baselineRef}</div>
              </div>

              <div className="rounded-xl border border-border p-3.5 liquid-glass-clear space-y-1">
                <div className="flex justify-between items-baseline">
                  <span className="text-label font-medium">VZV Latent DNA Copies</span>
                  <span className="font-semibold text-signal tabular-nums">
                    {activeSample.biomarkers.vzvDnaCopies?.value} {activeSample.biomarkers.vzvDnaCopies?.unit}
                  </span>
                </div>
                <div className="text-[12px] text-label">{activeSample.biomarkers.vzvDnaCopies?.baselineRef}</div>
              </div>

              <div className="rounded-xl border border-border p-3.5 liquid-glass-clear space-y-1">
                <div className="flex justify-between items-baseline">
                  <span className="text-label font-medium">EBV Latent DNA Copies</span>
                  <span className="font-semibold text-signal tabular-nums">
                    {activeSample.biomarkers.ebvDnaCopies?.value} {activeSample.biomarkers.ebvDnaCopies?.unit}
                  </span>
                </div>
                <div className="text-[12px] text-label">{activeSample.biomarkers.ebvDnaCopies?.baselineRef}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border p-5 text-center text-[13.5px] text-label space-y-1">
            <Clock className="size-6 mx-auto text-label/60" />
            <div className="font-semibold text-ink">Laboratory Biomarkers Pending</div>
            <p className="text-[12.5px]">
              {activeSample.stage === "Scheduled"
                ? "Sample collection is scheduled for Day " + activeSample.scheduledDay + ". Complete collection before lab submission."
                : "Sample has been collected and logged. Results will populate once laboratory PCR / ELISA assays are completed."}
            </p>
          </div>
        )}
      </Card>

      {/* Sample History Registry */}
      <Card className="p-5 space-y-3">
        <div className="label">Sample Inventory & History ({samples.length} logged)</div>
        <div className="divide-y divide-border">
          {samples.map((s) => (
            <div
              key={s.id}
              onClick={() => setSelectedSampleId(s.id)}
              className={`py-3 px-3 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                s.id === activeSample.id ? "liquid-glass-clear" : "hover:liquid-glass-clear/50"
              }`}
            >
              <div className="space-y-0.5">
                <div className="font-semibold text-[14px] text-ink">{s.id} · {s.sampleType}</div>
                <div className="text-[12px] text-label">
                  Day {s.scheduledDay} · {s.notes}
                </div>
              </div>
              <div className="text-right">
                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                  s.stage === "Result received" || s.stage === "Reviewed"
                    ? "bg-signal/15 text-signal"
                    : s.stage === "Scheduled"
                    ? "bg-border text-label"
                    : "bg-accent/15 text-accent"
                }`}>
                  {s.stage}
                </span>
                <div className="text-[11px] text-label mt-0.5">{s.storageCondition}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Schedule Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-nav/60 backdrop-blur-xs">
          <form
            onSubmit={handleCreateSample}
            className="w-full max-w-md rounded-[32px] liquid-glass-clear p-6 shadow-2xl border border-border space-y-4"
          >
            <h3 className="text-[18px] font-semibold text-ink">Schedule New Immune Sample</h3>

            <div>
              <label className="label mb-1 block">Sample Collection Protocol</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as any)}
                className="w-full rounded-2xl border border-border liquid-glass-clear px-4 py-2 text-[14px] text-ink"
              >
                <option value="Saliva (passive drool)">Saliva (passive drool - Cryovial)</option>
                <option value="Saliva (synthetic swab)">Saliva (Salivette synthetic swab)</option>
                <option value="Capillary blood fingerstick">Capillary blood fingerstick</option>
              </select>
            </div>

            <div>
              <label className="label mb-1 block">Scheduled Mission Day</label>
              <input
                type="number"
                min={day}
                max={183}
                value={newDay}
                onChange={(e) => setNewDay(Number(e.target.value))}
                className="w-full rounded-2xl border border-border liquid-glass-clear px-4 py-2 text-[14px] text-ink"
              />
            </div>

            <div>
              <label className="label mb-1 block">Protocol Notes / Context</label>
              <textarea
                rows={3}
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="e.g. Pre-sleep saliva collection following EVA prep..."
                className="w-full rounded-2xl border border-border liquid-glass-clear p-3 text-[13.5px] text-ink"
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowLogModal(false)}
                className="rounded-full px-4 py-2 text-[13px] text-label hover:text-ink"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-full liquid-glass-dark px-5 py-2 text-[13px] font-semibold text-white hover:bg-border-strong"
              >
                Schedule Sample
              </button>
            </div>
          </form>
        </div>
      )}
    </ModuleShell>
  )
}



