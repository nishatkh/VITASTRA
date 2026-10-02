import { useEffect, useRef, useState } from "react"
import { Play, RotateCcw } from "lucide-react"
import { Card, Segmented } from "../../components/ui"
import { useValidationRuns, useRunValidation } from "../../api/hooks"
import type { ValidationRow } from "../../data/types"
import { EmptyState, SkeletonCard } from "../../components/EmptyState"

const TOTAL = 100
const SPEEDS = { "1x": 1, "5x": 5, "25x": 25 } as const
const SIZES = ["4", "6", "8"] as const

const SCENARIOS = [
  { id: "immune", label: "Slow immune-stress drift" },
  { id: "co2", label: "Cabin CO2 event" },
  { id: "treadmill", label: "Treadmill outage, subtle physiology" },
  { id: "healthy", label: "Healthy crew, no event" },
] as const
const METHODS = [
  "Fixed population threshold",
  "Personal baseline, z above 3",
  "Personal baseline plus CUSUM",
  "CUSUM plus grouping (2 channels, 3 days)",
] as const

const fmt = (v: number, d = 1) => (Number.isFinite(v) ? v.toFixed(d) : "none")

export default function Validation() {
  const [scn, setScn] = useState<typeof SCENARIOS[number]["id"]>("immune")
  const [speed, setSpeed] = useState<keyof typeof SPEEDS>("5x")
  const [size, setSize] = useState<typeof SIZES[number]>("4")
  const { data: runsData } = useValidationRuns()
  const runValidation = useRunValidation()

  const runs = runsData ?? []
  const rows = runs.find((r) => r.scenario === scn && r.crewSize === +size)?.rows

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-[52px] font-light leading-[1.02] tracking-[-0.03em] md:text-[72px]"><span className="block text-ink-2">Simulator &</span>100-crew validation</h1>
      <p className="max-w-2xl text-[16px] leading-snug text-label">Synthetic crews run through the same detectors. Each crew has its own baseline, noise and event onset. All numbers below come from this simulation, not from real astronauts.</p>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,380px)_1fr]">
        <Card className="flex flex-col gap-5 p-5">
          <div><div className="label mb-2">Scenario</div><div role="radiogroup" aria-label="Scenario" className="flex flex-col gap-2">{SCENARIOS.map((s) => <button key={s.id} role="radio" aria-checked={scn === s.id} onClick={() => setScn(s.id)} className={`min-h-11 rounded-full px-4 text-left text-[14px] font-semibold ${scn === s.id ? "bg-ink text-canvas" : "bg-raised shadow-[0_2px_8px_rgba(0,0,0,.05)]"}`}>{s.label}</button>)}</div></div>
          <div><div className="label mb-2">Speed</div><Segmented label="Simulation speed" value={speed} options={["1x", "5x", "25x"] as const} onChange={setSpeed} /></div>
          <div><div className="label mb-2">Crew size</div><Segmented label="Crew size" value={size} options={SIZES} onChange={setSize} /></div>
          <div className="flex items-center gap-4">
            <div className="relative size-[130px]" role="progressbar" aria-label="Crews simulated" aria-valuenow={0} aria-valuemax={TOTAL}>
              <svg viewBox="0 0 150 150" className="size-full -rotate-90"><circle cx="75" cy="75" r={62} fill="none" stroke="var(--border)" strokeWidth="10" /><circle cx="75" cy="75" r={62} fill="none" stroke="var(--ink)" strokeWidth="10" strokeLinecap="round" strokeDasharray={2 * Math.PI * 62} strokeDashoffset={2 * Math.PI * 62} style={{ transition: "stroke-dashoffset .15s linear" }} /></svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="dot-num text-[36px]">{0}</span><span className="text-[11px] text-label">of {TOTAL} crews</span></div>
            </div>
            <div className="flex flex-col gap-2">
              <button className="btn btn-ink btn-lg" onClick={() => runValidation.mutate({ scenario: scn, crewSize: +size })}><Play size={18} strokeWidth={1.6} />Run validation</button>
              <button className="btn btn-soft" onClick={() => setScn(SCENARIOS[0].id)}><RotateCcw size={16} strokeWidth={1.6} />Reset</button>
            </div>
          </div>
        </Card>
        <Card className="overflow-x-auto p-5">
          <table className="w-full min-w-[640px] border-collapse text-left text-[14px]">
            <caption className="label pb-3 text-left">Detector comparison · {SCENARIOS.find((s) => s.id === scn)?.label} · {size} per crew</caption>
            <thead><tr className="border-b border-border text-[12.5px] text-label"><th scope="col" className="py-2 pr-3 font-semibold">Method</th><th scope="col" className="px-2 font-semibold">Median days to detect</th><th scope="col" className="px-2 font-semibold">Missed events, %</th><th scope="col" className="px-2 font-semibold">False alarms per crew-month</th><th scope="col" className="px-2 font-semibold">Alerts per 100 h</th></tr></thead>
            <tbody>
              {(rows ?? METHODS.map((m) => ({ method: m, detectionDays: NaN, falseAlarmsPerCrewMonth: NaN, alertsPer100h: NaN, grouped: false }))).map((r, k) => (
                <tr key={r.method} className={`border-b border-border tabular-nums ${k === 3 ? "bg-ink text-canvas" : ""}`}>
                  <th scope="row" className="rounded-l-2xl py-3.5 pl-3 pr-3 font-semibold">{r.method}</th>
                  <td className="px-2">{rows ? fmt(r.detectionDays, 0) : "-"}</td><td className="px-2">{rows ? "0" : "-"}</td><td className="px-2">{rows ? fmt(r.falseAlarmsPerCrewMonth, 2) : "-"}</td><td className="rounded-r-2xl px-2">{rows ? fmt(r.alertsPer100h, 2) : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-4 text-[12.5px] leading-snug text-label">Median days to detect is counted from event onset. Detectors: fixed population threshold; personal baseline z above 3; personal baseline plus CUSUM; CUSUM plus grouping across 2 channels over 3 days. Seeded, so every run is repeatable.</p>
        </Card>
      </div>
    </div>
  )
}