import {
  Area,
  ComposedChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  ReferenceLine,
} from "recharts"
import { ModuleShell, StatusRow, NextActions } from "../../components/Layout"
import { Card } from "../../components/ui"
import { DotNum } from "../../components/DotNum"
import { useEvaluation, useApp } from "../../api/hooks"
import type { Level } from "../../data/types"
import { EmptyState, SkeletonCard } from "../../components/EmptyState"

export default function Twin() {
  const day = useApp((s) => s.day)
  const { data: ev } = useEvaluation(day)

  if (!ev) {
    return (
      <ModuleShell title={["Body", "Twin"]}>
        <SkeletonCard />
        <SkeletonCard />
      </ModuleShell>
    )
  }

  const data = ev.twin.map((t) => ({
    h: t.hour,
    expected: t.expected,
    actual: t.actual,
    gap: t.actual == null ? null : [Math.min(t.expected, t.actual), Math.max(t.expected, t.actual)],
  }))
  const level: Level = ev.strain ? "observe" : "normal"
  const nowH = (ev.nowS.minute % 1440) / 60

  return (
    <ModuleShell title={["Body", "Twin"]}>
      <Card className="p-5">
        <div className="label">Heart rate gap vs expected</div>
        <div className="my-3"><DotNum value={Math.abs(ev.gapNow)} unit={ev.gapNow >= 0 ? "bpm above expected" : "bpm below expected"} size={84} /></div>
        <div role="img" aria-label={`Expected versus actual heart rate over 24 hours. Now ${Math.round(ev.nowS.hr)} bpm, expected ${Math.round(ev.nowS.expectedHr)} bpm.`}>
          <ResponsiveContainer width="100%" height={200}>
            <ComposedChart data={data} margin={{ top: 8, right: 6, left: -22, bottom: 0 }}>
              <XAxis dataKey="h" type="number" domain={[0, 23]} ticks={[0, 6, 12, 18, 23]} tick={{ fontSize: 11, fill: "var(--ink-3)" }} tickLine={false} axisLine={false} />
              <YAxis domain={[40, 110]} tick={{ fontSize: 11, fill: "var(--ink-3)" }} tickLine={false} axisLine={false} width={40} />
              <Area dataKey="gap" stroke="none" fill="var(--ink-3)" fillOpacity={0.4} isAnimationActive={false} connectNulls={false} />
              <Line dataKey="expected" stroke="var(--ink-3)" strokeWidth={1.5} strokeDasharray="5 4" dot={false} isAnimationActive={false} />
              <Line dataKey="actual" stroke="var(--signal)" strokeWidth={2} dot={false} isAnimationActive={false} connectNulls={false} />
              <ReferenceLine x={nowH} stroke="var(--ink-3)" strokeOpacity={0.25} strokeDasharray="2 3" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-1 flex gap-4 px-2 text-[11.5px] text-label">
          <span className="flex items-center gap-1.5"><i className="h-0.5 w-4" style={{ background: "var(--signal)" }} />Actual (live)</span>
          <span className="flex items-center gap-1.5"><i className="w-4 border-t-2 border-dashed" style={{ borderColor: "var(--ink-3)" }} />Expected from activity, sleep, cabin</span>
          <span className="flex items-center gap-1.5"><i className="size-3 rounded-sm" style={{ background: "var(--ink-3)", opacity: 0.4 }} />Gap</span>
        </div>
      </Card>
      <Card className="p-5">
        <div className="text-[19px] font-semibold tracking-[-0.02em]">{ev.strain ? "Unexplained strain" : "Heart rate is explained"}</div>
        <p className="mt-1 text-[14.5px] leading-snug text-label">{ev.strain ? "Heart rate is above what your activity, sleep and cabin conditions predict. Something not in the model may be adding load." : "Your heart rate matches what your activity, sleep and cabin conditions predict."}</p>
      </Card>
      <StatusRow level={level} title={ev.strain ? "Unexplained strain" : "Matches expectation"} confidence={ev.strain ? 0.68 : 0.85} why={[`Actual ${Math.round(ev.nowS.hr)} bpm, expected ${Math.round(ev.nowS.expectedHr)} bpm.`, "Expected value combines your daily rhythm, recent activity and cabin CO2.", "A gap of 6 bpm or more, sustained, is flagged as unexplained strain."]} />
      <NextActions items={ev.strain ? ["Check cabin CO2 against the fixed sensor (ENV-1.3)", "Log any symptoms in the questionnaire"] : ["No action needed"]} />
    </ModuleShell>
  )
}