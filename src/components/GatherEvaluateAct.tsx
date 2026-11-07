import { Activity, Scale, ListChecks } from "lucide-react"
import { useEvaluation } from "../api/hooks"

export function GatherEvaluateAct() {
  const { data: ev } = useEvaluation(0)
  const steps = [
    {
      icon: Activity,
      label: "Gather",
      sub: `${ev ? Object.keys(ev.sm).length : 0} signals`,
    },
    {
      icon: Scale,
      label: "Evaluate",
      sub: `${ev?.alerts.length ?? 0} pattern${ev?.alerts.length === 1 ? "" : "s"}`,
    },
    {
      icon: ListChecks,
      label: "Act",
      sub: `${ev?.alerts.reduce((n, a) => n + a.actions.length, 0) ?? 0} next step${ev?.alerts.length === 1 ? "" : "s"}`,
    },
  ]
  const active = (ev?.alerts.length ?? 0) ? 2 : 0
  return (
    <ol
      aria-label="Gather, Evaluate, Act"
      className="flex items-center gap-1 px-1"
    >
      {steps.map((s, i) => (
        <li key={s.label} className="flex flex-1 items-center gap-2">
          <span
            className={`flex size-9 shrink-0 items-center justify-center rounded-full ${
              i === active
                ? "bg-ink text-white"
                : "bg-white text-label shadow-[0_2px_8px_rgba(0,0,0,.06)]"
            }`}
          >
            <s.icon size={16} strokeWidth={1.6} aria-hidden />
          </span>
          <span className="min-w-0 text-[12px] leading-tight">
            <span
              className={`block font-semibold ${
                i === active ? "text-ink" : "text-label"
              }`}
            >
              {s.label}
            </span>
            <span className="block truncate text-label">{s.sub}</span>
          </span>
          {i < 2 && (
            <span className="h-px min-w-2 flex-1 bg-black/15" aria-hidden />
          )}
        </li>
      ))}
    </ol>
  )
}
