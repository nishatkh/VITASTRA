import {
  Area,
  ComposedChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  ReferenceLine,
} from "recharts"
import { ModuleShell } from "../../components/Layout"
import { Card } from "../../components/ui"
import { useEvaluation } from "../../api/hooks"
import { useApp } from "../../store/useApp"
import { EmptyState, SkeletonCard } from "../../components/EmptyState"

const N = 183

export default function Contested() {
  const day = useApp((s) => s.day)
  const { data: ev } = useEvaluation(day)

  if (!ev) {
    return (
      <ModuleShell title={["Contested", "Pattern"]}>
        <SkeletonCard />
        <SkeletonCard />
      </ModuleShell>
    )
  }

  const evAny = ev as any
  const data = Array.from({ length: N }, (_, i) => {
    const mean = evAny.baselineMean?.mood?.[i] ?? 4.0
    const sd = evAny.BASE_SD?.mood ?? 0.5
    return {
      d: i + 1,
      mood: i <= ev.day ? (evAny.series?.mood?.[i] ?? ev.sm.mood) : null,
      ref: 3.9 - 0.65 * Math.exp(-(((i / N - 0.52) / 0.12) ** 2)),
      lo: mean - 1.5 * sd,
      hi: mean + 1.5 * sd,
    }
  })

  return (
    <ModuleShell title={["Contested", "Pattern"]}>
      <Card className="p-5">
        <div className="label mb-1">Your mood vs a published mid-mission dip</div>
        <div role="img" aria-label="Your mood trend with a dashed gray overlay of a contested published pattern. Low confidence. Never triggers an alarm.">
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={data.map((p) => ({ ...p, band: [p.lo, p.hi] }))} margin={{ top: 8, right: 6, left: -22, bottom: 0 }}>
              <XAxis type="number" dataKey="d" domain={[1, N]} ticks={[1, 60, 120, 183]} tick={{ fontSize: 11, fill: "var(--ink-3)" }} tickLine={false} axisLine={false} />
              <YAxis domain={[2, 5]} tick={{ fontSize: 11, fill: "var(--ink-3)" }} tickLine={false} axisLine={false} width={40} />
              <Area dataKey="band" stroke="none" fill="var(--baseline-band)" fillOpacity={1} isAnimationActive={false} />
              <Line dataKey="ref" stroke="var(--ink-3)" strokeWidth={2} strokeDasharray="6 5" dot={false} isAnimationActive={false} />
              <Line dataKey="mood" stroke="var(--ink)" strokeWidth={1.6} dot={false} isAnimationActive={false} connectNulls={false} />
              <ReferenceLine x={ev.day + 1} stroke="var(--ink-3)" strokeOpacity={0.25} strokeDasharray="2 3" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="flex gap-4 px-2 text-[11.5px] text-label">
          <span className="flex items-center gap-1.5"><i className="h-0.5 w-4 bg-ink" />Your mood</span>
          <span className="flex items-center gap-1.5"><i className="w-4 border-t-2 border-dashed" style={{ borderColor: "var(--ink-3)" }} />Third-quarter dip (published, contested)</span>
        </div>
      </Card>
      <Card className="p-5">
        <span className="inline-flex rounded-full border border-dashed border-border px-3 py-1 text-[12px] font-semibold text-label">Low confidence</span>
        <p className="mt-3 text-[17px] font-semibold leading-snug tracking-[-0.01em]">Low confidence. Research is contested. Never triggers an alarm.</p>
        <p className="mt-2 text-[14px] leading-snug text-label">Some studies report a mood dip around the middle of long missions. Others do not replicate it. This overlay is context for you to compare against. It is never used to raise an alert or shown to Mission Control.</p>
      </Card>
    </ModuleShell>
  )
}