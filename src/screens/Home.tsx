import * as React from "react"
import { Link } from "react-router"
import {
  History,
  Radiation,
  Wind,
  CalendarClock,
  ShieldCheck,
} from "lucide-react"
import {
  IconBtn,
  SourceChip,
  SectionHead,
  AdviceFooter,
} from "../components/ui"
import { MissionTimeline } from "../components/MissionTimeline"
import { ConnectionPill } from "../components/Layout"
import { GatherEvaluateAct } from "../components/GatherEvaluateAct"
import { DotNum } from "../components/DotNum"
import { EcgLine } from "../components/EcgLine"
import { AlertBadge, LevelDot, levelLabel } from "../components/Level"
import { AlertCounter } from "../components/AlertCounter"
import { AlertCard } from "../components/WhyDrawer"
import { EmptyChart, SkeletonChart, SkeletonCard } from "../components/EmptyState"
import { useAstronaut, useEvaluation, useAlerts, useNextCheck, useCareerDose, useLatestEnvironment, useConnection } from "../api/hooks"
import { useApp } from "../store/useApp"

const CAREER_LIMIT = 600

// ── Trend arrow ─────────────────────────────────────────────────────────────
function Trend({ value, prev, unit = "" }: { value: number; prev: number; unit?: string }) {
  const diff = value - prev
  if (Math.abs(diff) < 0.5) return <span className="text-[12px] text-ink-3">→ stable</span>
  const up = diff > 0
  return (
    <span className={`inline-flex items-center gap-0.5 text-[12px] font-medium ${up ? "text-signal" : "text-warning"}`}>
      {up ? "↑" : "↓"} {Math.abs(diff).toFixed(1)}{unit}
    </span>
  )
}

// ── Monthly summary cards ────────────────────────────────────────────────────
const MONTHS = ["May", "Jun", "Jul", "Aug", "Sep", "Oct"]
const MONTH_DATA = MONTHS.map((m, i) => ({
  month: m,
  hr: Math.round(58 + Math.sin(i * 0.9) * 4 + Math.random() * 3),
  hrv: Math.round(52 + Math.sin(i * 0.7) * 5 + Math.random() * 3),
  spo2: +(97.4 + Math.sin(i * 0.5) * 0.4 + Math.random() * 0.2).toFixed(1),
  stress: Math.round(28 + Math.cos(i * 0.8) * 7 + Math.random() * 4),
  rad: +(0.47 + i * 0.01 + Math.random() * 0.02).toFixed(2),
  mood: Math.round(69 + Math.sin(i * 0.6) * 8 + Math.random() * 5),
}))

function MonthCard({ d }: { d: typeof MONTH_DATA[0] }) {
  const barPct = Math.min(100, (d.stress / 60) * 100)
  return (
    <div className="card flex flex-col gap-3 p-4">
      <span className="label font-semibold text-ink">{d.month}</span>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[12.5px]">
        <div className="flex flex-col">
          <span className="text-ink-3">Avg HR</span>
          <span className="font-semibold tabular-nums">{d.hr} <span className="font-normal text-ink-3">bpm</span></span>
        </div>
        <div className="flex flex-col">
          <span className="text-ink-3">HRV</span>
          <span className="font-semibold tabular-nums">{d.hrv} <span className="font-normal text-ink-3">ms</span></span>
        </div>
        <div className="flex flex-col">
          <span className="text-ink-3">SpO2</span>
          <span className="font-semibold tabular-nums">{d.spo2}<span className="font-normal text-ink-3">%</span></span>
        </div>
        <div className="flex flex-col">
          <span className="text-ink-3">Mood</span>
          <span className="font-semibold tabular-nums">{d.mood}</span>
        </div>
        <div className="col-span-2 flex flex-col">
          <div className="flex justify-between">
            <span className="text-ink-3">Stress index</span>
            <span className="font-semibold tabular-nums">{d.stress}</span>
          </div>
          <span className="mt-1 h-1 overflow-hidden rounded-full bg-border">
            <span className="block h-full rounded-full bg-ink" style={{ width: `${barPct}%` }} />
          </span>
        </div>
        <div className="col-span-2 flex flex-col">
          <span className="text-ink-3">Radiation dose</span>
          <span className="font-semibold tabular-nums">{d.rad} <span className="font-normal text-ink-3">mSv/day</span></span>
        </div>
      </div>
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────────────
export default function Home() {
  const day = useApp((s) => s.day)
  const { data: _astronaut } = useAstronaut()
  const { data: ev, isLoading: evalLoading } = useEvaluation(day)
  const { data: alertsData } = useAlerts()
  const { data: nextCheck } = useNextCheck()
  const { data: careerDose } = useCareerDose()
  const { data: _envReading } = useLatestEnvironment()
  const { state: _commsState, queue: _queue } = useConnection()

  // ── live-ticking vitals ─────────────────────────────────────────────────
  const [liveHR, setLiveHR] = React.useState(62)
  const [prevHR, setPrevHR] = React.useState(62)
  const [liveCO2, setLiveCO2] = React.useState(4350)
  const [prevCO2, setPrevCO2] = React.useState(4350)
  const [liveWave, setLiveWave] = React.useState<number[]>([])
  const [liveRad, setLiveRad] = React.useState(100.6)
  const hrRef = React.useRef(62)
  const co2Ref = React.useRef(4350)

  // seed from query once it arrives
  React.useEffect(() => {
    if (ev?.nowS?.hr) { hrRef.current = ev.nowS.hr; setLiveHR(ev.nowS.hr) }
    if (ev?.env?.co2) { co2Ref.current = ev.env.co2; setLiveCO2(ev.env.co2) }
    if (ev?.live) setLiveWave(ev.live.map((s: { hr: number }) => (s.hr - 45) / 75))
  }, [ev])

  React.useEffect(() => {
    if (careerDose) setLiveRad(careerDose.total)
  }, [careerDose])

  // tick every 3 s for HR + CO2, every 5 s for radiation
  React.useEffect(() => {
    const hrId = setInterval(() => {
      const newHR = Math.max(50, Math.min(100, hrRef.current + (Math.random() - 0.49) * 2.4))
      setPrevHR(hrRef.current)
      hrRef.current = newHR
      setLiveHR(Math.round(newHR * 10) / 10)

      const newCO2 = Math.max(3800, Math.min(5200, co2Ref.current + (Math.random() - 0.49) * 40))
      setPrevCO2(co2Ref.current)
      co2Ref.current = newCO2
      setLiveCO2(Math.round(newCO2))

      setLiveWave((prev) => {
        const next = [...prev, (newHR - 45) / 75]
        return next.length > 60 ? next.slice(-60) : next
      })
    }, 3000)

    const radId = setInterval(() => {
      setLiveRad((v) => Math.round((v + (Math.random() - 0.48) * 0.04) * 10) / 10)
    }, 5000)

    return () => { clearInterval(hrId); clearInterval(radId) }
  }, [])

  const alerts = alertsData ?? []
  const baselineHR = ev?.nowS?.expectedHr ?? 61
  const delta = liveHR - baselineHR
  const inDays = nextCheck ? nextCheck.due - (ev?.day ?? 0) : 0

  if (evalLoading) {
    return (
      <div className="grid items-start gap-5 pb-4 lg:grid-cols-12">
        <div className="col-span-full flex flex-wrap items-center gap-2">
          <ConnectionPill />
          <span className="inline-flex min-h-9 items-center rounded-full bg-raised px-3.5 text-[13px] shadow-[0_2px_8px_rgba(0,0,0,.06)]">
            Mission day {day + 1}
          </span>
          <SourceChip kind="synthetic" />
        </div>
        <SkeletonChart />
        <div className="col-span-full lg:col-span-7"><SkeletonCard /></div>
        <SkeletonCard />
        <div className="grid grid-cols-2 gap-3 lg:col-span-6 lg:grid-cols-4">
          <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
        <SkeletonCard />
      </div>
    )
  }

  return (
    <div className="grid items-start gap-5 pb-4 lg:grid-cols-12">

      {/* header pills */}
      <div className="col-span-full flex flex-wrap items-center gap-2">
        <ConnectionPill />
        <span className="inline-flex min-h-9 items-center rounded-full bg-raised px-3.5 text-[13px] shadow-[0_2px_8px_rgba(0,0,0,.06)]">
          Mission day {ev ? ev.day + 1 : 1}
        </span>
        <SourceChip kind="synthetic" />
      </div>

      <MissionTimeline />

      <div className="col-span-full">
        <GatherEvaluateAct />
      </div>

      {/* ── Live Heart Rate ── */}
      <section className="card p-5 col-span-full lg:col-span-6 flex flex-col justify-between" aria-label="Heart rate">
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="live-pulse size-2 rounded-full bg-signal" aria-hidden />
              <span className="label">Heart rate · live</span>
            </div>
            <IconBtn icon={History} label="Heart history" to="/body" size={44} />
          </div>

          <div className="mt-3">
            <DotNum value={liveHR} unit="bpm" size={92} />
          </div>

          <div className="mb-4 mt-1 flex items-center gap-3 text-[13.5px] text-label">
            <span>
              {Math.abs(delta) < 1
                ? "On your baseline"
                : `${delta > 0 ? "+" : ""}${delta.toFixed(0)} bpm vs baseline`}
            </span>
            <Trend value={liveHR} prev={prevHR} unit=" bpm" />
          </div>
        </div>

        {/* Animated ECG Waveform */}
        <div className="w-full pt-1">
          <EcgLine bpm={liveHR} color="var(--signal)" height={64} />
        </div>
      </section>

      {/* ── 4 Mini Stat Cards (2x2 Grid) ── */}
      <div className="col-span-full lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <Link to="/alerts" className="card flex flex-col justify-between p-4.5 hover:border-ink/20 transition-colors">
          <div>
            <span className="label block mb-2">Overall status</span>
            <AlertBadge level={ev?.overall ?? "normal"} />
          </div>
          <span className="text-[13px] leading-snug text-label mt-3 block">
            {ev?.overall === "normal"
              ? "Inside your baseline"
              : `${alerts.length} grouped alert${alerts.length > 1 ? "s" : ""}`}
          </span>
        </Link>

        <Link to="/radiation" className="card flex flex-col justify-between p-4.5 hover:border-ink/20 transition-colors">
          <div>
            <span className="label flex items-center gap-1.5 mb-2">
              <Radiation size={15} strokeWidth={1.6} />Radiation
            </span>
            <div className="text-[26px] font-semibold tabular-nums leading-none tracking-[-0.03em] text-ink">
              {Math.round(liveRad)}
              <span className="text-[13px] font-medium text-label"> / {CAREER_LIMIT} mSv</span>
            </div>
          </div>
          <div className="mt-3">
            <span className="h-1.5 overflow-hidden rounded-full bg-border block" role="progressbar"
              aria-label="Career dose" aria-valuenow={Math.round((liveRad / CAREER_LIMIT) * 100)}>
              <span className="block h-full rounded-full bg-ink transition-all duration-1000"
                style={{ width: `${(liveRad / CAREER_LIMIT) * 100}%` }} />
            </span>
          </div>
        </Link>

        <Link to="/env" className="card flex flex-col justify-between p-4.5 hover:border-ink/20 transition-colors">
          <div>
            <span className="label flex items-center gap-1.5 mb-1.5">
              <Wind size={15} strokeWidth={1.6} />Cabin CO2
            </span>
            <DotNum value={liveCO2} size={36} />
          </div>
          <div className="flex items-center gap-2 text-[13px] text-label mt-2">
            <LevelDot level={liveCO2 > 5000 ? "warning" : liveCO2 > 4200 ? "observe" : "normal"} />
            <span>ppm</span>
            <span className="text-ink-3">·</span>
            <span className="text-[12px] font-medium">{liveCO2 > 4200 ? "Elevated" : "Nominal"}</span>
          </div>
        </Link>

        <Link to="/checks" className="card flex flex-col justify-between p-4.5 hover:border-ink/20 transition-colors">
          <div>
            <span className="label flex items-center gap-1.5 mb-2">
              <CalendarClock size={15} strokeWidth={1.6} />Next check
            </span>
            <span className="text-[18px] font-semibold capitalize leading-tight tracking-[-0.02em] block text-ink">
              {nextCheck ? `${nextCheck.type} check` : "None due"}
            </span>
          </div>
          <span className="text-[13px] text-label mt-2 block">
            {nextCheck
              ? inDays <= 0 ? "Due today" : `In ${inDays} day${inDays > 1 ? "s" : ""}`
              : "All clear"}
          </span>
        </Link>
      </div>

      {/* ── Monthly Health Summary ── */}
      <div className="col-span-full">
        <SectionHead>Monthly Health Summary</SectionHead>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {MONTH_DATA.map((d) => <MonthCard key={d.month} d={d} />)}
        </div>
      </div>

      {/* ── Alerts section ── */}
      <div className="col-span-full grid gap-4 lg:grid-cols-2">
        <div className="col-span-full">
          <SectionHead
            right={
              <Link to="/alerts" className="min-h-11 px-2 pt-2 text-[14px] font-semibold text-label">
                All alerts
              </Link>
            }
          >
            Alerts
          </SectionHead>
        </div>
        <div className="col-span-full"><AlertCounter /></div>
        {alerts.length === 0 ? (
          <div className="card flex items-center gap-3 p-5">
            <ShieldCheck size={22} strokeWidth={1.5} />
            <p className="text-[15px] leading-snug">
              No alerts. All signals are inside your own baseline. Status: {levelLabel("normal")}.
            </p>
          </div>
        ) : (
          alerts.map((a) => <AlertCard key={a.id} alert={a} />)
        )}
      </div>

      <AdviceFooter />
    </div>
  )
}
