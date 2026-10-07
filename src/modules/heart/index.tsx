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

  // ── Live continuous data ───────────────────────────────────────────────
  const [liveHR, setLiveHR] = useState(60)
  const [liveSm, setLiveSm] = useState<Record<string, number>>({})
  const hrRef = useRef(60)

  useEffect(() => {
    if (ev?.nowS?.hr) {
      hrRef.current = ev.nowS.hr
      setLiveHR(ev.nowS.hr)
    }
    if (ev?.sm) {
      setLiveSm(ev.sm)
    }
  }, [ev])

  useEffect(() => {
    const id = setInterval(() => {
      // Walk live heart rate
      const newHR = Math.max(50, Math.min(100, hrRef.current + (Math.random() - 0.49) * 2.2))
      hrRef.current = newHR
      setLiveHR(Math.round(newHR * 10) / 10)

      // Micro drift for summary metrics so they feel continuous
      setLiveSm((prev) => {
        if (!prev.restHR) return prev
        return {
          ...prev,
          restHR: +(prev.restHR + (Math.random() - 0.5) * 0.1).toFixed(1),
          hrv: Math.max(20, Math.min(100, Math.round(prev.hrv + (Math.random() - 0.5) * 0.6))),
          spo2: +(Math.max(95, Math.min(99.8, prev.spo2 + (Math.random() - 0.5) * 0.05))).toFixed(1),
        }
      })
    }, 2500)
    return () => clearInterval(id)
  }, [])

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
      {/* ── Live Heart Rate Card ── */}
      <section className="card p-5" aria-label="Live heart rate">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="live-pulse size-2 rounded-full bg-signal" aria-hidden />
            <span className="label">Heart rate · live</span>
          </div>
          <SourceChip kind="synthetic" />
        </div>

        <div className="my-3">
          <DotNum value={liveHR} unit="bpm" size={92} />
        </div>

        <div className="mb-3 text-[13.5px] text-label">
          Continuous telemetry stream · live QRS wave
        </div>

        <div className="w-full pt-1">
          <EcgLine bpm={liveHR} color="var(--signal)" height={64} />
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3">
        {(["restHR", "hrv", "spo2", "hrr"] as MetricKey[]).map((k) => (
          <MetricTile key={k} k={k} value={displaySm[k]} selected={m === k} onClick={() => setM(k)} />
        ))}
      </div>
      <section className="card p-5">
        <div className="label mb-1">{ev.sm[m] !== undefined ? `${m} vs your baseline` : "Select a metric"}</div>
        {ev ? <BaselineChart metric={m} day={day} /> : <EmptyChart title="No evaluation data" />}
        {drifted && restHRBaseline && (
          <p className="mt-3 rounded-2xl bg-raised p-3 text-[14px] leading-snug shadow-[0_2px_8px_rgba(0,0,0,.05)]">
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