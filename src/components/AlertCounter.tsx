import { ArrowRight } from "lucide-react"
import { Card } from "./ui"
import { DotNum } from "./DotNum"
import { useEvaluation } from "../api/hooks"

export function AlertCounter({ dark }: { dark?: boolean }) {
  const { data: ev } = useEvaluation(0)
  const raw = ev?.rawSignals.length ?? 0
  const grouped = ev?.alerts.length ?? 0
  return (
    <Card dark={dark} className="p-5">
      <div className="label">Alert-fatigue counter</div>
      <div
        className="mt-2 flex items-center gap-4"
        role="text"
        aria-label={`${raw} raw signals grouped into ${grouped} alerts`}
      >
        <DotNum value={raw} size={72} dark={dark} />
        <ArrowRight
          size={28}
          strokeWidth={1.4}
          aria-hidden
          className="text-ink-3"
        />
        <DotNum value={grouped} size={72} dark={dark} />
      </div>
      <p
        className={`mt-2 text-[13.5px] leading-snug ${
          dark ? "text-on-nav/70" : "text-label"
        }`}
      >
        Raw signals grouped into alerts. Related signals arrive as one story,
        not {raw || "many"} pings.
      </p>
    </Card>
  )
}
