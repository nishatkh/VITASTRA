import { useState } from "react"
import { Link } from "react-router"
import {
  CalendarCheck,
  Clock,
  Eye,
  Brain,
  Zap,
  Activity,
  Moon,
  FlaskConical,
  Heart,
  Dumbbell,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Plus,
  Info,
} from "lucide-react"
import { ModuleShell } from "../../components/Layout"
import { Card, Title, SourceChip } from "../../components/ui"
import { useEvaluation } from "../../api/hooks"
import { useApp } from "../../store/useApp"

export interface ScheduledCheck {
  id: string
  title: string
  category:
    | "Vision & SANS"
    | "Cognitive Performance"
    | "Reaction Time"
    | "Balance & Posture"
    | "Sleep Architecture"
    | "Immune Saliva"
    | "Cardiovascular Recovery"
    | "Exercise Load"
  icon: any
  recurrence: "Daily" | "Weekly" | "Bi-weekly" | "Monthly"
  dueDay: number
  completed: boolean
  lastCompletedDate?: string
  lastResult?: string
  baselineComparison?: string
  relevanceRationale: string
  route?: string
}

const INITIAL_SCHEDULED_CHECKS: ScheduledCheck[] = [
  {
    id: "chk-vis",
    title: "Near & Distance Visual Acuity Check (LogMAR)",
    category: "Vision & SANS",
    icon: Eye,
    recurrence: "Weekly",
    dueDay: 42,
    completed: true,
    lastCompletedDate: "Day 42 · 09:15 UTC",
    lastResult: "20/20 (0.00 logMAR)",
    baselineComparison: "Within personal baseline (0.00 ± 0.05 logMAR)",
    relevanceRationale: "Cephalad fluid shift causes choroidal engorgement and optic disc edema without acute discomfort. Regular acuity tracking catches SANS progression early.",
    route: "/vision",
  },
  {
    id: "chk-pvt",
    title: "Psychomotor Vigilance Test (PVT Reaction Speed)",
    category: "Reaction Time",
    icon: Zap,
    recurrence: "Daily",
    dueDay: 43,
    completed: false,
    lastCompletedDate: "Day 41 · 20:30 UTC",
    lastResult: "242 ms median",
    baselineComparison: "Matches preflight baseline (245 ± 18 ms)",
    relevanceRationale: "Micro-lapses in attention from sleep deprivation or elevated cabin CO2 manifest as reaction latency spikes before conscious fatigue is recognized.",
    route: "/cognitive/test",
  },
  {
    id: "chk-bal",
    title: "Static Postural Balance & Vestibular Sway",
    category: "Balance & Posture",
    icon: Activity,
    recurrence: "Bi-weekly",
    dueDay: 44,
    completed: false,
    lastCompletedDate: "Day 30 · 11:00 UTC",
    lastResult: "93.4% stability",
    baselineComparison: "Nominal vestibular adaptation",
    relevanceRationale: "Otolith reinterpretation in microgravity modifies proprioception. Testing eyes-closed postural sway provides early indication of sensorimotor drift.",
    route: "/cognitive",
  },
  {
    id: "chk-cog",
    title: "Executive Cognitive Battery (Dual-Task Working Memory)",
    category: "Cognitive Performance",
    icon: Brain,
    recurrence: "Monthly",
    dueDay: 40,
    completed: false, // Overdue check demonstration
    lastCompletedDate: "Day 10 · 14:00 UTC",
    lastResult: "96% accuracy",
    baselineComparison: "Within baseline",
    relevanceRationale: "Evaluates executive decision-making under confinement stress. Overdue status indicates operational scheduling conflict, NOT an abnormal medical result.",
    route: "/cognitive",
  },
  {
    id: "chk-slp",
    title: "Sleep Architecture & Actigraphy Review",
    category: "Sleep Architecture",
    icon: Moon,
    recurrence: "Daily",
    dueDay: 42,
    completed: true,
    lastCompletedDate: "Day 42 · 07:00 UTC",
    lastResult: "7.1 hours · 86% efficiency",
    baselineComparison: "Nominal recovery",
    relevanceRationale: "Objective actigraphy differentiates true restorative sleep from lying awake in the sleeping berth.",
    route: "/mood",
  },
  {
    id: "chk-imm",
    title: "Salivary Cortisol & Viral Shedding Collection",
    category: "Immune Saliva",
    icon: FlaskConical,
    recurrence: "Bi-weekly",
    dueDay: 45,
    completed: false,
    lastCompletedDate: "Day 31 · 06:45 UTC",
    lastResult: "Cortisol 0.38 ug/dL · EBV/VZV negative",
    baselineComparison: "Within baseline",
    relevanceRationale: "Subclinical latent virus reactivation (EBV/VZV) acts as a sensitive sensor for immune suppression before clinical illness occurs.",
    route: "/immune",
  },
  {
    id: "chk-cv",
    title: "Heart Rate Recovery (1-minute post-exercise HRR)",
    category: "Cardiovascular Recovery",
    icon: Heart,
    recurrence: "Weekly",
    dueDay: 42,
    completed: true,
    lastCompletedDate: "Day 42 · 16:30 UTC",
    lastResult: "38 bpm drop at 60s",
    baselineComparison: "Within baseline (38 ± 5 bpm)",
    relevanceRationale: "Delayed autonomic vagal reactivation indicates cumulative cardiac or thermal strain.",
    route: "/body",
  },
  {
    id: "chk-ex",
    title: "ARED Mechanical Load Adherence Audit",
    category: "Exercise Load",
    icon: Dumbbell,
    recurrence: "Daily",
    dueDay: 42,
    completed: true,
    lastCompletedDate: "Day 42 · 15:00 UTC",
    lastResult: "185 kg · 90 min completed",
    baselineComparison: "Target met",
    relevanceRationale: "Verifies daily mechanical strain delivery required to counteract progressive cancellous bone demineralization.",
    route: "/bone",
  },
]

export default function Scheduler() {
  const day = useApp((s) => s.day)
  const currentMissionDay = 42
  const [checks, setChecks] = useState<ScheduledCheck[]>(INITIAL_SCHEDULED_CHECKS)
  const [filterCategory, setFilterCategory] = useState<string>("All")

  const toggleComplete = (id: string) => {
    setChecks((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c
        const nowCompleted = !c.completed
        return {
          ...c,
          completed: nowCompleted,
          lastCompletedDate: nowCompleted ? `Day ${currentMissionDay} · Just now` : c.lastCompletedDate,
          lastResult: nowCompleted && !c.lastResult ? "Recorded nominal" : c.lastResult,
        }
      })
    )
  }

  const completedCount = checks.filter((c) => c.completed).length
  const overdueChecks = checks.filter((c) => !c.completed && c.dueDay < currentMissionDay)

  const displayedChecks = filterCategory === "All"
    ? checks
    : checks.filter((c) => c.category === filterCategory)

  return (
    <ModuleShell title={["Silent-Signal", "Scheduler"]}>
      {/* Overview & Rule Banner */}
      <Card className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="label font-semibold text-ink">Scheduled Preventive Surveillance</span>
          <SourceChip kind="nasa" label="NASA Flight Medicine" />
        </div>
        <p className="text-[14px] leading-relaxed text-label">
          Biological adaptations in microgravity—such as early optic disc swelling (SANS), vestibular sensory recalibration, and latent viral reactivation—develop silently without conscious pain. Scheduled assessments catch subtle drifts before acute clinical failure.
        </p>

        {/* Scientific Rule Alert */}
        <div className="rounded-2xl border border-border bg-raised p-4 text-[13px] text-label space-y-1">
          <div className="font-semibold text-ink flex items-center gap-1.5">
            <Info className="size-4 text-accent" />
            Surveillance Principle:
          </div>
          <p>
            An overdue check reflects an operational crew scheduling delay, <strong>never an abnormal medical result</strong>. An assessment is recorded only when measurements have actually been executed and verified.
          </p>
        </div>
      </Card>

      {/* Overdue Notification Banner if any */}
      {overdueChecks.length > 0 && (
        <div className="rounded-[24px] border border-warning/40 bg-warning/10 p-4 sm:p-5 flex items-start gap-3.5">
          <AlertCircle className="size-5 text-warning shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-semibold text-[15px] text-ink">
              {overdueChecks.length} Scheduled Assessment Overdue
            </div>
            <p className="text-[13px] text-label leading-relaxed">
              {overdueChecks.map((o) => o.title).join(", ")}. Please reschedule or complete these checks when mission workload allows.
            </p>
          </div>
        </div>
      )}

      {/* Completion Metric Strip */}
      <Card className="p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="label">Surveillance Adherence Rate</div>
          <div className="text-[26px] font-semibold text-ink tabular-nums">
            {completedCount} of {checks.length} Completed{" "}
            <span className="text-[15px] font-normal text-label">
              ({Math.round((completedCount / checks.length) * 100)}%)
            </span>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-1.5">
          {["All", "Vision & SANS", "Reaction Time", "Balance & Posture", "Immune Saliva"].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`rounded-full px-3 py-1 text-[12px] font-medium transition-colors ${
                filterCategory === cat
                  ? "bg-ink text-canvas"
                  : "bg-raised text-label hover:text-ink"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </Card>

      {/* Assessment Checks Grid */}
      <div className="space-y-3">
        {displayedChecks.map((chk) => {
          const Icon = chk.icon
          const isOverdue = !chk.completed && chk.dueDay < currentMissionDay

          return (
            <div
              key={chk.id}
              className={`rounded-[24px] border p-4 sm:p-5 transition-all ${
                chk.completed
                  ? "border-signal/30 bg-surface shadow-xs"
                  : isOverdue
                  ? "border-warning/40 bg-warning/5"
                  : "border-border bg-surface hover:border-border-strong"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start gap-3.5">
                  <span className={`p-2.5 rounded-2xl shrink-0 ${
                    chk.completed ? "bg-signal/15 text-signal" : "bg-raised text-ink"
                  }`}>
                    <Icon className="size-5" />
                  </span>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11.5px] uppercase font-mono font-semibold text-label">
                        {chk.category} · {chk.recurrence}
                      </span>
                      {chk.completed ? (
                        <span className="rounded-full bg-signal/15 px-2.5 py-0.5 text-[11px] font-semibold text-signal flex items-center gap-1">
                          <CheckCircle2 className="size-3" /> Completed
                        </span>
                      ) : isOverdue ? (
                        <span className="rounded-full bg-warning/20 px-2.5 py-0.5 text-[11px] font-semibold text-warning flex items-center gap-1">
                          <Clock className="size-3" /> Overdue (Day {chk.dueDay})
                        </span>
                      ) : (
                        <span className="rounded-full bg-border px-2.5 py-0.5 text-[11px] font-medium text-label">
                          Due Day {chk.dueDay}
                        </span>
                      )}
                    </div>

                    <h3 className="text-[16px] sm:text-[17px] font-semibold text-ink leading-snug">
                      {chk.title}
                    </h3>

                    <p className="text-[13px] text-label leading-relaxed">
                      {chk.relevanceRationale}
                    </p>

                    {chk.lastCompletedDate && (
                      <div className="text-[12px] text-label pt-1 flex flex-wrap gap-3">
                        <span><strong>Last result:</strong> {chk.lastResult}</span>
                        <span><strong>Status:</strong> {chk.baselineComparison}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-border">
                  <button
                    onClick={() => toggleComplete(chk.id)}
                    className={`rounded-full px-4 py-1.5 text-[12.5px] font-medium transition-colors ${
                      chk.completed
                        ? "bg-raised text-label hover:text-ink"
                        : "bg-ink text-canvas hover:bg-border-strong"
                    }`}
                  >
                    {chk.completed ? "Mark Incomplete" : "Record Assessment"}
                  </button>

                  {chk.route && (
                    <Link
                      to={chk.route}
                      className="text-[12px] text-accent font-medium hover:underline flex items-center gap-0.5"
                    >
                      Open Module <ChevronRight className="size-3" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </ModuleShell>
  )
}
