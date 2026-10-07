import { ArrowRight, ShieldCheck } from "lucide-react"
import { Card } from "./ui"
import { DotNum } from "./DotNum"
import { SignalCompressionAnimation } from "./SignalCompressionAnimation"
import { useEvaluation } from "../api/hooks"

export function AlertCounter({ dark }: { dark?: boolean }) {
  const { data: ev } = useEvaluation(0)
  const raw = ev?.rawSignals.length ?? 72
  const grouped = ev?.alerts.length ?? 2
  const ratio = Math.round(raw / Math.max(1, grouped))
  const reduction = Math.round(((raw - grouped) / Math.max(1, raw)) * 100)

  return (
    <Card dark={dark} className="p-4 relative overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="live-pulse size-2 rounded-full bg-signal" aria-hidden />
          <span className="label text-[11.5px]">Alert-fatigue counter</span>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-signal-soft px-2.5 py-0.5 text-[11px] font-semibold text-signal-strong">
          <ShieldCheck size={13} />
          {reduction}% Fatigue Reduction
        </span>
      </div>

      <div
        className="mt-2 flex flex-wrap items-center gap-3 sm:gap-5"
        role="text"
        aria-label={`${raw} raw telemetry streams compressed into ${grouped} actionable alert stories (${ratio}:1 ratio)`}
      >
        <div className="flex flex-col">
          <DotNum value={raw} size={46} dark={dark} />
          <span className="mt-0.5 text-[11px] font-medium text-label">Raw sensor pings</span>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-[10px] font-semibold tracking-wider text-signal uppercase">{ratio}:1 Ratio</span>
          <ArrowRight
            size={22}
            strokeWidth={1.8}
            aria-hidden
            className="my-0.5 text-signal"
          />
        </div>

        <div className="flex flex-col">
          <DotNum value={grouped} size={46} dark={dark} />
          <span className="mt-0.5 text-[11px] font-medium text-label">Grouped alerts</span>
        </div>
      </div>

      {/* Animated Signal Compression Wave Canvas */}
      <div className="mt-2 w-full">
        <SignalCompressionAnimation height={28} color="var(--signal)" />
      </div>

      <p
        className={`mt-1.5 text-[12.5px] leading-snug ${
          dark ? "text-on-nav/80" : "text-label"
        }`}
      >
        Raw telemetry streams are continuously grouped into unified clinical alerts. Related signals arrive as <b>1 story</b> rather than {raw} pings.
      </p>
    </Card>
  )
}
