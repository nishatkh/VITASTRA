/**
 * Analytics kit — shared visualizations used across modules.
 * Styled with the app's CSS variables so it follows the design system
 * (signal/warning/ink/baseline-band). No layout assumptions: every chart
 * lives inside ResponsiveContainer or a fixed-viewBox SVG and respects
 * the glass-card aesthetic already used throughout VITASTRA.
 * All motion is disabled where possible (isAnimationActive={false}) to
 * honor prefers-reduced-motion users of the underlying data.
 */
import { useMemo } from "react"
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Line,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

const tick = { fontSize: 11, fill: "var(--ink-3)" }

const GLASS_TIP = {
  borderRadius: 14,
  border: "1px solid var(--border)",
  background: "rgba(4, 16, 26, 0.92)",
  color: "var(--ink)",
  fontSize: 12,
  boxShadow: "0 8px 24px rgba(0,0,0,.35)",
}

const TIP_ITEM = { color: "var(--ink-2)" } as const
const TIP_LABEL = { color: "var(--label)", marginBottom: 2 } as const

export function ChartCaption({ items }: { items: [string, string][] }) {
  return (
    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 px-2 text-[11.5px] text-label">
      {items.map(([color, text]) => (
        <span key={text} className="flex items-center gap-1.5">
          <i className="h-2.5 w-3.5 rounded-sm" style={{ background: color }} />
          {text}
        </span>
      ))}
    </div>
  )
}

/**
 * Single-series area trend (e.g. temperature, cumulative dose).
 * data: [{ x: <label day|hour>, y: <value> }]
 */
export function AreaTrend({
  data,
  xKey,
  yKeys,
  labels,
  colors,
  ariaLabel,
  height = 170,
  unit = "",
  refValue,
  refLabel,
  decimals = 0,
}: {
  data: Array<Record<string, number | string | null>>
  xKey: string
  yKeys: string[]
  labels: string[]
  colors: string[]
  ariaLabel: string
  height?: number
  unit?: string
  refValue?: number
  refLabel?: string
  decimals?: number
}) {
  return (
    <div role="img" aria-label={ariaLabel}>
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={data} margin={{ top: 8, right: 6, left: -18, bottom: 0 }}>
          <CartesianGrid stroke="var(--border)" strokeOpacity={0.25} vertical={false} />
          <XAxis
            dataKey={xKey}
            tick={tick}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            minTickGap={28}
          />
          <YAxis width={44} tick={tick} tickLine={false} axisLine={false} domain={["auto", "auto"]} />
          <Tooltip
            contentStyle={GLASS_TIP}
            itemStyle={TIP_ITEM}
            labelStyle={TIP_LABEL}
            formatter={(v, n) => [
              v == null ? "—" : Number(v).toFixed(decimals) + (unit ? " " + unit : ""),
              labels[yKeys.indexOf(String(n))] ?? String(n),
            ]}
          />
          {refValue != null && (
            <ReferenceLine
              y={refValue}
              stroke="var(--warning)"
              strokeDasharray="4 4"
              strokeOpacity={0.7}
              label={{ value: refLabel, position: "insideTopRight", fill: "var(--warning)", fontSize: 10 }}
            />
          )}
          {yKeys.map((k, i) => (
            <Area
              key={k}
              dataKey={k}
              stroke={colors[i]}
              strokeWidth={1.6}
              fill={colors[i]}
              fillOpacity={0.14}
              dot={false}
              connectNulls={false}
              isAnimationActive={false}
              activeDot={{ r: 3.5, fill: colors[i], strokeWidth: 0 }}
              type="monotone"
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
      <ChartCaption items={labels.map((l, i) => [colors[i], l])} />
    </div>
  )
}

/** Rounded bar series. data: [{ x, ...keys }]; color per bar via bars[i]. */
export function BarSeries({
  data,
  xKey,
  keys,
  names,
  colors,
  ariaLabel,
  height = 170,
  unit = "",
  stacked = false,
  decimals = 0,
}: {
  data: Array<Record<string, number | string | null>>
  xKey: string
  keys: string[]
  names: string[]
  colors: string[]
  ariaLabel: string
  height?: number
  unit?: string
  stacked?: boolean
  decimals?: number
}) {
  return (
    <div role="img" aria-label={ariaLabel}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 8, right: 6, left: -18, bottom: 0 }}>
          <CartesianGrid stroke="var(--border)" strokeOpacity={0.25} vertical={false} />
          <XAxis dataKey={xKey} tick={tick} tickLine={false} axisLine={false} />
          <YAxis width={44} tick={tick} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={GLASS_TIP}
            itemStyle={TIP_ITEM}
            labelStyle={TIP_LABEL}
            cursor={{ fill: "var(--border)", fillOpacity: 0.3 }}
            formatter={(v, n) => [
              v == null ? "—" : Number(v).toFixed(decimals) + (unit ? " " + unit : ""),
              names[keys.indexOf(String(n))] ?? String(n),
            ]}
          />
          {keys.map((k, i) => (
            <Bar
              key={k}
              dataKey={k}
              stackId={stacked ? "s" : undefined}
              fill={colors[i]}
              radius={stacked ? 0 : [5, 5, 0, 0]}
              isAnimationActive={false}
              name={names[i]}
              maxBarSize={26}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
      <ChartCaption items={names.map((n, i) => [colors[i], n])} />
    </div>
  )
}

/**
 * Thin multi-line compare (e.g. dose-rate vs cumulative, temp vs humidity).
 * Keep lines <= 3 for legibility on the glass panels.
 */
export function LineCompare({
  data,
  xKey,
  keys,
  labels,
  colors,
  ariaLabel,
  height = 170,
  unit = "",
  dashed,
  decimals = 0,
}: {
  data: Array<Record<string, number | string | null>>
  xKey: string
  keys: string[]
  labels: string[]
  colors: string[]
  ariaLabel: string
  height?: number
  unit?: string
  dashed?: boolean[]
  decimals?: number
}) {
  return (
    <div role="img" aria-label={ariaLabel}>
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={data} margin={{ top: 8, right: 6, left: -18, bottom: 0 }}>
          <CartesianGrid stroke="var(--border)" strokeOpacity={0.25} vertical={false} />
          <XAxis
            dataKey={xKey}
            tick={tick}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            minTickGap={28}
          />
          <YAxis width={44} tick={tick} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={GLASS_TIP}
            itemStyle={TIP_ITEM}
            labelStyle={TIP_LABEL}
            formatter={(v, n) => [
              v == null ? "—" : Number(v).toFixed(decimals) + (unit ? " " + unit : ""),
              labels[keys.indexOf(String(n))] ?? String(n),
            ]}
          />
          {keys.map((k, i) => (
            <Line
              key={k}
              dataKey={k}
              stroke={colors[i]}
              strokeWidth={1.6}
              dot={false}
              connectNulls={false}
              isAnimationActive={false}
              activeDot={{ r: 3.5, fill: colors[i], strokeWidth: 0 }}
              type="monotone"
              strokeDasharray={dashed?.[i] ? "5 4" : undefined}
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
      <ChartCaption items={labels.map((l, i) => [colors[i], l])} />
    </div>
  )
}

/** Pure SVG donut. segments: [{ value, color }]. Center label optional. */
export function DonutGraph({
  segments,
  centerValue,
  centerLabel,
  ariaLabel,
  size = 132,
  thickness = 13,
}: {
  segments: Array<{ value: number; color: string }>
  centerValue?: string
  centerLabel?: string
  ariaLabel: string
  size?: number
  thickness?: number
}) {
  const total = segments.reduce((s, x) => s + x.value, 0)
  const r = (size - thickness) / 2
  const c = 2 * Math.PI * r
  let offset = 0
  return (
    <div role="img" aria-label={ariaLabel} className="relative inline-flex shrink-0">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--inset)"
          strokeWidth={thickness}
          opacity={0.6}
        />
        {total > 0 &&
          segments.map(
            (s, i) =>
              s.value > 0 && (
                <circle
                  key={i}
                  cx={size / 2}
                  cy={size / 2}
                  r={r}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={thickness}
                  strokeDasharray={`${(s.value / total) * c} ${c}`}
                  strokeDashoffset={-offset}
                  strokeLinecap="butt"
                />
              ),
          )}
      </svg>
      {total > 0 &&
        segments.map(
          (s, i) =>
            s.value > 0 && (
              <circle
                key={`o-${i}`}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={s.color}
                strokeWidth={thickness + 4}
                strokeDasharray={`${(s.value / total) * c} ${c}`}
                strokeDashoffset={-offset}
                opacity={0.22}
                style={{ transform: "rotate(0deg)" }}
              />
            ),
        )}
      <span className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="dot-num text-[20px] font-semibold text-ink">{centerValue}</span>
        {centerLabel && <span className="label !text-[10px] mt-0.5">{centerLabel}</span>}
      </span>
    </div>
  )
}

/** Semi-circular gauge. value in [0,1]. */
export function GaugeGraph({
  value,
  ariaLabel,
  label,
  size = 148,
}: {
  value: number
  ariaLabel: string
  label: string
  size?: number
}) {
  const pct = Math.max(0, Math.min(1, value))
  const r = size / 2 - 12
  const cx = size / 2
  const cy = size / 2 + 4
  const arc = Math.PI * r
  const color = pct >= 0.85 ? "var(--signal)" : pct >= 0.6 ? "var(--warning)" : "var(--crit, #ef4444)"
  return (
    <div role="img" aria-label={ariaLabel} className="relative inline-flex shrink-0 flex-col items-center">
      <svg width={size} height={size * 0.62} viewBox={`0 0 ${size} ${size * 0.62}`}>
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="var(--inset)"
          strokeWidth={12}
          strokeLinecap="round"
          opacity={0.6}
        />
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke={color}
          strokeWidth={12}
          strokeLinecap="round"
          strokeDasharray={`${pct * arc} ${arc}`}
        />
      </svg>
      <span
        style={{ color }}
        className="dot-num mt-1 text-[26px] font-semibold"
      >
        {Math.round(pct * 100)}%
      </span>
      <span className="label !text-[10.5px]">{label}</span>
    </div>
  )
}

/**
 * Radar profile: values normalized to [0, 1] against a reference envelope.
 * items: [{ k, label, value (0..1), ref (0..1) }]
 */
export function RadarProfile({
  items,
  ariaLabel,
  height = 200,
}: {
  items: Array<{ label: string; value: number; ref: number }>
  ariaLabel: string
  height?: number
}) {
  const data = useMemo(
    () => items.map((it) => ({ k: it.label, v: Math.max(0, Math.min(1, it.value)), ref: it.ref })),
    [items],
  )
  return (
    <div role="img" aria-label={ariaLabel}>
      <ResponsiveContainer width="100%" height={height}>
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid stroke="var(--border)" strokeOpacity={0.5} />
          <PolarAngleAxis dataKey="k" tick={{ ...tick, fontSize: 10.5 }} />
          <PolarRadiusAxis domain={[0, 1]} tick={false} axisLine={false} />
          <Tooltip
            contentStyle={GLASS_TIP}
            itemStyle={TIP_ITEM}
            labelStyle={TIP_LABEL}
            formatter={(v, n) => [`${Math.round(Number(v) * 100)}% of band`, n === "ref" ? "Reference band" : "Measured"]}
          />
          <Radar
            name="ref"
            dataKey="ref"
            stroke="var(--ink-3)"
            strokeWidth={1}
            strokeDasharray="4 4"
            fill="var(--baseline-band)"
            fillOpacity={0.7}
            isAnimationActive={false}
          />
          <Radar
            name="v"
            dataKey="v"
            stroke="var(--signal)"
            strokeWidth={1.6}
            fill="var(--signal)"
            fillOpacity={0.22}
            isAnimationActive={false}
          />
        </RadarChart>
      </ResponsiveContainer>
      <ChartCaption
        items={[
          ["var(--signal)", "Measured sample"],
          ["var(--baseline-band)", "Reference band"],
        ]}
      />
    </div>
  )
}

/**
 * Compact stacked horizontal bars (pure CSS) — used for level/distribution
 * breakdowns where an axis would be overkill.
 */
export function StackBar({
  parts,
  ariaLabel,
}: {
  parts: Array<{ value: number; color: string; label: string }>
  ariaLabel: string
}) {
  const total = parts.reduce((s, p) => s + p.value, 0) || 1
  return (
    <div>
      <div
        role="img"
        aria-label={ariaLabel}
        className="flex h-3 w-full overflow-hidden rounded-full bg-border"
      >
        {parts.map(
          (p, i) =>
            p.value > 0 && (
              <div
                key={i}
                title={`${p.label}: ${p.value}`}
                style={{ width: `${(p.value / total) * 100}%`, background: p.color }}
              />
            ),
        )}
      </div>
    </div>
  )
}

/** Deterministic pseudo-random in [0,1) — stable across renders. */
export function seeded(n: number) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

export const CHART_COLORS = {
  signal: "var(--signal)",
  ink: "var(--ink)",
  warning: "var(--warning)",
  label: "var(--ink-3)",
  cyan300: "#67e8f9",
  teal: "#2dd4bf",
  violet: "#a78bfa",
  red: "#f87171",
  amber: "#e879f9",
  emerald: "#34d399",
}
