import { Link } from "react-router"
import { Plus, ClipboardList, FlaskConical, Eye, Brain } from "lucide-react"
import { useEvaluation } from "../api/hooks"
import { useApp } from "../store/useApp"

const MONTHS = ["Mar", "Apr", "May", "Jun", "Jul", "Aug"]
const monthOf = (d: number) => Math.min(5, Math.floor(d / 30.5))
const ICONS = [ClipboardList, FlaskConical, Eye, Brain]
const checks = [
  { type: "vision", due: 3 },
  { type: "cognitive", due: 1 },
  { type: "balance", due: 5 },
  { type: "sample", due: 8 },
] as const

function Bars({ values, hatch }: { values: number[]; hatch?: boolean }) {
  const max = Math.max(...values),
    min = Math.min(...values) - 4
  return (
    <div className="flex h-24 items-end gap-1.5" aria-hidden>
      {values.map((v, i) => (
        <span
          key={i}
          className={`flex-1 rounded-t-full ${hatch ? "hatch" : "bg-ink"}`}
          style={{
            height: `${Math.max(12, ((v - min) / (max - min || 1)) * 100)}%`,
          }}
        />
      ))}
    </div>
  )
}

export function MissionTimeline() {
  const day = useApp((s) => s.day)
  const { data: ev } = useEvaluation(day)
  const cur = monthOf(day)
  const start = Math.max(0, Math.min(cur - 1, 4))
  const cols = [start, start + 1]

  if (!ev) return null

  const hr = ev.live.map((s) => s.hr)
  const bars = Array.from(
    { length: 14 },
    (_, i) => hr[Math.floor((i / 14) * hr.length)] ?? 60,
  )
  return (
    <section aria-label="Mission history timeline" className="col-span-full">
      <div className="relative flex items-center pb-8 pt-2">
        <span
          className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border"
          aria-hidden
        />
        <div className="relative flex w-full items-center justify-between px-2">
          {[Brain, ClipboardList, FlaskConical, Eye, ClipboardList].map(
            (I, i) => (
              <span
                key={i}
                className="flex size-12 items-center justify-center rounded-full bg-ink text-canvas shadow-[0_8px_16px_rgba(0,0,0,.25)]"
                aria-hidden
              >
                <I size={19} strokeWidth={1.3} />
              </span>
            ),
          )}
          <Link
            to="/checks"
            aria-label="Add a check"
            className="flex size-12 items-center justify-center rounded-full bg-ink text-canvas"
          >
            <Plus size={20} strokeWidth={1.4} />
          </Link>
        </div>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        {cols.map((m) => {
          const list = checks.filter((c) => monthOf(c.due) === m).slice(0, 4)
          return (
            <div key={m} className="relative border-l border-border pl-5">
              <span
                className="absolute -left-[5px] top-0 size-2.5 rounded-full bg-ink"
                aria-hidden
              />
              <h3 className="mb-3 text-[22px] font-light tracking-[-0.03em]">
                {MONTHS[m]}
              </h3>
              <div className="mb-4 flex flex-wrap gap-2">
                {list.length === 0 && (
                  <span className="rounded-full bg-border px-4 py-2 text-[13px] text-label">
                    No checks scheduled
                  </span>
                )}
                {list.map((c, i) => {
                  const I = ICONS[i % 4]
                  return (
                    <span
                      key={i}
                      className="inline-flex items-center gap-2 rounded-full bg-raised px-4 py-2 text-[13px] capitalize shadow-[0_6px_14px_rgba(0,0,0,.10)]"
                    >
                      <I size={15} strokeWidth={1.3} aria-hidden />
                      {c.type}
                      <span className="text-label">day {c.due + 1}</span>
                    </span>
                  )
                })}
              </div>
              <div className="card p-5">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[14px]">Heart rate, last hour</span>
                  <span className="rounded-full bg-ink px-3 py-1 text-[12px] tabular-nums text-canvas">
                    {Math.round(ev.nowS.hr)} bpm
                  </span>
                </div>
                <Bars values={bars} hatch={m !== cur} />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
