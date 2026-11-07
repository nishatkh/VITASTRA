import { useState } from "react"
import { Link } from "react-router"
import { Lock } from "lucide-react"
import { ModuleShell, StatusRow, NextActions } from "../../components/Layout"
import { DotNum } from "../../components/DotNum"
import { BaselineChart } from "../../components/Charts"
import { Card, SourceChip } from "../../components/ui"
import { useEvaluation, useMoodEntries, useAddMoodEntry } from "../../api/hooks"
import { useApp } from "../../store/useApp"
import { EmptyChart, SkeletonCard } from "../../components/EmptyState"
import type { Level } from "../../data/types"

export default function Mood() {
  const day = useApp((s) => s.day)
  const { data: ev } = useEvaluation(day)
  const { data: moodEntriesData } = useMoodEntries({ from: Math.max(0, day - 30), to: day })
  const addEntry = useAddMoodEntry()
  const tier = useApp((s) => s.tiers["Mood and stress check-ins"])
  const [f, setF] = useState({ mood: 4, stress: 4, social: 6 })
  const [saved, setSaved] = useState(false)

  if (!ev) {
    return (
      <ModuleShell title={["Isolation", "& Mood"]}>
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </ModuleShell>
    )
  }

  const e = moodEntriesData?.[moodEntriesData.length - 1] ?? { stress: 0, social: 0, sleepStart: 22.5, activeMin: 0 }
  const level: Level = ev.z.mood <= -2 || ev.z.stress >= 2 ? "observe" : "normal"
  const hh = Math.floor(e.sleepStart), mm = Math.round((e.sleepStart - hh) * 60)
  const sug = level === "normal"
    ? ["Keep the current light and sleep schedule", "A regular call home helps. Schedule one this week"]
    : ["Shift workspace light to a warmer setting 90 minutes before sleep (CRW-2.4)", "Book a private family conference or a call with the behavioral health contact (BHP-1.1)", "Plan one shared meal this week. Social contact is trending down"]

  return (
    <ModuleShell title={["Isolation", "& Mood"]}>
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-[12px] font-semibold text-canvas">
            <Lock size={13} /> Private · {tier}
          </span>
          <SourceChip kind="synthetic" />
        </div>
        <div className="my-3"><DotNum value={ev.sm.mood} dec={1} unit="mood, of 5 (5-day mean)" size={84} /></div>
        <div className="grid grid-cols-3 gap-2 text-center text-[12.5px]">
          {[
            ["Stress", `${e.stress}`],
            ["Social contact", `${e.social}/10`],
            ["Sleep start", `${hh}:${String(mm).padStart(2, "0")}`],
          ].map(([l, v]) => (
            <div key={l} className="rounded-2xl bg-raised py-3 shadow-[0_2px_8px_rgba(0,0,0,.05)]">
              <div className="text-[18px] font-semibold tabular-nums">{v}</div>
              <div className="text-label">{l}</div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[13px] text-label">Active {e.activeMin} min today. Shared only if you choose it. <Link to="/privacy" className="font-semibold underline">Privacy tiers</Link></p>
      </Card>
      <section className="card p-5">
        <div className="label mb-1">Mood trend vs your baseline · private</div>
        {ev ? <BaselineChart metric="mood" day={day} /> : <EmptyChart title="No baseline data" />}
      </section>
      <Card className="flex flex-col gap-4 p-5">
        <div className="text-[18px] font-semibold tracking-[-0.02em]">Daily check-in</div>
        {([
          ["mood", "Mood", 1, 5],
          ["stress", "Stress", 0, 10],
          ["social", "Social contact", 0, 10],
        ] as const).map(([k, l, a, b]) => (
          <label key={k} className="text-[14px]">
            <span className="flex justify-between"><span>{l}</span><b className="tabular-nums">{f[k]}</b></span>
            <input type="range" min={a} max={b} value={f[k]} onChange={(ev2) => { setSaved(false); setF({ ...f, [k]: +ev2.target.value }) }} className="h-11 w-full accent-ink" />
          </label>
        ))}
        <button className="btn btn-ink" onClick={() => { addEntry.mutate({ mood: f.mood, stress: f.stress * 10, social: f.social, sleepStart: e.sleepStart, activeMin: e.activeMin }); setSaved(true) }}>Save privately</button>
        {saved && <p className="text-[13.5px] text-label">Saved on this device. {moodEntriesData?.length ?? 0} check-in{moodEntriesData?.length === 1 ? "" : "s"} stored locally.</p>}
      </Card>
      <StatusRow level={level} title={level === "normal" ? "Steady" : "Gentle suggestion"} confidence={0.5} why={["Mood and stress are compared with your own baseline.", `Mood 5-day mean ${ev.sm.mood.toFixed(1)}, stress ${ev.sm.stress.toFixed(0)}.`, "Mood never raises a Warning. It only produces suggestions."]} />
      <NextActions items={sug} />
      <Link to="/contested" className="btn btn-soft self-start">Compare with the published mid-mission pattern</Link>
    </ModuleShell>
  )
}