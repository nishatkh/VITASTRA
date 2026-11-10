import { useState, useMemo, type ReactNode } from "react"
import { Download, CalendarDays } from "lucide-react"
import { Screen } from "../components/Layout"
import { Card, Title } from "../components/ui"
import { BarSeries, StackBar, CHART_COLORS } from "../components/Analytics"
import { useEvaluation, useExerciseOutages, useTimelineEvents, useApp } from "../api/hooks"
import { exportJson, exportPdf } from "../lib/export"
import { EmptyState } from "../components/EmptyState"

const F = ["all", "health", "exercise", "sleep", "environment"] as const

/** One palette per event type — shared by the analytics mix and the log rows. */
const TYPE_COLORS: Record<string, string> = {
  check: CHART_COLORS.signal,
  exercise: CHART_COLORS.teal,
  radiation: CHART_COLORS.warning,
  alert: CHART_COLORS.red,
  milestone: CHART_COLORS.label,
  sleep: CHART_COLORS.violet,
  environment: CHART_COLORS.emerald,
  health: CHART_COLORS.label,
}

const QuickStat = ({ value, label }: { value: ReactNode; label: string }) => (
  <div className="liquid-glass-primary flex min-w-[150px] flex-1 flex-col justify-center gap-1 p-4">
    <span className="dot-num text-[24px] font-semibold tracking-[-0.03em] text-ink">{value}</span>
    <span className="text-[11px] uppercase tracking-wider text-label">{label}</span>
  </div>
)

export default function Timeline() {
  const day = useApp((s) => s.day)
  const { data: ev } = useEvaluation(day)
  const { data: outagesData } = useExerciseOutages()
  const outages = outagesData ?? []
  const { data: eventsData, isLoading } = useTimelineEvents(day, outages)

  const [f, setF] = useState<typeof F[number]>("all")
  const all = eventsData ?? []
  const list = all.filter((e) => f === "all" || e.type === f)
  const rows = all.map((e) => `Day ${e.day + 1} · ${e.type} · ${e.title} · ${e.detail}`)

  // ── Mission activity analytics ──
  const weekSeries = useMemo(() => {
    const buckets = new Map<number, number>()
    all.forEach((e) => {
      const w = Math.floor(e.day / 7) + 1
      buckets.set(w, (buckets.get(w) ?? 0) + 1)
    })
    const maxW = Math.max(1, ...buckets.keys())
    return Array.from({ length: maxW }, (_, i) => ({
      week: `W${i + 1}`,
      events: buckets.get(i + 1) ?? 0,
    }))
  }, [all])

  const typeParts = useMemo(
    () =>
      [...new Set(all.map((e) => e.type))]
        .map((label) => ({
          label,
          value: all.filter((e) => e.type === label).length,
          color: TYPE_COLORS[label] ?? "var(--ink-3)",
        }))
        .sort((a, b) => b.value - a.value),
    [all],
  )

  const busiestWeek = useMemo(
    () => weekSeries.reduce((a, b) => (b.events > a.events ? b : a), weekSeries[0] ?? { week: "—", events: 0 }),
    [weekSeries],
  )
  const topType = typeParts[0]
  const lastDay = all.length ? Math.max(...all.map((e) => e.day)) : null

  if (isLoading) {
    return (
      <Screen>
        <Title a="Timeline" b="& Reports" />
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-border rounded" />
          <div className="h-12 bg-border rounded" />
        </div>
      </Screen>
    )
  }

  return (
    <Screen>
      <div className="col-span-full">
        <Title a="Timeline" b="& Reports" />
      </div>

      {/* ── Quick-read strip ── */}
      <div className="col-span-full flex flex-wrap items-stretch gap-3">
        <QuickStat value={all.length} label="Events logged" />
        <QuickStat
          value={busiestWeek ? busiestWeek.week : "—"}
          label={busiestWeek ? `Most active week · ${busiestWeek.events} events` : "Most active week"}
        />
        <QuickStat
          value={topType ? topType.label : "—"}
          label={topType ? `Top category · ${topType.value} events` : "Top category"}
        />
        <QuickStat value={lastDay != null ? `Day ${lastDay + 1}` : "—"} label="Days covered" />
      </div>

      {/* ── Mission Activity Analytics ── */}
      <Card className="col-span-full p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="label font-semibold text-ink">Mission Activity Analytics</span>
          <span className="text-[11px] font-medium text-label uppercase tracking-wider">
            {all.length} events{lastDay != null ? ` · Day 1 – Day ${lastDay + 1}` : ""}
          </span>
        </div>

        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <div className="min-w-0">
            <span className="label mb-1 block !text-[11px]">Events per mission week</span>
            <BarSeries
              data={weekSeries}
              xKey="week"
              keys={["events"]}
              names={["Events"]}
              colors={[CHART_COLORS.signal]}
              unit=""
              height={170}
              ariaLabel={`Number of timeline events per mission week: ${weekSeries.map((w) => `${w.week} ${w.events}`).join(", ")}.`}
            />
          </div>
          <div className="min-w-0 space-y-2.5 xl:pt-6">
            <span className="label block !text-[11px]">Event mix by type</span>
            <StackBar
              parts={typeParts.map((p) => ({ value: p.value, color: p.color, label: p.label }))}
              ariaLabel={`Event mix by type: ${typeParts.map((p) => `${p.label} ${p.value}`).join(", ")}`}
            />
            <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11.5px] text-label sm:grid-cols-3 xl:grid-cols-2">
              {typeParts.map((p) => (
                <li key={p.label} className="flex min-w-0 items-center gap-1.5 capitalize">
                  <i className="h-2.5 w-3.5 shrink-0 rounded-sm" style={{ background: p.color }} />
                  <span className="min-w-0 truncate">{p.label}</span>
                  <span className="ml-auto shrink-0 font-semibold text-ink tabular-nums">{p.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      {/* ── Mission log ── */}
      <Card className="col-span-full p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="label font-semibold text-ink">Mission Log</span>
          <div className="flex flex-wrap items-center gap-2">
            <div role="radiogroup" aria-label="Filter events" className="flex flex-wrap gap-1.5">
              {F.map((x) => (
                <button
                  key={x}
                  role="radio"
                  aria-checked={f === x}
                  onClick={() => setF(x)}
                  className={`btn capitalize ${f === x ? "btn-ink" : "btn-soft"}`}
                >
                  {x}
                </button>
              ))}
            </div>
            <span className="mx-0.5 hidden h-5 w-px bg-border sm:block" aria-hidden />
            <button
              className="btn btn-soft"
              onClick={() =>
                exportPdf("vitastra-timeline", "VITASTRA timeline report", [
                  ["Summary", (ev as any)?.sbar?.situation ?? "No data"],
                  ["Events", rows.slice(0, 40).join("\n")],
                ])
              }
            >
              <Download size={17} strokeWidth={1.6} />
              PDF
            </button>
            <button
              className="btn btn-soft"
              onClick={() =>
                exportJson("vitastra-timeline", {
                  day: day + 1,
                  report: (ev as any)?.sbar,
                  events: all,
                })
              }
            >
              <Download size={17} strokeWidth={1.6} />
              JSON
            </button>
          </div>
        </div>

        {list.length === 0 ? (
          <EmptyState
            icon={<div className="text-3xl"><CalendarDays size={32} /></div>}
            title="No events yet"
            description="Timeline events will appear as you complete checks, log exercise, and as environmental data is recorded."
          />
        ) : (
          <ol className="flex flex-col">
            {list.map((e, i) => {
              const color = TYPE_COLORS[e.type] ?? "var(--ink-3)"
              return (
                <li key={i} className="flex items-center gap-3 border-b border-border p-3.5 last:border-0">
                  <span className="w-11 shrink-0 rounded-full liquid-glass-clear px-2 py-1 text-center text-[10.5px] font-semibold tabular-nums text-label">
                    D{e.day + 1}
                  </span>
                  <i
                    className={`size-2.5 shrink-0 rounded-full ${e.type === "alert" ? "crit-pulse" : ""}`}
                    style={{ background: color }}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14.5px] font-semibold leading-snug text-ink" title={e.title}>
                      {e.title}
                    </span>
                    <span className="block truncate text-[12.5px] text-label" title={e.detail}>
                      {e.detail}
                    </span>
                  </span>
                  <span className="hidden shrink-0 rounded-full bg-border/40 px-2.5 py-1 text-[10.5px] uppercase tracking-wide text-label sm:block">
                    {e.type}
                  </span>
                </li>
              )
            })}
          </ol>
        )}
      </Card>
    </Screen>
  )
}
