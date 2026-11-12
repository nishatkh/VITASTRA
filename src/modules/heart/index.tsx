import { useState, useEffect, useRef } from "react"
import { Link } from "react-router"
import { ModuleShell, StatusRow, NextActions } from "../../components/Layout"
import { DotNum } from "../../components/DotNum"
import { EcgLine } from "../../components/EcgLine"
import { BaselineChart } from "../../components/Charts"
import { MetricTile, levelFromCount } from "../../components/Stat"
import { SourceChip, SectionHead } from "../../components/ui"
import { useEvaluation, useBaselines } from "../../api/hooks"
import { EmptyChart, SkeletonCard } from "../../components/EmptyState"
import type { MetricKey, Level } from "../../data/types"

export default function Heart() {
  const day = 0
  const { data: ev } = useEvaluation(day)
  const { data: baselinesData } = useBaselines(day)
  const [m, setM] = useState<MetricKey>("restHR")

  // ── Telemetry data binding ───────────────────────────────────────────
  const liveHR = ev?.nowS?.hr ?? 60
  const liveSm = (ev?.sm ?? {}) as Record<string, number>

  if (!ev) {
    return (
      <ModuleShell title={["Heart &", "Circulation"]}>
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </ModuleShell>
    )
  }

  const bl = baselinesData ?? []
  const restHRBaseline = bl.find((b) => b.metric === "restHR")
  const hrvBaseline = bl.find((b) => b.metric === "hrv")
  const hrrBaseline = bl.find((b) => b.metric === "hrr")

  const currentRestHR = liveSm.restHR ?? ev.sm.restHR
  const currentHrv = liveSm.hrv ?? ev.sm.hrv
  const currentSpo2 = liveSm.spo2 ?? ev.sm.spo2
  const currentHrr = liveSm.hrr ?? ev.sm.hrr

  const flags = [
    restHRBaseline && (currentRestHR - restHRBaseline.mean) / restHRBaseline.sd >= 2,
    hrvBaseline && (currentHrv - hrvBaseline.mean) / hrvBaseline.sd <= -2,
    hrrBaseline && (currentHrr - hrrBaseline.mean) / hrrBaseline.sd <= -2,
    ev.strain,
  ]
  const n = flags.filter(Boolean).length
  const level = levelFromCount(n)

  const drifted = restHRBaseline && (currentRestHR - restHRBaseline.mean) / restHRBaseline.sd >= 2

  const displaySm: Record<string, number> = {
    restHR: currentRestHR,
    hrv: currentHrv,
    spo2: currentSpo2,
    hrr: currentHrr,
  }

  return (
    <ModuleShell title={["Heart &", "Circulation"]}>

      {/* ── Live rate card + floating heart (no box) ── */}
      <div className="col-span-full relative">

        {/* Heart GIF — responsive scaling, floats on the right and overflows upward gracefully */}
        <div className="absolute -top-8 sm:-top-16 md:-top-24 lg:-top-32 -right-3 sm:-right-2 md:right-0 select-none pointer-events-none z-10">
          <img
            src="https://static.wixstatic.com/media/10d771_e303381262274d379bdd53ad6b7a2e36~mv2.gif"
            alt="Beating heart"
            className="w-36 h-36 sm:w-56 sm:h-56 md:w-80 md:h-80 lg:w-[420px] lg:h-[420px] xl:w-[480px] xl:h-[480px] object-contain drop-shadow-[0_0_30px_rgba(239,68,68,0.45)] sm:drop-shadow-[0_0_55px_rgba(239,68,68,0.55)] md:drop-shadow-[0_0_80px_rgba(239,68,68,0.65)]"
          />
        </div>

        {/* Card — full width, never shrunk by the GIF */}
        <section className="card w-full overflow-hidden relative" aria-label="Live heart rate">
          {/* Fade out card bg on the right where the heart sits */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/60 pointer-events-none z-0" />
          <div className="p-4 sm:p-5 pb-2 flex flex-col gap-2 sm:gap-3 max-w-[65%] sm:max-w-[60%] md:max-w-[55%]">
            <div className="flex items-center gap-2">
              <span className="live-pulse size-2 rounded-full bg-signal" aria-hidden />
              <span className="label">Heart rate · live</span>
            </div>
            <DotNum value={liveHR} unit="bpm" size={92} />
            <div className="text-[12px] sm:text-[13px] text-label leading-snug">
              Continuous telemetry stream · live QRS wave
            </div>
            <SourceChip kind="nasa" label="Continuous ECG & Cardiorespiratory Telemetry" />
          </div>
          {/* ECG — full card width, tall */}
          <div className="w-full px-2 pb-3">
            <EcgLine bpm={liveHR} color="var(--signal)" height={110} />
          </div>
        </section>

      </div>

      <div className="grid grid-cols-2 gap-3">
        {(["restHR", "hrv", "spo2", "hrr"] as MetricKey[]).map((k) => (
          <MetricTile key={k} k={k} value={displaySm[k]} selected={m === k} onClick={() => setM(k)} />
        ))}
      </div>
      <section className="card p-5">
        <div className="label mb-1">{ev.sm[m] !== undefined ? `${m} vs your baseline` : "Select a metric"}</div>
        {ev ? <BaselineChart metric={m} day={day} /> : <EmptyChart title="No evaluation data" />}
        {drifted && restHRBaseline && (
          <p className="mt-3 rounded-2xl liquid-glass-clear p-3 text-[14px] leading-snug">
            Drift note: resting HR has moved{" "}
            {(ev.sm.restHR - restHRBaseline.mean).toFixed(1)} bpm above your
            baseline. Each day looks normal. The trend is what changed.
          </p>
        )}
      </section>
      <StatusRow
        level={level}
        title={level === "normal" ? "Inside your baseline" : "Circulation drift pattern"}
        confidence={Math.min(0.92, 0.3 + 0.15 * n)}
        why={[
          `Resting HR ${ev.sm.restHR.toFixed(1)} bpm (baseline ${restHRBaseline?.mean.toFixed(1) ?? "—"}).`,
          `HRV ${ev.sm.hrv.toFixed(0)} ms (baseline ${hrvBaseline?.mean.toFixed(0) ?? "—"}).`,
          `HR recovery ${ev.sm.hrr.toFixed(0)} bpm after exercise (baseline ${hrrBaseline?.mean.toFixed(0) ?? "—"}).`,
          ev.strain
            ? "Live heart rate is above what the Body Twin expects for current activity."
            : "Live heart rate matches the Body Twin expectation.",
        ]}
      />
      <NextActions
        items={
          level === "normal"
            ? [
              "Keep the routine exercise and sleep schedule",
              "Next drift check runs automatically overnight",
            ]
            : [
              "Repeat a resting HR reading after 10 minutes of quiet sitting",
              "Compare with the Body Twin view for unexplained strain",
              "Add the trend to the next medical conference (MED-1.1)",
            ]
        }
      />
      <SectionHead>Related views</SectionHead>
      <div className="flex flex-wrap gap-2">
        {[
          ["Body Twin", "/twin"],
          ["Sensor-Fault Check", "/sensor"],
          ["Bone & Muscle", "/bone"],
          ["Immune Stress", "/immune"],
          ["Vision & Fluid Shift", "/vision"],
        ].map(([l, to]) => (
          <Link key={to} to={to} className="btn btn-soft !min-h-11">
            {l}
          </Link>
        ))}
      </div>
    </ModuleShell>
  )
}