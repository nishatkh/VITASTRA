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
import { DotWave } from "../components/DotWave"
import { AlertBadge, LevelDot, levelLabel } from "../components/Level"
import { AlertCounter } from "../components/AlertCounter"
import { AlertCard } from "../components/WhyDrawer"
import { EmptyChart, SkeletonChart, SkeletonCard } from "../components/EmptyState"
import { useAstronaut, useEvaluation, useAlerts, useNextCheck, useCareerDose, useLatestEnvironment, useConnection } from "../api/hooks"
import { useApp } from "../store/useApp"

const CAREER_LIMIT = 600

export default function Home() {
  const day = useApp((s) => s.day)
  const { data: astronaut } = useAstronaut()
  const { data: ev, isLoading: evalLoading } = useEvaluation(day)
  const { data: alertsData } = useAlerts()
  const { data: nextCheck } = useNextCheck()
  const { data: careerDose } = useCareerDose()
  const { data: envReading } = useLatestEnvironment()
  const { state: commsState, queue } = useConnection()

  const alerts = alertsData ?? []
  const hr = ev?.nowS.hr
  const delta = ev ? ev.nowS.hr - ev.nowS.expectedHr : null
  const wave = ev?.live.map((s) => (s.hr - 45) / 75) ?? []
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
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <SkeletonCard />
      </div>
    )
  }

  return (
    <div className="grid items-start gap-5 pb-4 lg:grid-cols-12">
      <div className="col-span-full flex flex-wrap items-center gap-2">
        <ConnectionPill />
        <span className="inline-flex min-h-9 items-center rounded-full bg-raised px-3.5 text-[13px] shadow-[0_2px_8px_rgba(0,0,0,.06)]">
          Mission day {ev ? ev.day + 1 : 1}
        </span>
        <SourceChip kind="synthetic" />
      </div>
      <MissionTimeline />
      <div className="col-span-full lg:col-span-7">
        <GatherEvaluateAct />
      </div>

      <section className="card p-5 lg:col-span-5" aria-label="Heart rate">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="live-pulse size-2 rounded-full bg-signal" aria-hidden />
            <span className="label">Heart rate · live</span>
          </div>
          <IconBtn icon={History} label="Heart history" to="/body" size={44} />
        </div>
        {hr != null ? (
          <>
            <div className="mt-3"><DotNum value={hr} unit="bpm" size={96} /></div>
            <div className="mb-4 mt-1 text-[13.5px] text-label">
              {delta != null && Math.abs(delta) < 1
                ? "On your baseline"
                : delta != null
                ? `${delta > 0 ? "+" : ""}${delta.toFixed(0)} bpm vs your baseline`
                : "No baseline yet"}
            </div>
            {wave.length > 0 ? (
              <DotWave values={wave} rows={9} label={`Heart rate over the last hour, now ${Math.round(hr)} beats per minute`} />
            ) : (
              <EmptyChart title="No heart-rate data" description="Connect a wearable or import a FIT file." />
            )}
          </>
        ) : (
          <EmptyChart title="No heart-rate data" description="Connect a wearable or import a FIT file." />
        )}
      </section>

      <div className="grid grid-cols-2 gap-3 lg:col-span-6 lg:grid-cols-4">
        <Link to="/alerts" className="card flex flex-col gap-3 p-4">
          <span className="label">Overall status</span>
          <AlertBadge level={ev?.overall ?? "normal"} />
          <span className="text-[13px] leading-snug text-label">
            {ev?.overall === "normal" ? "Inside your baseline" : `${alerts.length} grouped alert${alerts.length > 1 ? "s" : ""}`}
          </span>
        </Link>
        <Link to="/radiation" className="card flex flex-col gap-3 p-4">
          <span className="label flex items-center gap-1.5">
            <Radiation size={14} strokeWidth={1.6} />Radiation
          </span>
          <span className="text-[26px] font-semibold tabular-nums leading-none tracking-[-0.03em]">
            {careerDose ? Math.round(careerDose.total) : "—"}
            <span className="text-[13px] font-medium text-label"> / {CAREER_LIMIT} mSv</span>
          </span>
          <span className="h-1.5 overflow-hidden rounded-full bg-border" role="progressbar" aria-label="Career dose" aria-valuenow={careerDose ? Math.round(careerDose.pct * 100) : 0}>
            <span className="block h-full rounded-full bg-ink" style={{ width: `${careerDose ? careerDose.pct * 100 : 0}%` }} />
          </span>
        </Link>
        <Link to="/env" className="card flex flex-col gap-2 p-4">
          <span className="label flex items-center gap-1.5">
            <Wind size={14} strokeWidth={1.6} />Cabin CO2
          </span>
          <DotNum value={envReading?.co2 ?? 0} size={38} />
          <span className="flex items-center gap-2 text-[13px] text-label">
            <LevelDot
              level={
                (envReading?.co2 ?? 0) > 5000
                  ? "warning"
                  : (envReading?.co2 ?? 0) > 4200
                  ? "observe"
                  : "normal"
              }
            />
            ppm
          </span>
        </Link>
        <Link to="/checks" className="card flex flex-col gap-2 p-4">
          <span className="label flex items-center gap-1.5">
            <CalendarClock size={14} strokeWidth={1.6} />Next check
          </span>
          <span className="text-[18px] font-semibold capitalize leading-tight tracking-[-0.02em]">
            {nextCheck ? `${nextCheck.type} check` : "None due"}
          </span>
          <span className="text-[13px] text-label">
            {nextCheck ? (inDays <= 0 ? "Due today" : `In ${inDays} day${inDays > 1 ? "s" : ""}`) : ""}
          </span>
        </Link>
      </div>

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