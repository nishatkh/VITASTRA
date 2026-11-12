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
import { AreaTrend, BarSeries, CHART_COLORS } from "../components/Analytics"
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

// ── Monthly summary (analytic rebuild) ──────────────────────────────────────
const MONTH_DATA = [
  { month: "May", hr: 58, hrv: 53, spo2: 97.8, stress: 28, rad: 0.47, mood: 72 },
  { month: "Jun", hr: 59, hrv: 52, spo2: 97.7, stress: 29, rad: 0.48, mood: 71 },
  { month: "Jul", hr: 58, hrv: 51, spo2: 97.8, stress: 31, rad: 0.49, mood: 70 },
  { month: "Aug", hr: 60, hrv: 50, spo2: 97.6, stress: 33, rad: 0.48, mood: 69 },
  { month: "Sep", hr: 61, hrv: 49, spo2: 97.8, stress: 35, rad: 0.50, mood: 68 },
  { month: "Oct", hr: 62, hrv: 48, spo2: 97.8, stress: 38, rad: 0.49, mood: 68 },
]

function MonthlySummary() {
  const trendData = MONTH_DATA.map((d) => ({ x: d.month, hr: d.hr, hrv: d.hrv }))
  const stressData = MONTH_DATA.map((d) => ({ x: d.month, stress: d.stress }))
  const moodData = MONTH_DATA.map((d) => ({ x: d.month, mood: d.mood }))
  const radData = MONTH_DATA.map((d) => ({ x: d.month, rad: d.rad }))

  const first = MONTH_DATA[0]
  const latest = MONTH_DATA[MONTH_DATA.length - 1]
  const hrvDelta = latest.hrv - first.hrv
  const stressDelta = latest.stress - first.stress
  const hrDelta = latest.hr - first.hr

  const chips: Array<[string, string, string]> = [
    [`${latest.hr} bpm`, hrDelta === 0 ? "HR · flat" : `HR · ${hrDelta > 0 ? "+" : ""}${hrDelta} over 6 mo`, hrDelta > 0 ? "text-signal" : "text-ink"],
    [`${latest.hrv} ms`, `HRV · ${hrvDelta > 0 ? "+" : ""}${hrvDelta} over 6 mo`, hrvDelta < 0 ? "text-warning" : "text-signal"],
    [`${latest.stress}`, `Stress · ${stressDelta > 0 ? "+" : ""}${stressDelta} over 6 mo`, stressDelta > 0 ? "text-warning" : "text-signal"],
    [`${latest.mood}`, "Mood · latest", "text-ink"],
  ]

  return (
    <div className="liquid-glass-primary space-y-4 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="label text-[13px] font-semibold text-ink">
          May → Oct · drift over mission
        </span>
        <span className="text-[11.5px] text-label">Hover a point for that month's values</span>
      </div>

      {/* quick-read chips */}
      <div className="flex flex-wrap gap-2">
        {chips.map(([value, label, tone]) => (
          <span
            key={label}
            className="inline-flex min-w-0 items-baseline gap-2 rounded-full liquid-glass-clear px-3 py-1 text-[11.5px] text-label"
          >
            <strong className={`text-[13px] font-semibold tabular-nums ${tone}`}>{value}</strong>
            {label}
          </span>
        ))}
      </div>

      <div className="grid gap-x-6 gap-y-5 md:grid-cols-2">
        <div>
          <span className="label mb-1 block !text-[11px]">Heart rate & HRV, monthly</span>
          <AreaTrend
            data={trendData}
            xKey="x"
            yKeys={["hr", "hrv"]}
            labels={["HR (bpm)", "HRV (ms)"]}
            colors={[CHART_COLORS.teal, CHART_COLORS.violet]}
            ariaLabel="Monthly heart rate and heart-rate-variability across the last six months: HR drifting up from 58 to 62 bpm while HRV falls from 53 to 48 milliseconds."
            height={152}
          />
        </div>

        <div>
          <span className="label mb-1 block !text-[11px]">Stress index, monthly</span>
          <BarSeries
            data={stressData}
            xKey="x"
            keys={["stress"]}
            names={["Stress index"]}
            colors={[CHART_COLORS.warning]}
            ariaLabel="Monthly stress index rising from 28 in May to 38 in October."
            height={152}
          />
        </div>

        <div>
          <span className="label mb-1 block !text-[11px]">Mood, monthly</span>
          <BarSeries
            data={moodData}
            xKey="x"
            keys={["mood"]}
            names={["Mood"]}
            colors={[CHART_COLORS.emerald]}
            ariaLabel="Monthly mood easing from 72 in May to 68 in October."
            height={152}
          />
        </div>

        <div>
          <span className="label mb-1 block !text-[11px]">Radiation dose, daily equivalent</span>
          <AreaTrend
            data={radData}
            xKey="x"
            yKeys={["rad"]}
            labels={["Dose (mSv/day)"]}
            colors={[CHART_COLORS.signal]}
            ariaLabel="Monthly average radiation dose, flat around 0.47 to 0.50 millisieverts per day."
            height={152}
            unit=" mSv"
            decimals={2}
          />
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

  // last-3-minutes HR series from the live ECG buffer (1 sample / 3 s)
  const hrSpark = liveWave.map((v, i) => ({
    x: i === liveWave.length - 1 ? "now" : `-${(liveWave.length - 1 - i) * 3}s`,
    hr: Math.round((45 + v * 75) * 10) / 10,
  }))
  const hrVals = hrSpark.map((p) => p.hr)
  const hrMin = hrVals.length ? Math.min(...hrVals) : 0
  const hrMax = hrVals.length ? Math.max(...hrVals) : 0
  const hrAvg = hrVals.length
    ? Math.round((hrVals.reduce((a, b) => a + b, 0) / hrVals.length) * 10) / 10
    : 0

  if (evalLoading) {
    return (
      <div className="grid items-start gap-5 pb-4 lg:grid-cols-12">
        <div className="col-span-full flex flex-wrap items-center gap-2">
          <ConnectionPill />
          <span className="inline-flex min-h-9 items-center rounded-full liquid-glass-clear px-3.5 text-[13px] shadow-[0_2px_8px_rgba(0,0,0,.06)]">
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
        <span className="inline-flex min-h-9 items-center rounded-full liquid-glass-clear px-3.5 text-[13px] shadow-[0_2px_8px_rgba(0,0,0,.06)]">
          Mission day {ev ? ev.day + 1 : 1}
        </span>
        <SourceChip kind="synthetic" />
      </div>

      <MissionTimeline />

      <div className="col-span-full">
        <GatherEvaluateAct />
      </div>

      {/* ── Live Heart Rate ── */}
      <section className="liquid-glass-primary glass-hover col-span-full lg:col-span-6 overflow-hidden relative min-h-[220px] sm:min-h-[260px]" aria-label="Heart rate">
        {/* Right-side glow behind the heart */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-rose-950/40 pointer-events-none" />

        {/* Heart pinned to the right, responsive scaling */}
        <div className="absolute -right-3 sm:-right-4 md:-right-6 top-1/2 -translate-y-1/2 pointer-events-none select-none">
          <img
            src="https://static.wixstatic.com/media/10d771_e303381262274d379bdd53ad6b7a2e36~mv2.gif"
            alt="Beating heart"
            className="w-32 h-32 sm:w-44 sm:h-44 md:w-56 md:h-56 lg:w-72 lg:h-72 object-contain drop-shadow-[0_0_25px_rgba(239,68,68,0.45)] sm:drop-shadow-[0_0_45px_rgba(239,68,68,0.55)] md:drop-shadow-[0_0_60px_rgba(239,68,68,0.6)]"
          />
        </div>

        {/* Left content — responsive max-width so it never overlaps the heart */}
        <div className="relative z-10 p-4 sm:p-5 flex flex-col gap-2.5 sm:gap-3 max-w-[65%] sm:max-w-[60%] lg:max-w-[55%]">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="live-pulse size-2 rounded-full bg-signal" aria-hidden />
              <span className="label">Heart rate · live</span>
            </div>
            <IconBtn icon={History} label="Heart history" to="/body" size={44} />
          </div>

          {/* BPM */}
          <DotNum value={liveHR} unit="bpm" size={92} />

          {/* Delta / trend */}
          <div className="flex items-center gap-2 text-[13.5px] text-label -mt-1">
            <span>
              {Math.abs(delta) < 1
                ? "On your baseline"
                : `${delta > 0 ? "+" : ""}${delta.toFixed(0)} bpm vs baseline`}
            </span>
            <Trend value={liveHR} prev={prevHR} unit=" bpm" />
          </div>

          {/* ECG line */}
          <EcgLine bpm={liveHR} color="var(--signal)" height={56} />

          {/* Sparkline */}
          {hrSpark.length >= 2 && (
            <div>
              <div className="mb-1 flex items-center justify-between">
                <span className="label !text-[10.5px]">Last 3 min</span>
                <span className="text-[11.5px] tabular-nums text-label">
                  min {hrMin} · avg {hrAvg} · max {hrMax} bpm
                </span>
              </div>
              <AreaTrend
                data={hrSpark}
                xKey="x"
                yKeys={["hr"]}
                labels={["HR (bpm)"]}
                colors={[CHART_COLORS.signal]}
                ariaLabel="Heart rate over the last three minutes with your personal baseline marked."
                height={72}
                unit=" bpm"
                decimals={1}
                refValue={baselineHR}
                refLabel="baseline"
              />
            </div>
          )}
        </div>
      </section>

      {/* ── 4 Mini Stat Cards (2x2 Grid) ── */}
      <div className="col-span-full lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <Link to="/alerts" className="liquid-glass-primary glass-hover flex flex-col justify-between p-4.5 hover:border-border-strong transition-colors">
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

        <Link to="/radiation" className="liquid-glass-primary glass-hover flex flex-col justify-between p-4.5 hover:border-border-strong transition-colors">
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
            <span className="h-1.5 overflow-hidden rounded-full bg-border/40 block" role="progressbar"
              aria-label="Career dose" aria-valuenow={Math.round((liveRad / CAREER_LIMIT) * 100)}>
              <span className="block h-full rounded-full liquid-glass-dark transition-all duration-1000"
                style={{ width: `${(liveRad / CAREER_LIMIT) * 100}%` }} />
            </span>
          </div>
        </Link>

        <Link to="/env" className="liquid-glass-primary glass-hover flex flex-col justify-between p-4.5 hover:border-border-strong transition-colors">
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

        <Link to="/checks" className="liquid-glass-primary glass-hover flex flex-col justify-between p-4.5 hover:border-border-strong transition-colors">
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
        <div className="mt-3">
          <MonthlySummary />
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
          <div className="liquid-glass-primary flex items-center gap-3 p-5">
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




