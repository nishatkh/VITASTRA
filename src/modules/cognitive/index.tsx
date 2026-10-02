import { Link } from "react-router"
import { Play } from "lucide-react"
import { ModuleShell, StatusRow, NextActions } from "../../components/Layout"
import { DotNum } from "../../components/DotNum"
import { BaselineChart } from "../../components/Charts"
import { Card, SourceChip } from "../../components/ui"
import { AlertBadge } from "../../components/Level"
import { useEvaluation, useCognitiveResult } from "../../api/hooks"
import { fitness } from "./fit"
import type { Level } from "../../data/types"
import { EmptyChart, SkeletonCard } from "../../components/EmptyState"

export const FitCard = ({
  reaction,
  sway,
  sleepZ,
  label,
}: {
  reaction: number
  sway: number
  sleepZ: number
  label: string
}) => {
  const f = fitness(reaction, sway, sleepZ)
  const lv: Level =
    f.verdict === "Fit"
      ? "normal"
      : f.verdict === "Caution"
      ? "observe"
      : "warning"
  return (
    <Card className="p-5">
      <div className="label">Fit for demanding tasks?</div>
      <div className="my-3 flex items-center gap-3">
        <span className="text-[40px] font-semibold leading-none tracking-[-0.03em]">
          {f.verdict}
        </span>
        <AlertBadge level={lv} text={label} />
      </div>
      <ul className="flex flex-col gap-1.5 text-[14px] leading-snug">
        {f.reasons.map((r) => (
          <li key={r} className="flex gap-2">
            <span className="mt-2 size-1 shrink-0 rounded-full bg-ink" />
            {r}
          </li>
        ))}
      </ul>
    </Card>
  )
}

export default function Cognitive() {
  const day = 0
  const { data: ev } = useEvaluation(day)
  const { data: savedResult, isLoading } = useCognitiveResult()

  if (!ev) {
    return (
      <ModuleShell title={["Thinking", "& Balance"]}>
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </ModuleShell>
    )
  }

  const reaction = savedResult?.reaction ?? ev.sm.reaction
  const sway = savedResult?.sway ?? ev.sm.balance
  const f = fitness(reaction, sway, ev.z.sleep)
  const lv: Level =
    f.verdict === "Fit"
      ? "normal"
      : f.verdict === "Caution"
      ? "observe"
      : "warning"
  return (
    <ModuleShell title={["Thinking", "& Balance"]}>
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <span className="label">Reaction time · median</span>
          <SourceChip kind="synthetic" />
        </div>
        <div className="my-3">
          <DotNum value={reaction} unit="ms" size={84} />
        </div>
        <Link to="/cognitive/test" className="btn btn-ink btn-lg w-full">
          <Play size={20} strokeWidth={1.6} />
          Start reaction and balance test
        </Link>
        <p className="mt-3 text-[13px] text-label">
          {savedResult
            ? `Last result saved on day ${savedResult.day + 1}.`
            : "Showing today's baseline estimate until you run a test."}{" "}
          Takes about 90 seconds.
        </p>
      </Card>
      <FitCard reaction={reaction} sway={sway} sleepZ={ev.z.sleep} label={f.verdict} />
      <section className="card p-5">
        <div className="label mb-1">Reaction time vs your baseline</div>
        {ev ? <BaselineChart metric="reaction" day={day} /> : <EmptyChart title="No baseline data" />}
      </section>
      <section className="card p-5">
        <div className="label mb-1">Balance sway vs your baseline</div>
        {ev ? <BaselineChart metric="balance" day={day} /> : <EmptyChart title="No baseline data" />}
      </section>
      <StatusRow level={lv} title={f.verdict === "Fit" ? "Fit for demanding tasks" : f.verdict} confidence={0.7} why={f.reasons} />
      <NextActions
        items={
          lv === "normal"
            ? [
                "Proceed with planned tasks",
                "Repeat the test before any high-risk procedure",
              ]
            : [
                "Repeat the test after a rest and a meal",
                "Postpone high-risk tasks until the result is back in baseline",
                "Mention the result to the flight surgeon (MED-1.1)",
              ]
        }
      />
    </ModuleShell>
  )
}