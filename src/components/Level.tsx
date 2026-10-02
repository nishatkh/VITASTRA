import type { Level } from "../data/types"

const LABEL: Record<Level, string> = {
  normal: "Normal",
  observe: "Observe",
  warning: "Warning",
  critical: "Critical",
}
export const levelLabel = (l: Level) => LABEL[l]

export function LevelDot({ level, size = 12 }: { level: Level; size?: number }) {
  const base = { width: size, height: size }
  if (level === "normal")
    return (
      <span
        aria-hidden
        className="inline-block shrink-0 rounded-full"
        style={{ ...base, background: "var(--ink-3)" }}
      />
    )
  if (level === "observe")
    return (
      <span
        aria-hidden
        className="inline-block shrink-0 rounded-full border-2 border-ink"
        style={base}
      />
    )
  if (level === "warning")
    return (
      <span
        aria-hidden
        className="inline-block shrink-0 rounded-full bg-warning"
        style={base}
      />
    )
  return (
    <span
      aria-hidden
      className="crit-pulse inline-block shrink-0 rounded-full bg-signal"
      style={base}
    />
  )
}

export function AlertBadge({
  level,
  text,
  dark,
}: {
  level: Level
  text?: string
  dark?: boolean
}) {
  const levelStyle = {
    normal: dark
      ? "bg-inset text-on-nav"
      : "bg-raised text-ink shadow-[0_2px_8px_rgba(0,0,0,.06)]",
    observe: "bg-ink/10 text-ink border border-ink/20",
    warning: "bg-warning/20 text-ink border border-warning/40",
    critical: "bg-signal/15 text-ink border border-signal/30",
  }[level] ?? (dark ? "bg-inset text-on-nav" : "bg-raised text-ink shadow-[0_2px_8px_rgba(0,0,0,.06)]")

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[13px] font-semibold ${levelStyle}`}
      aria-label={`Level: ${LABEL[level]}${text ? ". " + text : ""}`}
    >
      <LevelDot level={level} />
      {text ?? LABEL[level]}
    </span>
  )
}

export function ConfidenceBar({
  value,
  dark,
  label = "Confidence",
}: {
  value: number
  dark?: boolean
  label?: string
}) {
  const pct = Math.round(value * 100)
  return (
    <div>
      <div
        className={`mb-1.5 flex justify-between text-[12px] ${
          dark ? "text-on-nav/70" : "text-label"
        }`}
      >
        <span>{label}</span>
        <span className="tabular-nums font-semibold">{pct}%</span>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        className={`h-1.5 overflow-hidden rounded-full ${
          dark ? "bg-border" : "bg-border"
        }`}
      >
        <div
          className={`h-full rounded-full transition-[width] duration-500 ${
            dark ? "bg-signal" : "bg-ink"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
