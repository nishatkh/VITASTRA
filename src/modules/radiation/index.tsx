import { useState } from "react"
import { useApp } from "../../store/useApp"
import { Link } from "react-router"
import { Orbit } from "lucide-react"
import { ModuleShell, StatusRow, NextActions } from "../../components/Layout"
import { DotNum } from "../../components/DotNum"
import { DotWave } from "../../components/DotWave"
import { Card, Glossary, SourceChip } from "../../components/ui"
import { SlideToAct } from "../../components/SlideToAct"
import { useEvaluation, useCareerDose, useSolarEvents, useRadiationLedger } from "../../api/hooks"
import type { Level } from "../../data/types"
import { EmptyChart, SkeletonCard } from "../../components/EmptyState"

const CAREER_LIMIT = 600
const ASSUMED_Q = 2.0

const CHECK = [
  "Stop non-essential work and leave the module",
  "Move to the designated shelter area",
  "Close the hatch and confirm crew count",
  "Log each crew position on the tablet",
  "Stay until the flight surgeon gives the all-clear",
]

export default function Radiation() {
  const day = useApp((s) => s.day)
  const { data: ev } = useEvaluation(day)
  const { data: careerDose } = useCareerDose()
  const { data: solarEventsData } = useSolarEvents()
  const { data: radiationLedger } = useRadiationLedger({ from: Math.max(0, day - 59), to: day })
  const spe = false // Would come from API
  const [ticks, setTicks] = useState<boolean[]>(CHECK.map(() => false))

  if (!ev) {
    return (
      <ModuleShell title={["Radiation", "Dose Meter"]}>
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </ModuleShell>
    )
  }

  const level: Level = spe ? "critical" : (careerDose?.pct ?? 0) > 0.75 ? "observe" : "normal"
  const rates = radiationLedger?.slice(-60).map((r) => r.doseRate) ?? []
  const wave = rates.map((r) => (r - 0.3) / 1.1)
  const ev0 = solarEventsData?.[0]

  return (
    <ModuleShell title={["Radiation", "Dose Meter"]}>
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <span className="label">Career effective dose</span>
          <SourceChip kind="nasa" label="NASA RadLab + DONKI" />
        </div>
        <div className="my-3">
          <DotNum value={careerDose?.total ?? ev.career.total} unit={`of ${CAREER_LIMIT} mSv limit`} size={84} />
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-border" role="progressbar" aria-label="Career dose versus limit" aria-valuenow={Math.round((careerDose?.pct ?? 0) * 100)}>
          <div className="h-full rounded-full bg-ink transition-[width] duration-500" style={{ width: `${(careerDose?.pct ?? 0) * 100}%` }} />
        </div>
        <p className="mt-3 text-[13.5px] leading-snug text-label">
          This flight so far: {ev.dose.cumulative.toFixed(0)} mSv. Absorbed dose about {(ev.dose.cumulative / ASSUMED_Q).toFixed(0)} mGy.{" "}
          <Glossary term="Why is this an estimate?">
            RadLab gives absorbed dose; any conversion to effective dose is an assumption. Here the assumed quality factor is {ASSUMED_Q.toFixed(1)}.
          </Glossary>
        </p>
      </Card>
      <Card className="p-5">
        <div className="mb-2 flex items-center justify-between">
          <span className="label">Dose rate · last 60 days</span>
          <span className="text-[13px] font-semibold tabular-nums">{ev.doseRate.toFixed(2)} mSv/day</span>
        </div>
        {wave.length > 0 ? (
          <DotWave values={wave} rows={8} label={`Dose rate over 60 days, now ${ev.doseRate.toFixed(2)} millisieverts per day`} />
        ) : (
          <EmptyChart title="No dose rate history" description="Radiation data will appear when connected to a backend." />
        )}
      </Card>
      <Card className="p-5">
        <div className="flex items-center gap-3">
          <Orbit size={22} strokeWidth={1.5} />
          <div className="flex-1">
            <div className="text-[17px] font-semibold tracking-[-0.02em]">Solar storm watch</div>
            <div className="text-[13.5px] text-label">{spe ? "Earth-directed event reported by DONKI" : `No active event. Last: ${ev0?.kind ?? "none"}, day ${(ev0?.day ?? 0) + 1}.`}</div>
          </div>
        </div>
        {!spe && <button className="btn btn-soft mt-4 w-full">Run a solar-event drill (requires backend)</button>}
      </Card>
      {spe && (
        <section className="card p-5" aria-label="Shelter now checklist">
          <div className="mb-1 text-[22px] font-semibold tracking-[-0.02em]">Shelter now</div>
          <p className="mb-4 text-[14px] text-label">Tick each step as it is done. Large targets for gloved hands.</p>
          <ul className="mb-5 flex flex-col gap-2.5">
            {CHECK.map((c, i) => (
              <li key={c}>
                <label className="flex min-h-[64px] cursor-pointer items-center gap-4 rounded-[20px] bg-raised px-4 text-[16px] font-medium shadow-[0_2px_8px_rgba(0,0,0,.05)]">
                  <input type="checkbox" checked={ticks[i]} onChange={() => setTicks(ticks.map((t, j) => (j === i ? !t : t)))} className="size-8 shrink-0 accent-ink" /> {c}
                </label>
              </li>
            ))}
          </ul>
          <SlideToAct label="Slide to confirm shelter" doneLabel="Shelter confirmed" onConfirm={() => { useApp.getState().queue(); useApp.getState().audit_("Astronaut", "Shelter confirmed (RAD-5.2)") }} />
          <button onClick={() => { setTicks(CHECK.map(() => false)) }} className="btn btn-soft mt-3 w-full">End drill</button>
        </section>
      )}
      <StatusRow
        level={level}
        title={spe ? "Solar particle event" : level === "observe" ? "Approaching limit" : "Within plan"}
        confidence={spe ? 0.9 : 0.8}
        sources={[{ kind: "nasa", label: "NASA RadLab (OSDR)" }, { kind: "nasa", label: "NASA DONKI" }]}
        why={[`Career effective dose ${(careerDose?.total ?? ev.career.total).toFixed(0)} of ${CAREER_LIMIT} mSv (assumed conversion).`, `Dose rate ${ev.doseRate.toFixed(2)} mSv/day.`, spe ? "DONKI lists an earth-directed solar event." : "DONKI lists no active earth-directed event."]}
      />
      <NextActions
        items={
          spe ? ["Run the shelter checklist (RAD-5.2)", "Report crew positions to Mission Control (MED-1.1)"] : ["Keep crew dosimeter badges worn", "Check DONKI status before any planned spacewalk"]
        }
      />
      <Link to="/sources" className="btn btn-soft self-start">See where this data comes from</Link>
    </ModuleShell>
  )
}