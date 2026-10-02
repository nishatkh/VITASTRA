import { useState } from "react"
import { ChevronDown, CircleHelp } from "lucide-react"
import { Link } from "react-router"
import type { Alert } from "../data/types"
import { Sheet } from "./Sheet"
import { AlertBadge, ConfidenceBar, LevelDot } from "./Level"
import { SourceChip, AdviceFooter } from "./ui"

type Why = Pick<Alert, "title" | "level" | "why" | "confidence" | "sources"> & Partial<Alert>

export function WhyButton({
  info,
  dark,
  className = "",
}: {
  info: Why
  dark?: boolean
  className?: string
}) {
  const [o, setO] = useState(false)
  return (
    <>
      <button
        onClick={() => setO(true)}
        className={`btn ${
          dark ? "bg-inset text-on-nav" : "btn-soft"
        } ${className}`}
      >
        <CircleHelp size={18} strokeWidth={1.6} aria-hidden />
        Why am I seeing this?
      </button>
      <WhyDrawer info={info} open={o} onClose={() => setO(false)} />
    </>
  )
}

export function WhyDrawer({
  info,
  open,
  onClose,
}: {
  info: Why
  open: boolean
  onClose: () => void
}) {
  return (
    <Sheet open={open} onClose={onClose} title="Why am I seeing this?">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <AlertBadge level={info.level} />
          <span className="text-[15px] font-semibold">{info.title}</span>
        </div>
        <ConfidenceBar value={info.confidence} />
        <div>
          <div className="label mb-2">Contributing signals</div>
          <ul className="flex flex-col gap-2">
            {info.why.map((w, i) => (
              <li
                key={i}
                className="flex gap-3 rounded-2xl bg-raised p-3 text-[14.5px] leading-snug shadow-[0_2px_8px_rgba(0,0,0,.05)]"
              >
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-ink" />
                {w}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-wrap gap-2">
          {info.sources.map((s, i) => (
            <SourceChip key={i} kind={s.kind} label={s.label} />
          ))}
        </div>
        <p className="text-[13px] leading-snug text-label">
          This is a pattern, not a diagnosis. Decision support only.
        </p>
        <AdviceFooter />
      </div>
    </Sheet>
  )
}

export function RiskChain({ chain }: { chain: string[][] }) {
  const W = 320,
    colW = W / chain.length
  const rows = Math.max(...chain.map((c) => c.length))
  const H = 34 * rows + 20
  const pos = chain.map((col, ci) =>
    col.map((label, ri) => ({
      label,
      x: colW * ci + colW / 2,
      y: (H / (col.length + 1)) * (ri + 1),
    })),
  )
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      role="img"
      aria-label={`Risk chain: ${chain.map((c) => c.join(" and ")).join(", leading to ")}`}
    >
      {pos
        .slice(0, -1)
        .flatMap((col, ci) =>
          col.flatMap((a, i) =>
            pos[ci + 1].map((b, j) => (
              <path
                key={`${ci}-${i}-${j}`}
                d={`M${a.x},${a.y} C${a.x + colW / 2},${a.y} ${b.x - colW / 2},${b.y} ${b.x},${b.y}`}
                fill="none"
                stroke="var(--ink-3)"
                strokeOpacity=".35"
                strokeWidth="1.2"
              />
            )),
          ),
        )}
      {pos.flat().map((p, i) => {
        const last = chain.length - 1 === pos.findIndex((c) => c.includes(p))
        return (
          <g key={i}>
            <circle
              cx={p.x}
              cy={p.y}
              r={last ? 6 : 4.5}
              fill={last ? "var(--ink)" : "var(--raised)"}
              stroke="var(--ink)"
              strokeWidth="1.4"
            />
            <text
              x={p.x}
              y={p.y + 17}
              fontSize="8.6"
              textAnchor="middle"
              fill="var(--ink-3)"
            >
              {p.label.length > 26 ? p.label.slice(0, 25) + "…" : p.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export function AlertCard({
  alert,
  expandable,
  dark,
}: {
  alert: Alert
  expandable?: boolean
  dark?: boolean
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`${dark ? "bg-nav text-on-nav" : "card"} p-5`}>
      <div className="flex items-start gap-3">
        <span className="mt-1.5">
          <LevelDot level={alert.level} size={14} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="label">{alert.module}</div>
          <Link
            to={alert.route}
            className="block text-[19px] font-semibold leading-tight tracking-[-0.02em]"
          >
            {alert.title}
          </Link>
        </div>
        <AlertBadge level={alert.level} dark={dark} />
      </div>
      <div className="mt-4">
        <ConfidenceBar value={alert.confidence} dark={dark} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <WhyButton info={alert} dark={dark} />
        {expandable && (
          <button
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            className={`btn ${dark ? "bg-inset text-on-nav" : "btn-soft"}`}
          >
            {alert.grouped.length} grouped signals
            <ChevronDown
              size={18}
              strokeWidth={1.6}
              className={`transition-transform ${open ? "rotate-180" : ""}`}
            />
          </button>
        )}
      </div>
      {open && (
        <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4">
          <ul className="flex flex-col gap-1.5 text-[14px]">
            {alert.grouped.map((g, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-2 size-1 shrink-0 rounded-full bg-ink" />
                {g}
              </li>
            ))}
          </ul>
          <div className="label">Risk chain</div>
          <RiskChain chain={alert.chain} />
        </div>
      )}
    </div>
  )
}
