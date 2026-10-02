import { useState } from "react"
import { Download, CalendarDays } from "lucide-react"
import { Screen } from "../components/Layout"
import { Card, Title } from "../components/ui"
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