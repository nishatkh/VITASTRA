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
import type { Level } from "../../data/types"

export default function Environment() {
  const day = useApp((s) => s.day)
  const { data: ev } = useEvaluation(day)
  const { data: latestEnv } = useLatestEnvironment()
  const { data: envHistory } = useEnvironmentReadings({ from: Math.max(0, day - 59), to: day })
  const a = useModuleAlert("cabin")

  const e = latestEnv ?? ev?.env
  const hist = envHistory?.slice(-60).map((v) => (v.co2 - 2500) / 3800) ?? []

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
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <span className="label">Cabin CO2</span>
          <SourceChip kind="nasa" label="OSDR environment" />
        </div>
        <div className="my-3">
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
      <div className="grid grid-cols-3 gap-3">
        {tiles.map(([l, v, u]) => (
          <div key={l} className="card p-3.5">
            <div className="label !text-[11px]">{l}</div>
            <div className="mt-1 text-[22px] font-semibold tabular-nums tracking-[-0.03em]">
              {v}
              <span className="ml-0.5 text-[12px] font-medium text-label">{u}</span>
            </div>
          </div>
        ))}
        <Link to="/radiation" className="card flex flex-col justify-between p-3.5">
          <Radiation size={18} strokeWidth={1.5} />
          <span className="text-[13px] font-semibold">Radiation</span>
        </Link>
      </div>
      <Card className="p-5">
        <div className="mb-3 text-[19px] font-semibold tracking-[-0.02em]">Which one changed?</div>
        <div className="grid grid-cols-2 gap-3">
          {[
            ["The cabin changed", cabin, (e?.co2 ?? 0) > 4200],
            ["The body changed", body, ev.strain],
          ].map(([t, rows, on]) => (
            <div
              key={t as string}
              className={`rounded-[22px] p-4 ${on ? "bg-ink text-canvas" : "bg-raised shadow-[0_2px_8px_rgba(0,0,0,.05)]"}`}
            >
              <div className="text-[14px] font-semibold">{t as string}</div>
              <div className={`mb-2 text-[11.5px] ${on ? "text-canvas/60" : "text-label"}`}>
                {on ? "Yes" : "No change"}
              </div>
              <ul className="flex flex-col gap-1.5 text-[12.5px] leading-snug">
                {(rows as string[]).map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[13.5px] text-label">
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