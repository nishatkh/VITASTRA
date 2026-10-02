import { DotNum } from "./DotNum"
import type { MetricKey } from "../data/types"

const METRICS: Record<MetricKey, { label: string; unit: string; dec: number; domain?: [number, number] }> = {
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

const BASE_MEAN: Record<MetricKey, number> = {
  restHR: 58,
  hrv: 64,
  spo2: 97.6,
  hrr: 32,
  sleep: 7.1,
  temp: 36.55,
  stress: 32,
  mood: 3.9,
  vision: 100,
  reaction: 265,
  balance: 1.0,
  co2: 3200,
}

export function MetricTile({
  k,
  value,
  selected,
  onClick,
}: {
  k: MetricKey
  value: number
  selected?: boolean
  onClick?: () => void
}) {
  const m = METRICS[k]
  const d = value - BASE_MEAN[k]
  return (
    <button
      onClick={onClick}
      aria-pressed={selected}
      className={`card flex min-h-[132px] flex-col items-start gap-2 p-4 text-left transition-shadow ${
        selected ? "ring-2 ring-ink" : ""
      }`}
    >
      <span className="label">{m.label}</span>
      <DotNum value={value} dec={m.dec} unit={m.unit} size={36} />
      <span className="text-[12.5px] text-label">
        {Math.abs(d) < Math.pow(10, -m.dec)
          ? "On baseline"
          : `${d > 0 ? "+" : ""}${d.toFixed(m.dec)} vs baseline`}
      </span>
    </button>
  )
}

export const levelFromCount = (n: number, warn = 3) =>
  (n >= warn
    ? "warning"
    : n >= 1
      ? "observe"
      : "normal") as "normal" | "observe" | "warning"
