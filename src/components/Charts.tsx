import { useMemo } from "react"
import {
  Area,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts"
import type { MetricKey } from "../data/types"

const N = 183

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

function trendData(metric: MetricKey, day: number) {
  const d = Math.floor(day)
  return Array.from({ length: d + 1 }, (_, i) => ({
    d: i + 1,
    v: 0,
    lo: 0,
    hi: 0,
  }))
}

const tick = { fontSize: 11, fill: "var(--ink-3)" }

export function BaselineChart({
  metric,
  day,
  height = 190,
  dark,
}: {
  metric: MetricKey
  day: number
  height?: number
  dark?: boolean
}) {
  const d = Math.floor(day)
  const data = useMemo(
    () => trendData(metric, d).map((p) => ({ ...p, band: [p.lo, p.hi] })),
    [metric, d],
  )
  const m = METRICS[metric]
  const last = data[data.length - 1]
  return (
    <div
      role="img"
      aria-label={`${m.label} over ${d + 1} days. Latest ${last.v.toFixed(m.dec)} ${m.unit}. Personal baseline band ${last.lo.toFixed(m.dec)} to ${last.hi.toFixed(m.dec)}.`}
    >
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart
          data={data}
          margin={{ top: 8, right: 6, left: -22, bottom: 0 }}
        >
          <XAxis
            type="number"
            dataKey="d"
            domain={[1, N]}
            ticks={[1, 60, 120, 183]}
            tick={tick}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={m.domain ?? ["auto", "auto"]}
            tick={tick}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => Number(v).toFixed(m.dec > 1 ? 1 : 0)}
            width={44}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 14,
              border: "none",
              boxShadow: "0 8px 24px rgba(0,0,0,.15)",
              fontSize: 12,
            }}
            formatter={(v, n) =>
              (n === "band"
                ? ["", ""]
                : [
                    Number(v).toFixed(m.dec) + " " + m.unit,
                    "Value",
                  ]) as [string, string]
            }
            labelFormatter={(l) => `Day ${l}`}
          />
          <Area
            dataKey="band"
            stroke="none"
            fill="var(--baseline-band)"
            fillOpacity={1}
            isAnimationActive={false}
            activeDot={false}
            name="band"
          />
          <Line
            dataKey="v"
            stroke="var(--ink)"
            strokeWidth={1.6}
            dot={false}
            isAnimationActive={false}
            activeDot={{ r: 4, fill: "var(--signal)" }}
          />
          <ReferenceLine
            x={d + 1}
            stroke="var(--ink-3)"
            strokeOpacity={0.25}
            strokeDasharray="2 3"
          />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="mt-1 flex items-center gap-4 px-2 text-[11.5px] text-label">
        <span className="flex items-center gap-1.5">
          <i className="h-0.5 w-4 bg-ink" />
          {m.label}
        </span>
        <span className="flex items-center gap-1.5">
          <i
            className="h-2.5 w-4 rounded-sm"
            style={{ background: "var(--baseline-band)" }}
          />
          Your baseline band
        </span>
      </div>
    </div>
  )
}
