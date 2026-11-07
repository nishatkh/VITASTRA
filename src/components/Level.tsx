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
        className="inline-block shrink-0 rounded-full bg-ink-3"
        style={base}
      />
    )
  if (level === "observe")
    return (
      <span
        aria-hidden
        className="inline-block shrink-0 rotate-45 border-2 border-ink"
        style={{ width: size - 2, height: size - 2 }}
      />
    )
  if (level === "warning")
    return (
      <span
        aria-hidden
        className="inline-block shrink-0 bg-amber-500"
        style={{ ...base, clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }}
      />
    )
  return (
    <span
      aria-hidden
      className="crit-pulse inline-block shrink-0 bg-red-500"
      style={{ ...base, clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)" }}
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
  const levelStyle = dark
    ? {
        normal: "bg-white/10 text-white/90 border border-white/20",
        observe: "bg-white/15 text-white border border-white/30 font-semibold",
        warning: "bg-amber-500/25 text-amber-300 border border-amber-400/50 font-semibold",
        critical: "bg-red-500/30 text-red-300 border border-red-400/50 font-semibold",
      }[level]
    : {
        normal: "bg-white text-ink border border-border shadow-xs",
        observe: "bg-white text-ink border border-ink/30 font-semibold shadow-xs",
        warning: "bg-white text-amber-900 border border-amber-500/50 font-semibold shadow-xs",
        critical: "bg-white text-red-700 border border-red-500/50 font-semibold shadow-xs",
      }[level]

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] ${levelStyle}`}
      aria-label={`Level: ${LABEL[level]}${text ? ". " + text : ""}`}
    >
      <LevelDot level={level} size={10} />
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
