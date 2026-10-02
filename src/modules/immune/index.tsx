import {
  ModuleShell,
  StatusRow,
  NextActions,
  useModuleAlert,
} from "../../components/Layout"
import { DotNum } from "../../components/DotNum"
import { BaselineChart } from "../../components/Charts"
import { SourceChip, Card } from "../../components/ui"
import { ConfidenceBar } from "../../components/Level"
import { useEvaluation } from "../../api/hooks"
import { EmptyChart, EmptyState, SkeletonCard } from "../../components/EmptyState"

export default function Immune() {
  const day = 0
  const { data: ev } = useEvaluation(day)
  const a = useModuleAlert("immune")

  if (!ev) {
    return (
      <ModuleShell title={["Immune", "Stress"]}>
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </ModuleShell>
    )
  }

  const n = ev.signalsA.filter((s) => s.on).length
  const factors = [
    { l: "Skin temperature drift", z: ev.z.temp },
    { l: "Resting heart rate", z: ev.z.restHR },
    { l: "Short sleep", z: -ev.z.sleep },
    { l: "Stress score", z: ev.z.stress },
  ]

  return (
    <ModuleShell title={["Immune", "Stress"]}>
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <span className="label">Pattern signals outside baseline</span>
          <SourceChip kind="synthetic" />
        </div>
        <div className="my-3"><DotNum value={n} unit="of 8 signals" size={84} /></div>
        <p className="text-[14px] text-label">Temperature, resting HR, sleep and stress are read together, against your own baseline.</p>
      </Card>
      <section className="card p-5">
        <div className="label mb-1">Skin temperature vs your baseline</div>
        {ev ? <BaselineChart metric="temp" day={day} /> : <EmptyChart title="No baseline data" />}
      </section>
      <Card className="flex flex-col gap-4 p-5">
        <div className="label">What is contributing</div>
        {factors.map((f) => (
          <ConfidenceBar key={f.l} label={f.l} value={Math.max(0, Math.min(1, f.z / 4))} />
        ))}
      </Card>
      <StatusRow
        alert={a}
        level={a?.level ?? "normal"}
        title={a ? "Possible immune-stress pattern" : "No pattern"}
        confidence={a?.confidence ?? 0.9}
        why={
          a?.why ?? [
            "Fewer than two contributing signals are outside your baseline.",
            `Skin temperature baseline will be computed from first 30 days.`,
          ]
        }
      />
      <NextActions
        items={
          a ? a.actions : ["No action needed. Samples continue on schedule (MED-2.7)"]
        }
      />
      <Card className="p-5">
        <div className="label mb-2">Sample-collection reminders</div>
        <EmptyState
          icon={<div className="text-3xl">🧪</div>}
          title="No sample schedule yet"
          description="Sample collection reminders will appear when connected to a backend with scheduled checks."
        />
      </Card>
    </ModuleShell>
  )
}