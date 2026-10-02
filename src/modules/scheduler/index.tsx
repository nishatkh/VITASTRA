import { Link } from "react-router"
import {
  Area,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts"
import { ModuleShell, NextActions } from "../../components/Layout"
import { Card } from "../../components/ui"
import { AlertBadge } from "../../components/Level"
import { useEvaluation, useApp } from "../../api/hooks"
import type { Level } from "../../data/types"
import { EmptyState, SkeletonCard } from "../../components/EmptyState"

const CUSUM_H = 5
const N = 183
const checks = [
  { type: "vision", due: 3 },
  { type: "cognitive", due: 1 },
  { type: "balance", due: 5 },
  { type: "sample", due: 8 },
] as const

const TYPE: Record<string, string> = {
  vision: "Vision",
  cognitive: "Cognitive",
  balance: "Balance",
  sample: "Saliva sample",
}

export default function Scheduler() {
  const day = useApp((s) => s.day)
  const { data: ev } = useEvaluation(day)
  const fine = useApp((s) => s.flags.feelFine)
  const setFlag = useApp((s) => s.setFlag)
  const R = 54, C = 2 * Math.PI * R
  const drift = ev && ev.cusum > 0.6 * CUSUM_H
  const alarm = ev && ev.cusum > CUSUM_H
  const level: Level = alarm ? "warning" : drift ? "observe" : "normal"
  const data = ev ? Array.from({ length: ev.day + 1 }, (_, i) => ({ d: i + 1, s: (ev as any).cusumVision?.[i] ?? ev.cusum })) : []
  const due = ev ? checks.filter((c) => c.due >= ev.day).slice(0, 3) : []

  if (!ev) {
    return (
      <ModuleShell title={["Silent-Signal", "Scheduler"]}>
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </ModuleShell>
    )
  }

  return (
    <ModuleShell title={["Silent-Signal", "Scheduler"]}>
      <Card className="flex items-center gap-5 p-5">
        <div className="relative size-[132px] shrink-0" role="img" aria-label={`Check adherence ${Math.round(ev.adherence * 100)} percent over 28 days`}>
          <svg viewBox="0 0 132 132" className="size-full -rotate-90">
            <circle cx="66" cy="66" r={R} fill="none" stroke="var(--border)" strokeWidth="10" />
            <circle cx="66" cy="66" r={R} fill="none" stroke="var(--ink)" strokeWidth="10" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - ev.adherence)} style={{ transition: "stroke-dashoffset .6s cubic-bezier(.3,1.3,.5,1)" }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="dot-num text-[38px]">{Math.round(ev.adherence * 100)}</span>
            <span className="text-[11px] text-label">percent</span>
          </div>
        </div>
        <div><div className="label">Check adherence · 28 days</div><p className="mt-1 text-[14.5px] leading-snug">Short scheduled checks catch changes you cannot feel. Feeling fine is not the same as being in baseline.</p></div>
      </Card>

      <Card className="p-5">
        <div className="label mb-3">How are you feeling?</div>
        <button aria-pressed={fine} onClick={() => setFlag("feelFine", !fine)} className={`flex min-h-[72px] w-full items-center justify-center rounded-full text-[22px] font-semibold tracking-[-0.02em] transition-all active:scale-[.98] ${fine ? "bg-ink text-canvas" : "bg-raised shadow-[0_2px_10px_rgba(0,0,0,.08)]"}`}>{fine ? "Logged: I feel fine" : "I feel fine"}</button>
        <p className="mt-3 text-[13.5px] text-label">Your answer is recorded next to the objective vision check. Neither overrides the other.</p>
      </Card>

      <Card className="p-5">
        <div className="mb-1 flex items-center justify-between"><span className="label">Vision-check drift · CUSUM</span><AlertBadge level={level} text={alarm ? "Drift confirmed" : drift ? "Drift building" : "No drift"} /></div>
        <div role="img" aria-label={`Vision drift statistic ${ev.cusum.toFixed(1)} of threshold ${CUSUM_H}`}>
          <ResponsiveContainer width="100%" height={170}>
            <ComposedChart data={data} margin={{ top: 8, right: 6, left: -22, bottom: 0 }}>
              <XAxis type="number" dataKey="d" domain={[1, N]} ticks={[1, 60, 120, 183]} tick={{ fontSize: 11, fill: "var(--ink-3)" }} tickLine={false} axisLine={false} />
              <YAxis domain={[0, CUSUM_H * 1.3]} tick={{ fontSize: 11, fill: "var(--ink-3)" }} tickLine={false} axisLine={false} width={40} />
              <ReferenceLine y={CUSUM_H} stroke="var(--ink-3)" strokeDasharray="4 4" label={{ value: "threshold", fontSize: 11, fill: "var(--ink-3)", position: "insideTopLeft" }} />
              <Area dataKey="s" stroke="none" fill="var(--ink-3)" fillOpacity={0.07} isAnimationActive={false} />
              <Line dataKey="s" stroke="var(--ink)" strokeWidth={1.6} dot={false} isAnimationActive={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-2 text-[13.5px] text-label">Each small step below baseline adds up.</p>
      </Card>

      {fine && (drift || alarm) && (
        <Card className="bg-nav text-on-nav p-5">
          <div className="label !text-on-nav/60">Coach</div>
          <p className="mt-2 text-[17px] leading-snug">
            You said you feel fine. Your vision checks have drifted slowly below your own baseline for several weeks. A possible early fluid-shift pattern, not a diagnosis. {alarm ? "The accumulated shift is past threshold, so this is worth escalating." : "It is not past threshold yet."}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to="/coach" onClick={() => useApp.getState().setCoachPrompt("What changed?")} className="btn bg-on-nav text-nav">Ask Coach why</Link>
            {alarm && <Link to="/mc/triage" className="btn bg-on-nav/10 text-on-nav">Prepare hand-off</Link>}
          </div>
        </Card>
      )}
      {fine && !drift && <p className="rounded-[22px] bg-raised/60 p-4 text-[14px] text-label">No drift in the objective checks. Your answer and the data agree.</p>}

      <Card className="p-5">
        <div className="label mb-3">Upcoming checks</div>
        <ul className="flex flex-col gap-2.5">
          {due.length === 0 ? (
            <EmptyState icon={<div className="text-3xl">📅</div>} title="No upcoming checks" description="No checks are scheduled in the next few days." />
          ) : (
            due.map((c) => (
              <li key={c.type} className="flex min-h-11 items-center justify-between rounded-2xl bg-raised px-4 shadow-[0_2px_8px_rgba(0,0,0,.05)]">
                <span className="font-medium">{TYPE[c.type]} check</span>
                <span className="text-[13px] text-label">day {c.due + 1}</span>
              </li>
            ))
          )}
        </ul>
      </Card>
      <NextActions items={drift ? ["Repeat the near-acuity check in matched lighting (MED-4.2)", "Note any headache or blurred reading in the questionnaire"] : ["Keep to the check schedule. Consistency makes the baseline reliable"]} />
    </ModuleShell>
  )
}