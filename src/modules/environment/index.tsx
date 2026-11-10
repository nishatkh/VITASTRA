import { useMemo } from "react"
import { Link } from "react-router"
import { Radiation } from "lucide-react"
import {
  ModuleShell,
  StatusRow,
  NextActions,
  useModuleAlert,
} from "../../components/Layout"
import { DotNum } from "../../components/DotNum"
import { DotWave } from "../../components/DotWave"
import { Card, SourceChip } from "../../components/ui"
import { useEvaluation, useLatestEnvironment, useEnvironmentReadings } from "../../api/hooks"
import { useApp } from "../../store/useApp"
import { EmptyChart, SkeletonCard } from "../../components/EmptyState"
import { AreaTrend, CHART_COLORS } from "../../components/Analytics"
import type { Level } from "../../data/types"

export default function Environment() {
  const day = useApp((s) => s.day)
  const { data: ev } = useEvaluation(day)
  const { data: latestEnv } = useLatestEnvironment()
  const { data: envHistory } = useEnvironmentReadings({ from: Math.max(0, day - 59), to: day })
  const a = useModuleAlert("cabin")

  const e = latestEnv ?? ev?.env
  const hist = envHistory?.slice(-60).map((v) => (v.co2 - 2500) / 3800) ?? []

  // ── Full cabin environment profile (chart-ready series) ──
  const envSeries = useMemo(() => {
    const h = envHistory ?? []
    return h.map((v, i) => ({
      d: `D${Math.max(1, day - (h.length - 1 - i))}`,
      temp: +v.temp.toFixed(1),
      humidity: Math.round(v.humidity),
      voc: +(v.voc ?? 0).toFixed(2),
      o2: +v.o2.toFixed(2),
    }))
  }, [envHistory, day])

  if (!ev || !e) {
    return (
      <ModuleShell title={["Closed", "Environment"]}>
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </ModuleShell>
    )
  }

  const level: Level = a?.level ?? "normal"
  const cabin = [
    `CO2 ${Math.round(e.co2)} ppm`,
    `Temperature ${e.temp.toFixed(1)} C`,
    `Oxygen ${e.o2.toFixed(2)} %`,
  ]
  const body = [
    `Heart rate ${ev.gapNow >= 1 ? "+" : ""}${ev.gapNow.toFixed(0)} bpm vs expected`,
    ev.rawSignals.some((s) => s.id === "head") ? "Headache reported" : "No headache reported",
    ev.rawSignals.some((s) => s.id === "breath") ? "Breathing rate up" : "Breathing rate steady",
  ]
  const tiles: [string, string, string][] = [
    ["Oxygen", e.o2.toFixed(2), "%"],
    ["Pressure", e.pressure.toFixed(1), "kPa"],
    ["Temperature", e.temp.toFixed(1), "C"],
    ["Humidity", e.humidity.toFixed(0), "%"],
    ["VOC", e.voc.toFixed(0), "ppb"],
  ]
  return (
    <ModuleShell title={["Closed", "Environment"]}>
      <Card className="p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="label">Cabin CO2</span>
          <SourceChip kind="nasa" label="OSDR environment" />
        </div>
        <div className="my-2 sm:my-3">
          <DotNum value={e.co2} unit="ppm" size={84} />
        </div>
        {hist.length > 0 ? (
          <DotWave
            values={hist}
            rows={8}
            label={`Cabin CO2 over 60 days, now ${Math.round(e.co2)} ppm`}
          />
        ) : (
          <EmptyChart title="No CO2 history" description="Environmental data will appear when connected to a backend." />
        )}
      </Card>

      {/* Live env readings — equal tiles: 6-in-a-line on desktop, responsive wrap below */}
      <div className="col-span-full grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {tiles.map(([l, v, u]) => (
          <div key={l} className="liquid-glass-primary glass-hover flex min-w-0 flex-col gap-1.5 sm:gap-2 p-3 sm:p-3.5">
            <div className="label truncate !text-[11px]">{l}</div>
            <div className="whitespace-nowrap text-[17px] sm:text-[19px] font-semibold tabular-nums leading-none tracking-[-0.03em] text-ink">
              {v}
              <span className="ml-0.5 text-[11px] sm:text-[12px] font-medium text-label">{u}</span>
            </div>
          </div>
        ))}
        <Link
          to="/radiation"
          className="liquid-glass-primary glass-hover flex min-w-0 flex-col justify-between gap-1.5 sm:gap-2 p-3 sm:p-3.5"
        >
          <Radiation size={18} strokeWidth={1.5} className="text-ink" />
          <span className="text-[12px] sm:text-[13px] font-semibold">Radiation</span>
        </Link>
      </div>

      {/* Cabin Environment Profile */}
      <Card className="col-span-full p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="label font-semibold text-ink text-[12px] sm:text-[13px]">Full Cabin Environment Profile · 60 days</span>
          <SourceChip kind="nasa" label="ECLSS telemetry" />
        </div>
        {envSeries.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <AreaTrend
              data={envSeries}
              xKey="d"
              yKeys={["temp"]}
              labels={["Temperature"]}
              colors={[CHART_COLORS.teal]}
              unit="C"
              decimals={1}
              height={130}
              ariaLabel="Cabin temperature over 60 days, around 22 degrees C with daily fluctuation."
            />
            <AreaTrend
              data={envSeries}
              xKey="d"
              yKeys={["humidity"]}
              labels={["Humidity"]}
              colors={[CHART_COLORS.violet]}
              unit="%"
              height={130}
              ariaLabel="Cabin humidity over 60 days, around 50 to 55 percent."
            />
            <AreaTrend
              data={envSeries}
              xKey="d"
              yKeys={["o2"]}
              labels={["Oxygen"]}
              colors={[CHART_COLORS.emerald]}
              unit="%"
              decimals={2}
              height={130}
              refValue={19.5}
              refLabel="Min 19.5 kPa"
              ariaLabel="Cabin oxygen concentration over 60 days, staying above the 19.5 percent minimum threshold."
            />
            <AreaTrend
              data={envSeries}
              xKey="d"
              yKeys={["voc"]}
              labels={["VOC index"]}
              colors={[CHART_COLORS.amber]}
              decimals={2}
              height={130}
              ariaLabel="Volatile organic compound index over 60 days, around 0.10 to 0.15."
            />
          </div>
        ) : (
          <EmptyChart
            title="No cabin history"
            description="Environmental profile charts appear when the telemetry stream is connected."
          />
        )}
      </Card>
      <Card className="col-span-full lg:col-span-1 p-4 sm:p-5">
        <div className="mb-3 text-[17px] sm:text-[19px] font-semibold tracking-[-0.02em]">Which one changed?</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
          {[
            ["The cabin changed", cabin, (e?.co2 ?? 0) > 4200],
            ["The body changed", body, ev.strain],
          ].map(([t, rows, on]) => (
            <div
              key={t as string}
              className={`rounded-[18px] sm:rounded-[22px] p-3.5 sm:p-4 ${on ? "liquid-glass-dark text-white" : "liquid-glass-clear shadow-[0_2px_8px_rgba(0,0,0,.05)]"}`}
            >
              <div className="text-[13.5px] sm:text-[14px] font-semibold">{t as string}</div>
              <div className={`mb-2 text-[11px] sm:text-[11.5px] ${on ? "text-white/60" : "text-label"}`}>
                {on ? "Yes" : "No change"}
              </div>
              <ul className="flex flex-col gap-1.5 text-[12px] sm:text-[12.5px] leading-snug">
                {(rows as string[]).map((r) => (
                  <li key={r} className="break-words">{r}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[13px] sm:text-[13.5px] text-label">
          {(e?.co2 ?? 0) > 4200 && ev.strain
            ? "The cabin moved first. The body followed."
            : (e?.co2 ?? 0) > 4200
            ? "The cabin changed. The body has not yet."
            : "Both the cabin and the body are steady."}
        </p>
      </Card>
      <StatusRow
        alert={a}
        level={level}
        title={a ? "Cabin CO2 rising" : "Cabin steady"}
        confidence={a?.confidence ?? 0.9}
        why={a?.why ?? ["CO2, oxygen, pressure and temperature sit in their usual range."]}
      />
      <NextActions
        items={
          a
            ? a.actions
            : ["No action needed. Cabin sensors keep logging locally"]
        }
      />
    </ModuleShell>
  )
}



