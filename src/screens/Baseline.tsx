import { Screen } from "../components/Layout"
import { Card, Title } from "../components/ui"
import { BaselineChart } from "../components/Charts"
import { EmptyChart, SkeletonCard } from "../components/EmptyState"
import { useBaselines, useEvaluation } from "../api/hooks"
import { useApp } from "../store/useApp"
import type { MetricKey } from "../data/types"

const METRICS_LOCAL = {
  restHR: { label: "Resting heart rate", unit: "bpm", dec: 1 },
  hrv: { label: "Heart-rate variability", unit: "ms", dec: 0 },
  spo2: { label: "Blood oxygen (SpO2)", unit: "%", dec: 1, domain: [94, 100] },
  hrr: { label: "HR recovery, 1 min", unit: "bpm", dec: 0 },
  sleep: { label: "Sleep", unit: "h", dec: 1 },
  temp: { label: "Skin temperature", unit: "C", dec: 2, domain: [36.2, 37.1] },
  stress: { label: "Stress score", unit: "/100", dec: 0 },
  mood: { label: "Mood", unit: "/5", dec: 1, domain: [1, 5] },
  vision: { label: "Vision index", unit: "pts", dec: 1 },
  reaction: { label: "Reaction time", unit: "ms", dec: 0 },
  balance: { label: "Balance sway", unit: "idx", dec: 2 },
  co2: { label: "Cabin CO2", unit: "ppm", dec: 0 },
}

export default function Baseline() {
  const day = useApp((s) => s.day)
  const { data: baselinesData, isLoading: baselinesLoading } = useBaselines(day)
  const { data: ev, isLoading: evalLoading } = useEvaluation(day)

  if (evalLoading || baselinesLoading) {
    return (
      <Screen>
        <Title a="Personal" b="Baseline" />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </Screen>
    )
  }

  const bl = baselinesData ?? []
  const phase = day < 30 ? "Calibrating" : "Adapting"

  return (
    <Screen>
      <Title a="Personal" b="Baseline" />
      <Card className="p-5">
        <div className="label">Adapting timeline</div>
        <div
          className="my-4 flex items-center"
          role="img"
          aria-label={`Baseline phase: ${phase}, day ${day + 1}`}
        >
          {["Calibrating (days 1 to 30)", "Adapting (slow update)"].map(
            (t, i) => {
              const on = (i === 0) === (day < 30)
              return (
                <div
                  key={t}
                  className={`flex-1 rounded-full px-3 py-3 text-center text-[12.5px] font-semibold ${
                    on ? "bg-ink text-canvas" : "bg-border text-label"
                  } ${i ? "-ml-4" : ""}`}
                >
                  {t}
                </div>
              )
            },
          )}
        </div>
        <p className="text-[14px] leading-snug text-label">
          Your band is your own first 30 days. After that it drifts slowly
          toward your new normal, but only when a value stays within 1.5
          standard deviations, so a developing problem is never absorbed into
          the baseline.
        </p>
      </Card>
      <Card className="p-5">
        <div className="mb-3 label">Your baselines today</div>
        {bl.length === 0 ? (
          <EmptyChart
            title="No baseline data yet"
            description="Baselines are computed from your first 30 days of measurements. Connect a data source to begin calibration."
          />
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {bl.map((b) => (
              <li
                key={b.metric}
                className="flex items-center justify-between py-3 text-[14px]"
              >
                <span>{b.label}</span>
                <span className="tabular-nums text-label">
{b.mean.toFixed(METRICS_LOCAL[b.metric as MetricKey].dec)} ±{" "}
{(b.sd * 1.5).toFixed(METRICS_LOCAL[b.metric as MetricKey].dec)}{" "}
                  {b.unit}
                  <span className="ml-2 rounded-full bg-border px-2 py-0.5 text-[11px] font-semibold text-ink">
                    {b.phase}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
      <Card className="p-5">
        <div className="label mb-1">Resting heart rate vs band</div>
        {ev ? (
          <BaselineChart metric="restHR" day={day} />
        ) : (
          <EmptyChart title="No evaluation data" description="Evaluation data will appear when connected to a backend." />
        )}
        <div className="text-[12.5px] text-label">
          Initial baseline will be computed from first 30 days.
        </div>
      </Card>
    </Screen>
  )
}