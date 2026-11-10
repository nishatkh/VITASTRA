import { useState, useMemo } from "react"
import { Download, CalendarDays } from "lucide-react"
import { Screen } from "../components/Layout"
import { Card, Title } from "../components/ui"
import { BarSeries, StackBar, CHART_COLORS } from "../components/Analytics"
import { useEvaluation, useExerciseOutages, useTimelineEvents, useApp } from "../api/hooks"
import { exportJson, exportPdf } from "../lib/export"
import { EmptyState } from "../components/EmptyState"

const F = ["all", "health", "exercise", "sleep", "environment"] as const

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

  const typeParts = useMemo(() => {
    const palette: Record<string, string> = {
      check: CHART_COLORS.signal,
      exercise: CHART_COLORS.teal,
      radiation: CHART_COLORS.warning,
      alert: CHART_COLORS.red,
      milestone: CHART_COLORS.label,
      sleep: CHART_COLORS.violet,
      environment: CHART_COLORS.emerald,
      health: CHART_COLORS.label,
    }
    const by = new Map<string, number>()
    all.forEach((e) => by.set(e.type, (by.get(e.type) ?? 0) + 1))
    return [...by.entries()].map(([label, value]) => ({
      label,
      value,
      color: palette[label] ?? `var(--ink-3)`,
    }))
  }, [all])

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
      <div className="col-span-full flex flex-col gap-4 max-w-4xl">
        <div role="radiogroup" aria-label="Filter events" className="flex flex-wrap gap-2">
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
        <div className="flex gap-2 max-w-sm">
          <button
            className="btn btn-soft flex-1"
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
            className="btn btn-soft flex-1"
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
        {/* Mission Activity Analytics */}
        <Card className="col-span-full p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="label font-semibold text-ink">Mission Activity Analytics</span>
            <span className="text-[11px] font-medium text-label uppercase tracking-wider">
              {all.length} events · {all.length ? `Day 1 – Day ${Math.max(...all.map((e) => e.day)) + 1}` : ""}
            </span>
          </div>

          <BarSeries
            data={weekSeries}
            xKey="week"
            keys={["events"]}
            names={["Events"]}
            colors={[CHART_COLORS.signal]}
            unit=""
            height={150}
            ariaLabel={`Number of timeline events per mission week: ${weekSeries.map((w) => `${w.week} ${w.events}`).join(", ")}.`}
          />

          <div className="space-y-2">
            <StackBar
              parts={typeParts.map((p) => ({ value: p.value, color: p.color, label: p.label }))}
              ariaLabel={`Event mix by type: ${typeParts.map((p) => `${p.label} ${p.value}`).join(", ")}`}
            />
            <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[11.5px] text-label">
              {typeParts.map((p) => (
                <li key={p.label} className="flex items-center gap-1.5 capitalize">
                  <i className="h-2.5 w-3.5 rounded-sm" style={{ background: p.color }} />
                  {p.label} · <span className="text-ink font-semibold">{p.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>

        <Card className="p-2 mt-2">
          <ol className="flex flex-col">
            {list.length === 0 && (
              <EmptyState
                icon={<div className="text-3xl"><CalendarDays size={32} /></div>}
                title="No events yet"
                description="Timeline events will appear as you complete checks, log exercise, and as environmental data is recorded."
              />
            )}
            {list.map((e, i) => (
              <li key={i} className="flex gap-3 border-b border-border p-3.5 last:border-0">
                <span className="w-14 shrink-0 text-[12.5px] font-semibold tabular-nums text-label">
                  Day {e.day + 1}
                </span>
                <span>
                  <span className="block text-[15px] font-semibold leading-tight">{e.title}</span>
                  <span className="text-[13px] text-label">{e.detail}</span>
                </span>
              </li>
            ))}
          </ol>
        </Card>
      </div>
    </Screen>
  )
}