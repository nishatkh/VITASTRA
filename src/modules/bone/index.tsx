import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import {
  Wrench,
  Plus,
  Dumbbell,
  CheckCircle2,
  AlertTriangle,
  Info,
  Calendar,
  Activity,
  Flame,
} from "lucide-react"
import {
  ModuleShell,
  StatusRow,
  NextActions,
  useModuleAlert,
} from "../../components/Layout"
import { DotNum } from "../../components/DotNum"
import { SourceChip, Card } from "../../components/ui"
import { BarSeries, DonutGraph, CHART_COLORS } from "../../components/Analytics"
import { useEvaluation, useExerciseOutages, useLogOutage, useClearOutages } from "../../api/hooks"
import { useApp } from "../../store/useApp"
import type { Level } from "../../data/types"

export interface ExerciseLog {
  id: string
  day: number
  device: "ARED" | "T2 treadmill" | "CEVIS cycle"
  durationMin: number
  plannedMin: number
  loadKg: number
  sets: number
  reps: number
  completed: boolean
  machineDegraded: boolean
  notes: string
}

const INITIAL_LOGS: ExerciseLog[] = [
  {
    id: "ex-42",
    day: 42,
    device: "ARED",
    durationMin: 90,
    plannedMin: 90,
    loadKg: 185,
    sets: 6,
    reps: 12,
    completed: true,
    machineDegraded: false,
    notes: "Deadlift & squat protocol completed. Peak mechanical load achieved.",
  },
  {
    id: "ex-41",
    day: 41,
    device: "CEVIS cycle",
    durationMin: 45,
    plannedMin: 45,
    loadKg: 140,
    sets: 1,
    reps: 1,
    completed: true,
    machineDegraded: false,
    notes: "Interval zone 3 aerobic conditioning.",
  },
  {
    id: "ex-40",
    day: 40,
    device: "T2 treadmill",
    durationMin: 30,
    plannedMin: 45,
    loadKg: 70,
    sets: 1,
    reps: 1,
    completed: true,
    machineDegraded: true,
    notes: "Vibration isolation motor reported speed sensor drift; session halted early.",
  },
  {
    id: "ex-39",
    day: 39,
    device: "ARED",
    durationMin: 85,
    plannedMin: 90,
    loadKg: 175,
    sets: 5,
    reps: 10,
    completed: true,
    machineDegraded: false,
    notes: "Upper body and heel raise protocol.",
  },
]

export default function Bone() {
  const day = useApp((s) => s.day)
  const { data: ev } = useEvaluation(day)
  const alert = useModuleAlert("bone")
  const { data: outagesData } = useExerciseOutages()
  const outages = outagesData ?? []
  const logOutage = useLogOutage()
  const clearOutages = useClearOutages()

  const [logs, setLogs] = useState<ExerciseLog[]>(INITIAL_LOGS)
  const [showLogModal, setShowLogModal] = useState(false)
  const [showOutageModal, setShowOutageModal] = useState(false)

  // New Exercise Form State
  const [dev, setDev] = useState<ExerciseLog["device"]>("ARED")
  const [dur, setDur] = useState(90)
  const [load, setLoad] = useState(180)
  const [sets, setSets] = useState(5)
  const [reps, setReps] = useState(10)
  const [notes, setNotes] = useState("")

  // Outage form state
  const [outageMachine, setOutageMachine] = useState("T2 treadmill")
  const [outageDays, setOutageDays] = useState(2)

  // Countermeasure Delivery Score Calculation
  // Transparent rule: Sum of delivered load-adjusted minutes vs planned load-adjusted minutes
  const totalPlannedMin = logs.reduce((acc, l) => acc + l.plannedMin, 0)
  const totalDeliveredMin = logs.reduce((acc, l) => acc + (l.completed ? l.durationMin : 0), 0)
  const adherenceScore = totalPlannedMin > 0 ? Math.round((totalDeliveredMin / totalPlannedMin) * 100) : 100

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault()
    const newEntry: ExerciseLog = {
      id: `ex-${Date.now()}`,
      day: day + 1,
      device: dev,
      durationMin: dur,
      plannedMin: dev === "ARED" ? 90 : 45,
      loadKg: load,
      sets,
      reps,
      completed: true,
      machineDegraded: false,
      notes: notes || "Logged session on board.",
    }
    setLogs((prev) => [newEntry, ...prev])
    setShowLogModal(false)
    setNotes("")
  }

  const handleAddOutage = (e: React.FormEvent) => {
    e.preventDefault()
    logOutage.mutate({
      machine: outageMachine,
      day,
      days: outageDays,
    })
    setShowOutageModal(false)
  }

  // ── Countermeasure analytics (derived from session log) ──
  const sessionSeries = useMemo(
    () =>
      [...logs]
        .sort((a, b) => a.day - b.day)
        .map((l) => ({
          day: `D${l.day}`,
          planned: l.plannedMin,
          delivered: l.completed ? l.durationMin : 0,
          load: l.loadKg,
        })),
    [logs],
  )

  const deviceMix = useMemo(() => {
    const by: Record<string, number> = {}
    logs.forEach(
      (l) => (by[l.device] = (by[l.device] ?? 0) + (l.completed ? l.durationMin : 0)),
    )
    const palette = [CHART_COLORS.signal, CHART_COLORS.teal, CHART_COLORS.violet]
    return Object.entries(by).map(([name, value], i) => ({
      name,
      value,
      count: logs.filter((l) => l.device === name).length,
      color: palette[i % palette.length],
    }))
  }, [logs])

  return (
    <ModuleShell title={["Bone & Muscle", "Protection Scorecard"]}>
      {/* Overview & Delivered Load Score */}
      <Card className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="label font-semibold text-ink">Mechanical Countermeasure Delivery Score</span>
          <SourceChip kind="nasa" label="NASA HRP Bone Laboratory" />
        </div>

        <div className="flex items-baseline gap-4 my-2">
          <DotNum value={adherenceScore} unit="% load delivery" size={84} />
          <div className="text-[14px] text-label leading-snug">
            <div className="font-semibold text-ink">Documented Protection Ratio</div>
            <div>{totalDeliveredMin} delivered of {totalPlannedMin} planned minutes.</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-2.5 overflow-hidden rounded-full bg-border" role="progressbar" aria-valuenow={adherenceScore}>
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              adherenceScore >= 85 ? "bg-signal" : adherenceScore >= 70 ? "bg-accent" : "bg-warning"
            }`}
            style={{ width: `${Math.min(100, adherenceScore)}%` }}
          />
        </div>

        {/* Mandatory Scientific Disclaimer */}
        <div className="rounded-2xl border border-warning/30 bg-warning/5 p-4 text-[13px] text-label space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-warning">
            <Info className="size-4 shrink-0" />
            Scientific Accuracy Requirement:
          </div>
          <p>
            This countermeasure scorecard tracks <strong>delivered mechanical load and equipment availability</strong>. Exercise logs do not directly measure in vivo bone mineral density (BMD). True osteological change requires clinical Dual-Energy X-Ray Absorptiometry (DXA) or Quantitative Computed Tomography (QCT). VITASTRA does not calculate individual bone loss without validated radiological scans.
          </p>
        </div>
      </Card>

      {/* Session Delivery Analytics */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="label font-semibold text-ink">Session Delivery Analytics</span>
          <SourceChip kind="synthetic" label="Derived from session log" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] items-start gap-4">
          <BarSeries
            data={sessionSeries}
            xKey="day"
            keys={["planned", "delivered"]}
            names={["Planned min", "Delivered min"]}
            colors={[CHART_COLORS.label, CHART_COLORS.signal]}
            unit="min"
            ariaLabel={`Planned versus delivered exercise minutes per session across ${sessionSeries.length} logged sessions. Legend: planned minutes and delivered minutes.`}
          />

          <div className="flex flex-col items-center gap-2">
            <DonutGraph
              segments={deviceMix.map((d) => ({ value: d.value, color: d.color }))}
              centerValue={`${deviceMix.length}`}
              centerLabel="Devices"
              ariaLabel={`Distribution of delivered exercise minutes by device: ${deviceMix
                .map((d) => `${d.name} ${d.value} minutes`)
                .join(", ")}.`}
            />
            <ul className="flex flex-col gap-1 text-[11.5px] text-label">
              {deviceMix.map((d) => (
                <li key={d.name} className="flex items-center gap-1.5">
                  <i className="h-2.5 w-3.5 rounded-sm" style={{ background: d.color }} />
                  <span className="text-ink font-semibold">{d.value}</span> min · {d.count} session{d.count === 1 ? "" : "s"}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="text-[12px] leading-snug text-label">
          Mechanical load is tracked per session. Shortfalls (delivered bars under planned bars) show where protective
          stimulus was reduced — the driver behind the score above. This remains a delivery proxy, not a direct BMD
          measurement.
        </p>
      </Card>

      {/* Equipment Outage & Degradation Tracker */}
      <Card className="p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
          <div>
            <div className="label">Countermeasure Hardware Reality Check</div>
            <h3 className="text-[18px] font-semibold text-ink">Equipment Outages & Interruptions</h3>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowOutageModal(true)}
              className="inline-flex items-center gap-1.5 rounded-full liquid-glass-clear px-4 py-1.5 text-[12.5px] font-medium text-ink hover:bg-border transition-colors"
            >
              <Wrench className="size-3.5" /> Log Machine Outage
            </button>
            <button
              onClick={() => setShowLogModal(true)}
              className="inline-flex items-center gap-1.5 rounded-full bg-cyan-600 px-4 py-1.5 text-[12.5px] font-medium text-white hover:opacity-90 transition-opacity"
            >
              <Plus className="size-3.5" /> Log Session
            </button>
          </div>
        </div>

        {outages.length > 0 ? (
          <div className="space-y-2">
            {outages.map((o) => (
              <div
                key={o.id}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-warning/10 border border-warning/20 text-[13.5px]"
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className="size-5 text-warning shrink-0" />
                  <div>
                    <span className="font-semibold text-ink">{o.machine}</span>
                    <span className="text-label ml-2">({o.days}-day outage starting Day {o.day})</span>
                  </div>
                </div>
                <span className="text-[12px] font-semibold text-warning">Protective Load Suspended</span>
              </div>
            ))}
            <div className="text-right">
              <button
                onClick={() => clearOutages.mutate()}
                className="text-[12px] text-label hover:text-ink underline"
              >
                Clear resolved outages
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl liquid-glass-clear p-4 flex items-center gap-3 text-[13.5px] text-label">
            <CheckCircle2 className="size-5 text-signal shrink-0" />
            <span>All primary countermeasure devices (ARED, T2 Treadmill, CEVIS Cycle) are fully operational.</span>
          </div>
        )}
      </Card>

      {/* Session Log Registry */}
      <Card className="p-5 space-y-3">
        <div className="label">Logged Exercise Countermeasure Sessions ({logs.length})</div>
        <div className="divide-y divide-border">
          {logs.map((l) => (
            <div key={l.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[14.5px] text-ink">{l.device}</span>
                  <span className="text-[11.5px] rounded-full liquid-glass-clear px-2.5 py-0.5 text-label font-mono">
                    Day {l.day}
                  </span>
                  {l.machineDegraded && (
                    <span className="rounded-full bg-warning/15 px-2 py-0.5 text-[11px] font-semibold text-warning">
                      Degraded Hardware
                    </span>
                  )}
                </div>
                <div className="text-[13px] text-label mt-1">{l.notes}</div>
              </div>

              <div className="text-right text-[13px]">
                <div className="font-medium text-ink tabular-nums">
                  {l.durationMin} min · {l.loadKg} kg load
                </div>
                <div className="text-[11.5px] text-label">
                  {l.sets} sets × {l.reps} reps
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Add Session Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-nav/60 backdrop-blur-xs">
          <form
            onSubmit={handleAddLog}
            className="w-full max-w-md rounded-[32px] liquid-glass-clear p-6 shadow-2xl border border-border space-y-4"
          >
            <h3 className="text-[18px] font-semibold text-ink">Log Exercise Countermeasure</h3>

            <div>
              <label className="label mb-1 block">Exercise Device</label>
              <select
                value={dev}
                onChange={(e) => setDev(e.target.value as any)}
                className="w-full rounded-2xl border border-border liquid-glass-clear px-4 py-2 text-[14px] text-ink"
              >
                <option value="ARED">ARED (Advanced Resistive Exercise Device)</option>
                <option value="T2 treadmill">T2 Treadmill (Vibration Isolation)</option>
                <option value="CEVIS cycle">CEVIS Cycle Ergometer</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label mb-1 block">Duration (min)</label>
                <input
                  type="number"
                  min={10}
                  max={180}
                  value={dur}
                  onChange={(e) => setDur(Number(e.target.value))}
                  className="w-full rounded-2xl border border-border liquid-glass-clear px-4 py-2 text-[14px] text-ink"
                />
              </div>
              <div>
                <label className="label mb-1 block">Load / Resistance (kg)</label>
                <input
                  type="number"
                  min={20}
                  max={300}
                  value={load}
                  onChange={(e) => setLoad(Number(e.target.value))}
                  className="w-full rounded-2xl border border-border liquid-glass-clear px-4 py-2 text-[14px] text-ink"
                />
              </div>
            </div>

            <div>
              <label className="label mb-1 block">Session Performance Notes</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="RPE, mechanical feedback, cable tension notes..."
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
                className="rounded-full liquid-glass-dark px-5 py-2 text-[13px] font-semibold text-white"
              >
                Save Session
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Outage Modal */}
      {showOutageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-nav/60 backdrop-blur-xs">
          <form
            onSubmit={handleAddOutage}
            className="w-full max-w-md rounded-[32px] liquid-glass-clear p-6 shadow-2xl border border-border space-y-4"
          >
            <h3 className="text-[18px] font-semibold text-ink">Record Equipment Outage</h3>

            <div>
              <label className="label mb-1 block">Affected Hardware</label>
              <select
                value={outageMachine}
                onChange={(e) => setOutageMachine(e.target.value)}
                className="w-full rounded-2xl border border-border liquid-glass-clear px-4 py-2 text-[14px] text-ink"
              >
                <option value="ARED">ARED (Advanced Resistive Exercise Device)</option>
                <option value="T2 treadmill">T2 Treadmill</option>
                <option value="CEVIS cycle">CEVIS Cycle Ergometer</option>
              </select>
            </div>

            <div>
              <label className="label mb-1 block">Estimated Outage Duration (days)</label>
              <input
                type="number"
                min={1}
                max={30}
                value={outageDays}
                onChange={(e) => setOutageDays(Number(e.target.value))}
                className="w-full rounded-2xl border border-border liquid-glass-clear px-4 py-2 text-[14px] text-ink"
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowOutageModal(false)}
                className="rounded-full px-4 py-2 text-[13px] text-label hover:text-ink"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-full bg-warning px-5 py-2 text-[13px] font-semibold text-white"
              >
                Log Outage
              </button>
            </div>
          </form>
        </div>
      )}
    </ModuleShell>
  )
}



