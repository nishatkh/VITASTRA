import { useApp } from "../../store/useApp"
import { useState } from "react"
import { motion } from "framer-motion"
import { Wrench, Plus, Dumbbell } from "lucide-react"
import {
  ModuleShell,
  StatusRow,
  NextActions,
  useModuleAlert,
} from "../../components/Layout"
import { DotNum } from "../../components/DotNum"
import { SourceChip, SectionHead, Card } from "../../components/ui"
import { LevelDot, levelLabel } from "../../components/Level"
import { useEvaluation, useExerciseOutages, useLogOutage, useClearOutages } from "../../api/hooks"
import type { Level } from "../../data/types"
import { EmptyState } from "../../components/EmptyState"

function Bar({
  label,
  value,
  max,
  dark,
  sub,
}: {
  label: string
  value: number
  max: number
  dark?: boolean
  sub?: string
}) {
  return (
    <div className="flex items-center gap-3 text-[12.5px]">
      <span className="w-[72px] shrink-0 text-label">{label}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-border">
        <motion.div
          className={`h-full rounded-full ${dark ? "bg-ink" : "bg-ink-3"}`}
          initial={false}
          animate={{ width: `${Math.min(100, (value / max) * 100)}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </div>
      <span className="w-[60px] text-right tabular-nums">
        {Math.round(value)} {sub}
      </span>
    </div>
  )
}

export default function Bone() {
  const day = useApp((s) => s.day)
  const { data: ev } = useEvaluation(day)
  const alert = useModuleAlert("bone")
  const { data: outagesData } = useExerciseOutages()
  const outages = outagesData ?? []
  const logOutage = useLogOutage()
  const clearOutages = useClearOutages()
  const [log, setLog] = useState<{
    device: string
    min: number
    rpe: number
    ok: boolean
  }[]>([])
  const [f, setF] = useState({ device: "ARED", min: 45, rpe: 7, ok: true })

  if (!ev) {
    return (
      <ModuleShell title={["Bone &", "Muscle"]}>
        <EmptyState
          icon={<Dumbbell size={36} strokeWidth={1.4} />}
          title="No bone & muscle data"
          description="Connect exercise equipment and log sessions to see delivered vs planned load."
        />
      </ModuleShell>
    )
  }

  const b = ev.bone
  const level: Level = b.risk >= 50 ? "warning" : b.outageActive ? "observe" : "normal"
  const max = Math.max(...b.devices.map((d) => d.planned)) * 1.05

  return (
    <ModuleShell title={["Bone &", "Muscle"]}>
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <span className="label">Delivered vs planned load · 28 days</span>
          <SourceChip kind="synthetic" />
        </div>
        <div className="my-3">
          <DotNum value={b.deliveredFrac * 100} unit="% of plan delivered" size={84} />
        </div>
        <p className="text-[14px] text-label">
          Minutes logged do not equal protection. A machine that is down delivers no load.
        </p>
      </Card>

      <section className="card p-5" aria-label="Countermeasure reality check">
        <div className="mb-4 text-[20px] font-semibold tracking-[-0.02em]">
          Planned vs delivered protective load
        </div>
        <div className="flex flex-col gap-5">
          {b.devices.map((d) => (
            <div key={d.name} className="flex flex-col gap-1.5">
              <div className="text-[14px] font-semibold">{d.name}</div>
              <Bar label="Planned" value={d.planned} max={max} sub="min" />
              <Bar label="Logged" value={d.logged} max={max} sub="min" />
              <Bar label="Delivered" value={d.delivered} max={max} dark sub="min" />
            </div>
          ))}
        </div>
        <div className="mt-5 border-t border-border pt-4">
          <div className="flex items-end justify-between">
            <span className="label">Bone and muscle risk index (model)</span>
            <span className="text-[12px] text-label">now / projected</span>
          </div>
          <div className="mt-2 flex items-end gap-6">
            <DotNum value={b.risk} size={64} />
            <div className="pb-1"><DotNum value={b.projectedRisk} size={34} /></div>
          </div>
          <div className="relative mt-3 h-2 overflow-hidden rounded-full bg-border">
            <motion.div
              className="h-full rounded-full bg-ink"
              animate={{ width: `${b.risk}%` }}
              transition={{ type: "spring", stiffness: 90, damping: 18 }}
            />
          </div>
          <div className="relative -mt-2 h-2">
            <motion.span
              className="absolute top-0 h-2 w-0.5 bg-ink/50"
              animate={{ left: `${b.projectedRisk}%` }}
            />
          </div>
          <p className="mt-2 text-[13px] text-label">
            Projection to outage end: {Math.round(b.projectedRisk - b.baseRisk)} points above the no-outage index of {Math.round(b.baseRisk)}.
          </p>
        </div>
      </section>

      <Card className="p-5">
        <div className="mb-3 text-[20px] font-semibold tracking-[-0.02em]">Equipment outage log</div>
        {outages.length === 0 ? (
          <p className="text-[14px] text-label">No outages logged. All three machines available.</p>
        ) : (
          <ul className="mb-3 flex flex-col gap-2">
            {outages.map((o) => (
              <li key={o.id} className="flex items-center gap-3 rounded-2xl bg-raised p-3 text-[14px] shadow-[0_2px_8px_rgba(0,0,0,.05)]">
                <Wrench size={18} strokeWidth={1.5} />
                {o.machine}
                <span className="ml-auto text-label">Day {o.day + 1}, {o.days} days</span>
              </li>
            ))}
          </ul>
        )}
        <div className="flex gap-2">
          <button onClick={() => logOutage.mutate({ machine: "T2 treadmill", day, days: 7 })} className="btn btn-ink btn-lg flex-1">
            <Wrench size={20} strokeWidth={1.6} /> Log treadmill outage
          </button>
          {outages.length > 0 && <button onClick={() => clearOutages.mutate()} className="btn btn-soft btn-lg">Clear</button>}
        </div>
      </Card>

      <StatusRow
        alert={alert}
        level={level}
        title={alert ? alert.title : `Protection on plan, ${levelLabel(level)}`}
        confidence={alert?.confidence ?? 0.72}
        why={[
          "Delivered load is compared with planned load over a rolling 28 days.",
          `Current delivered load is ${Math.round(b.deliveredFrac * 100)}% of plan.`,
        ]}
      />
      <NextActions
        items={
          b.outageActive
            ? [
                "Reallocate the lost load to ARED and CEVIS sessions (EXR-3.1)",
                "Log substitute minutes and intensity after each session",
                "Report the outage on the next contact window (MED-1.1)",
              ]
            : [
                "Keep the planned ARED, treadmill and cycle rotation",
                "Log any machine fault the moment it happens",
              ]
        }
      />

      <SectionHead>Recent sessions</SectionHead>
      <Card className="divide-y divide-border p-2">
        {log.length === 0 ? (
          <EmptyState
            icon={<div className="text-3xl">📋</div>}
            title="No sessions logged"
            description="Log your first session using the form below."
          />
        ) : (
          log.map((l) => (
            <div key={l.min + l.device} className="flex items-center gap-3 px-3 py-3 text-[14px]">
              <LevelDot level={l.ok ? "normal" : "warning"} />
              <span className="font-semibold">{l.device}</span>
              <span className="ml-auto text-label">{l.min} min, RPE {l.rpe}</span>
            </div>
          ))
        )}
      </Card>
      <Card className="flex flex-col gap-3 p-5">
        <div className="text-[17px] font-semibold tracking-[-0.02em]">Log a session</div>
        <div className="grid grid-cols-2 gap-2">
          <select
            aria-label="Device"
            value={f.device}
            onChange={(e) => setF({ ...f, device: e.target.value })}
            className="min-h-12 rounded-2xl bg-raised px-3 text-[15px]"
          >
            <option>ARED</option>
            <option>T2 treadmill</option>
            <option>CEVIS cycle</option>
          </select>
          <input
            aria-label="Minutes"
            type="number"
            min={5}
            max={180}
            value={f.min}
            onChange={(e) => setF({ ...f, min: +e.target.value })}
            className="min-h-12 rounded-2xl bg-raised px-3 text-[15px]"
          />
        </div>
        <label className="text-[13px] text-label">
          Intensity (RPE {f.rpe})
          <input type="range" min={1} max={10} value={f.rpe} onChange={(e) => setF({ ...f, rpe: +e.target.value })} className="h-11 w-full accent-ink" />
        </label>
        <label className="flex min-h-11 items-center gap-3 text-[14px]">
          <input type="checkbox" checked={f.ok} onChange={(e) => setF({ ...f, ok: e.target.checked })} className="size-5 accent-ink" />
          Machine worked as expected
        </label>
        <button className="btn btn-ink" onClick={() => { setLog([f, ...log]); logOutage.mutate({ machine: f.device, day, days: 1 }) }}>
          <Plus size={18} /> Add to log
        </button>
      </Card>
    </ModuleShell>
  )
}