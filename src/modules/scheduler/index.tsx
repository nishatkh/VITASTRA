import { useState, useMemo } from "react"
import { Link } from "react-router"
import {
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
  Info,
  ChevronRight,
  ChevronDown,
} from "lucide-react"
import { ModuleShell } from "../../components/Layout"
import { Card, Title, SourceChip } from "../../components/ui"
import { DonutGraph, GaugeGraph, CHART_COLORS } from "../../components/Analytics"
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

/** Pulls the mission-day number out of "Day 42 · 09:15 UTC" style strings. */
function lastDoneDay(s?: string): number | null {
  const m = s?.match(/Day (\d+)/)
  return m ? Number(m[1]) : null
}

const INTERVAL_DAYS: Record<ScheduledCheck["recurrence"], number> = {
  Daily: 2,
  Weekly: 7,
  "Bi-weekly": 14,
  Monthly: 30,
}

/** Small cadence-clock ring: how much of the recurrence interval has elapsed. */
function CadenceRing({
  pct,
  center,
  color,
  ariaLabel,
  size = 62,
}: {
  pct: number | null
  center: string
  color: string
  ariaLabel: string
  size?: number
}) {
  const r = (size - 8) / 2
  const c = 2 * Math.PI * r
  const frac = pct == null ? 0 : Math.max(0, Math.min(1, pct))
  return (
    <div role="img" aria-label={ariaLabel} className="relative inline-flex shrink-0">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={6} />
        {frac > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={6}
            strokeLinecap="round"
            strokeDasharray={`${frac * c} ${c}`}
          />
        )}
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold tabular-nums text-ink">
        {center}
      </span>
    </div>
  )
}

export default function Scheduler() {
  const day = useApp((s) => s.day)
  const currentMissionDay = 42
  const [checks, setChecks] = useState<ScheduledCheck[]>(INITIAL_SCHEDULED_CHECKS)
  const [filterCategory, setFilterCategory] = useState<string>("All")
  const [expandedId, setExpandedId] = useState<string | null>(null)

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
  const pendingCount = checks.filter((c) => !c.completed && c.dueDay >= currentMissionDay).length
  const pendingCheckList = checks.filter((c) => !c.completed && c.dueDay >= currentMissionDay)
  const nextUp = [...pendingCheckList].sort((a, b) => a.dueDay - b.dueDay)[0] ?? null

  // ── Surveillance adherence analytics ──
  const adherenceDonut = [
    { value: completedCount, color: CHART_COLORS.signal },
    { value: overdueChecks.length, color: CHART_COLORS.warning },
    { value: pendingCount, color: CHART_COLORS.label },
  ]

  const categoryStats = Array.from(
    checks.reduce((m, c) => {
      const g = m.get(c.category) ?? { total: 0, done: 0 }
      m.set(c.category, { total: g.total + 1, done: g.done + (c.completed ? 1 : 0) })
      return m
    }, new Map<string, { total: number; done: number }>()),
  ).map(([name, s]) => {
    const pct = Math.round((s.done / s.total) * 100)
    return {
      name,
      pct,
      color: pct === 100 ? CHART_COLORS.signal : pct >= 50 ? CHART_COLORS.teal : CHART_COLORS.warning,
    }
  })

  const displayedChecks = useMemo(() => {
    const list = filterCategory === "All"
      ? checks
      : checks.filter((c) => c.category === filterCategory)
    // Visual hierarchy: overdue first, then upcoming (nearest due), then completed.
    const rank = (c: ScheduledCheck) => (c.completed ? 2 : c.dueDay < currentMissionDay ? 0 : 1)
    return [...list].sort((a, b) => {
      const r = rank(a) - rank(b)
      if (r !== 0) return r
      if (rank(a) === 1) return a.dueDay - b.dueDay
      return a.title.localeCompare(b.title)
    })
  }, [checks, filterCategory])

  // ── Next-7-days cadence strip ──
  const cadence = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const missionDay = currentMissionDay + i
      const dueToday = checks.filter(
        (c) => !c.completed && c.dueDay === missionDay,
      )
      const overdueHere = checks.filter(
        (c) => !c.completed && c.dueDay < missionDay,
      ).length
      return { missionDay, dueToday, overdueHere, today: i === 0 }
    })
  }, [checks])

  return (
    <ModuleShell title={["Silent-Signal", "Scheduler"]}>
      {/* Hero: adherence + filters */}
      <Card className="p-5 space-y-5">
        <div className="flex items-center justify-between">
          <span className="label font-semibold text-ink">Scheduled Preventive Surveillance</span>
          <SourceChip kind="nasa" label="NASA Flight Medicine" />
        </div>

        {/* Region 1 — adherence chart (consistent size) | next-up */}
        <div className="grid grid-cols-1 items-center gap-5 md:grid-cols-[auto_minmax(240px,minmax(0,1fr))]">
          <div className="flex shrink-0 items-center gap-4">
            <DonutGraph
              segments={adherenceDonut}
              centerValue={`${Math.round((completedCount / Math.max(1, checks.length)) * 100)}%`}
              centerLabel="Adherence"
              size={112}
              ariaLabel={`Check completion donut: ${completedCount} completed, ${pendingCount} upcoming, ${overdueChecks.length} overdue.`}
            />
            <ul className="flex flex-col gap-1.5 text-[12px] text-label">
              <li className="flex items-center gap-2">
                <i className="h-2.5 w-3.5 shrink-0 rounded-sm" style={{ background: CHART_COLORS.signal }} />
                Completed <span className="font-semibold text-ink">· {completedCount}</span>
              </li>
              <li className="flex items-center gap-2">
                <i className="h-2.5 w-3.5 shrink-0 rounded-sm" style={{ background: CHART_COLORS.label }} />
                Upcoming <span className="font-semibold text-ink">· {pendingCount}</span>
              </li>
              <li className="flex items-center gap-2">
                <i className="h-2.5 w-3.5 shrink-0 rounded-sm" style={{ background: CHART_COLORS.warning }} />
                Overdue <span className="font-semibold text-ink">· {overdueChecks.length}</span>
              </li>
            </ul>
          </div>

          {nextUp && (
            <div className="flex min-w-0 items-center gap-3 rounded-2xl liquid-glass-clear p-3.5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-signal/15 text-signal">
                <Clock className="size-5" strokeWidth={1.6} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[10.5px] uppercase tracking-wider text-label">
                  Next up · Day {nextUp.dueDay}
                </span>
                <span className="block truncate text-[13.5px] font-semibold text-ink" title={nextUp.title}>
                  {nextUp.title}
                </span>
              </span>
            </div>
          )}
        </div>

        {/* Region 2 — explanation, full-width so text is never squeezed into a narrow column */}
        <div className="flex items-start gap-2.5 rounded-2xl border border-border liquid-glass-clear p-4">
          <Info className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
          <p className="min-w-0 flex-1 text-[13px] leading-relaxed text-label">
            Silent signals develop without pain — sensors and scheduled checks drive this cadence, not symptoms. An
            overdue assessment is an{" "}
            <strong className="text-ink">operational scheduling delay, never an abnormal medical result</strong>.
          </p>
        </div>

        {/* Region 3 — filter pills, own full-width row */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-[11px] font-semibold uppercase tracking-wider text-label">Filter</span>
          {["All", "Vision & SANS", "Reaction Time", "Balance & Posture", "Immune Saliva"].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`rounded-full px-3 py-1 text-[12px] font-medium transition-colors ${
                filterCategory === cat
                  ? "liquid-glass-dark text-white"
                  : "liquid-glass-clear text-label hover:text-ink"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Region 4 — overdue notice */}
        {overdueChecks.length > 0 && (
          <div className="flex items-start gap-2.5 rounded-2xl border border-warning/40 bg-warning/10 px-3.5 py-2.5 text-[12.5px]">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-warning" />
            <span className="min-w-0 flex-1 text-label">
              <strong className="text-warning">{overdueChecks.length} overdue</strong> — reschedule when mission workload
              allows: {overdueChecks.map((o) => o.title.split(" (")[0]).join(", ")}.
            </span>
          </div>
        )}
      </Card>

      {/* Coverage Analytics */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="label font-semibold text-ink">Coverage Analytics</span>
          <SourceChip kind="synthetic" />
        </div>

        <div className="space-y-4">
          {/* Analytics rows — three separated zones: label | bar | percentage */}
          <ul className="flex flex-col gap-2.5">
            {categoryStats.map((c) => (
              <li
                key={c.name}
                className="grid grid-cols-[minmax(88px,150px)_minmax(0,1fr)_44px] items-center gap-3 text-[12.5px]"
              >
                <span className="min-w-0 text-label" title={c.name}>
                  {c.name}
                </span>
                <span className="relative h-2 min-w-0 overflow-hidden rounded-full bg-border" role="img" aria-label={`${c.name}: ${c.pct}% complete`}>
                  <span
                    className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                    style={{ width: `${c.pct}%`, background: c.color }}
                  />
                </span>
                <span className="text-right font-semibold tabular-nums text-ink">{c.pct}%</span>
              </li>
            ))}
          </ul>

          {/* Bottom section — coverage gauge + explanation, balanced */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 rounded-2xl liquid-glass-clear p-4">
            <GaugeGraph
              value={completedCount / Math.max(1, checks.length)}
              label="Cycle coverage"
              size={124}
              ariaLabel={`Overall surveillance coverage gauge: ${Math.round((completedCount / Math.max(1, checks.length)) * 100)} percent of scheduled checks completed this cycle.`}
            />
            <p className="min-w-[200px] flex-1 text-[12px] leading-relaxed text-label">
              Coverage is weighted toward daily checks — a missed cadence window breaks the trend continuity the
              baseline engine depends on.
            </p>
          </div>
        </div>
      </Card>

      {/* Cadence Strip — next 7 days */}
      <Card className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="label font-semibold text-ink">Check Cadence · Next 7 Days</span>
          <span className="text-[11px] uppercase tracking-wider text-label">Day {currentMissionDay} → {currentMissionDay + 6}</span>
        </div>

        {/* Fixed-width tiles inside an intentional inner scroll — the card itself never overflows */}
        <div role="list" aria-label="Days with scheduled checks over the next week" className="overflow-x-auto">
          <div className="flex w-max gap-2 px-0.5 py-0.5">
            {cadence.map((c) => {
              const due = c.dueToday.length
              const carried = Math.max(0, c.overdueHere)
              return (
                <div
                  role="listitem"
                  key={c.missionDay}
                  className={`flex w-16 shrink-0 flex-col items-center justify-center gap-1.5 rounded-2xl px-1 py-2.5 text-center ${
                    c.today ? "liquid-glass-dark text-white border border-cyan-400/30" : "liquid-glass-clear"
                  }`}
                >
                  <span className={`label !text-[10px] ${c.today ? "!text-white/80" : "!text-label"}`}>
                    {c.today ? "Today" : `D${c.missionDay}`}
                  </span>
                  <span className="flex h-3.5 items-center justify-center">
                    {due > 0 ? (
                      <span className="flex gap-0.5">
                        {c.dueToday.slice(0, 2).map((d) => (
                          <i
                            key={d.id}
                            className="size-2 rounded-full"
                            style={{ background: CHART_COLORS.signal }}
                          />
                        ))}
                      </span>
                    ) : (
                      <i className="size-2 rounded-full bg-border" />
                    )}
                  </span>
                  <span className={`text-[11px] font-semibold tabular-nums ${c.today ? "text-white" : "text-ink"}`}>
                    {due || carried > 0 ? `${due + Math.min(carried, 2)}` : "—"}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
        <p className="text-[11.5px] text-label">
          Cyan dots mark checks landing on that day; the number includes overdue items still carried. Record the
          assessment on a card below.
        </p>
      </Card>

      {/* Assessment Card Grid */}
      <div
        className="col-span-full grid gap-3"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 300px), 1fr))" }}
      >
        {displayedChecks.map((chk) => {
          const Icon = chk.icon
          const isOverdue = !chk.completed && chk.dueDay < currentMissionDay
          const isOpen = expandedId === chk.id
          const daysAway = chk.dueDay - currentMissionDay

          // Cadence clock: fraction of the recurrence interval consumed since
          // the last recorded result. Completed fresh checks restart near 0.
          const interval = INTERVAL_DAYS[chk.recurrence]
          const lastDay = lastDoneDay(chk.lastCompletedDate)
          const elapsed = lastDay == null ? null : currentMissionDay - lastDay
          const consumed =
            elapsed == null ? null : chk.completed ? Math.max(0, Math.min(1, elapsed / interval)) : Math.max(0, Math.min(1.2, (elapsed + chk.dueDay - currentMissionDay) / interval))
          const ringColor = chk.completed
            ? CHART_COLORS.signal
            : isOverdue
            ? CHART_COLORS.warning
            : (consumed ?? 0) >= 1
            ? CHART_COLORS.amber
            : CHART_COLORS.teal
          const ringCenter = chk.completed
            ? "Done"
            : isOverdue
            ? `+${-daysAway}d`
            : `${daysAway}d`

          // Resolve state once for the whole card
          const state: "done" | "overdue" | "due" = chk.completed
            ? "done"
            : isOverdue
            ? "overdue"
            : "due"
          const STATE = {
            done:    { chip: "bg-signal/15 text-signal",   chipNode: <><CheckCircle2 className="size-3" /> Done</> },
            overdue: { chip: "bg-warning/20 text-warning", chipNode: <><Clock className="size-3" /> Overdue</> },
            due:     { chip: "bg-border text-ink",          chipNode: <>{daysAway}d</> },
          }[state]

          return (
            <Card key={chk.id} className="flex h-full flex-col gap-3 p-4">
              {/* Accent bar — state at a glance */}
              <span
                aria-hidden
                className="h-1 w-full shrink-0 rounded-full opacity-80"
                style={{ background: ringColor }}
              />

              {/* Header — fixed heights for uniform rows */}
              <div className="flex items-start gap-3">
                <span
                  aria-hidden
                  className={`flex size-10 shrink-0 items-center justify-center rounded-2xl ${
                    chk.completed ? "bg-signal/15 text-signal" : isOverdue ? "bg-warning/15 text-warning" : "liquid-glass-clear text-ink"
                  }`}
                >
                  <Icon className="size-5" strokeWidth={1.6} />
                </span>
                <span className="line-clamp-2 min-h-[38px] flex-1 self-stretch text-[14px] font-semibold leading-[1.3] text-ink">
                  {chk.title}
                </span>
                <span
                  className={`inline-flex h-5 shrink-0 items-center gap-1 rounded-full px-2 text-[10.5px] font-semibold ${STATE.chip}`}
                >
                  {STATE.chipNode}
                </span>
              </div>

              {/* Category + recurrence chips */}
              <div className="flex min-w-0 items-center gap-1.5">
                <span className="max-w-[70%] truncate rounded-full liquid-glass-clear px-2.5 py-0.5 text-[10.5px] font-medium text-label">
                  {chk.category}
                </span>
                <span className="shrink-0 rounded-full border border-border px-2.5 py-0.5 text-[10.5px] font-medium text-label">
                  {chk.recurrence}
                </span>
              </div>

              {/* Cadence block — ring + two fixed stat rows in a uniform inset */}
              <div className="flex items-center gap-3 rounded-2xl liquid-glass-clear p-3">
                <CadenceRing
                  pct={consumed}
                  center={ringCenter}
                  color={ringColor}
                  size={56}
                  ariaLabel={
                    `Cadence clock for ${chk.title}: ` +
                    (consumed == null
                      ? "no recorded interval yet."
                      : `day ${Math.round(consumed * interval)} of ${interval}-day ${chk.recurrence.toLowerCase()} window ` +
                        (chk.completed
                          ? "recorded complete this cycle."
                          : (consumed ?? 0) >= 1
                          ? "window used up, due now."
                          : `${daysAway} days remaining.`))
                  }
                />
                <ul className="min-w-0 flex-1 space-y-1.5 text-[11.5px]">
                  <li className="flex items-center justify-between gap-2">
                    <span className="text-label">Next due</span>
                    <span className="font-semibold tabular-nums text-ink">Day {chk.dueDay}</span>
                  </li>
                  <li className="flex items-center justify-between gap-2">
                    <span className="text-label">Window</span>
                    <span className="font-semibold tabular-nums text-ink">{interval}d</span>
                  </li>
                  <li className="flex items-center justify-between gap-2">
                    <span className="shrink-0 text-label">Result</span>
                    <span className="min-w-0 truncate text-right font-semibold text-ink" title={chk.lastResult}>
                      {chk.lastResult ?? "—"}
                    </span>
                  </li>
                </ul>
              </div>

              {/* Baseline — single uniform line */}
              <div className="flex min-h-5 items-center gap-1.5 overflow-hidden whitespace-nowrap text-[11.5px] text-label">
                <span className="shrink-0 font-semibold text-ink">Baseline</span>
                <span className="min-w-0 truncate" title={chk.baselineComparison}>
                  {chk.baselineComparison ?? "No baseline reference yet"}
                </span>
              </div>

              {/* Why — uniform label row, expands inline */}
              <button
                onClick={() => setExpandedId(isOpen ? null : chk.id)}
                aria-expanded={isOpen}
                className="flex items-center gap-1 self-start text-[11.5px] font-medium text-label transition-colors hover:text-ink"
              >
                Why this check
                <ChevronDown
                  size={14}
                  className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
                  aria-hidden
                />
              </button>
              {isOpen && (
                <p className="rounded-xl border border-border p-3 text-[12px] leading-relaxed text-label">
                  {chk.relevanceRationale}
                </p>
              )}

              {/* Footer — pinned to card bottom on every card */}
              <div className="mt-auto flex items-center gap-2 border-t border-border pt-3">
                <button
                  onClick={() => toggleComplete(chk.id)}
                  className={`flex-1 rounded-full px-3.5 py-2 text-[12.5px] font-medium transition-colors ${
                    chk.completed
                      ? "liquid-glass-clear text-label hover:text-ink"
                      : "liquid-glass-dark text-white hover:bg-border-strong"
                  }`}
                >
                  {chk.completed ? "Mark Incomplete" : "Record"}
                </button>
                {chk.route && (
                  <Link
                    to={chk.route}
                    className="inline-flex items-center gap-0.5 rounded-full px-2.5 py-2 text-[12px] font-medium text-accent hover:underline"
                    aria-label={`Open module for ${chk.title}`}
                  >
                    Module <ChevronRight className="size-3" aria-hidden />
                  </Link>
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </ModuleShell>
  )
}
