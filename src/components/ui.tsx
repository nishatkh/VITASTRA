import { useState, type ReactNode, type HTMLAttributes } from "react"
import { Link } from "react-router"
import { Info, type LucideIcon } from "lucide-react"
import type { SourceKind } from "../data/types"

export function Card({
  dark,
  className = "",
  children,
  ...p
}: {
  dark?: boolean
  className?: string
  children: ReactNode
} & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`${dark ? "bg-nav text-on-nav" : "card"} ${className}`}
      {...p}
    >
      {children}
    </div>
  )
}

export function IconBtn({
  icon: Icon,
  label,
  to,
  onClick,
  dark,
  size = 48,
  className = "",
}: {
  icon: LucideIcon
  label: string
  to?: string
  onClick?: () => void
  dark?: boolean
  size?: number
  className?: string
}) {
  const cls = `icon-btn shrink-0 ${
    dark ? "bg-inset text-on-nav" : "text-ink"
  } ${className}`
  const st = { width: size, height: size }
  const inner = (
    <Icon size={size > 52 ? 26 : 20} strokeWidth={1.6} aria-hidden />
  )
  return to ? (
    <Link to={to} aria-label={label} className={cls} style={st}>
      {inner}
    </Link>
  ) : (
    <button aria-label={label} onClick={onClick} className={cls} style={st}>
      {inner}
    </button>
  )
}

export function Title({ a, b, dark }: { a: string; b: string; dark?: boolean }) {
  return (
    <h1 className="col-span-full text-[44px] lg:text-[64px] leading-[1.02] font-light tracking-[-0.035em]">
      <span
        className="block"
        style={{ color: dark ? "var(--on-nav-2)" : "var(--ink-2)" }}
      >
        {a}
      </span>
      <span className={`block ${dark ? "text-on-nav" : "text-ink"}`}>{b}</span>
    </h1>
  )
}

export function SourceChip({
  kind,
  label,
}: {
  kind: SourceKind
  label?: string
}) {
  return kind === "synthetic" ? (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-border px-2.5 py-1 text-[11px] font-medium text-label">
      <span className="size-1.5 rounded-full border border-ink-3" />
      {label ?? "Synthetic"}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-ink px-2.5 py-1 text-[11px] font-medium text-canvas">
      <span className="size-1.5 rounded-full bg-canvas" />
      {label ?? "NASA OSDR / RadLab / DONKI"}
    </span>
  )
}

export function Glossary({
  term,
  children,
}: {
  term: string
  children: ReactNode
}) {
  const [o, setO] = useState(false)
  return (
    <span className="relative inline-block">
      <button
        onClick={() => setO(!o)}
        aria-expanded={o}
        className="inline-flex min-h-6 items-center gap-1 underline decoration-dotted underline-offset-4"
      >
        {term}
        <Info size={13} strokeWidth={1.6} aria-hidden />
      </button>
      {o && (
        <span
          role="note"
          className="absolute left-0 top-full z-20 mt-2 block w-64 rounded-2xl bg-ink p-3 text-[13px] font-normal normal-case leading-snug tracking-normal text-canvas shadow-xl"
        >
          {children}
        </span>
      )}
    </span>
  )
}

export function AdviceFooter() {
  return (
    <p className="col-span-full px-4 pt-2 text-center text-[12.5px] leading-snug text-label">
      VITASTRA advises. The astronaut and mission procedures decide.
    </p>
  )
}

export function SectionHead({
  children,
  right,
}: {
  children: ReactNode
  right?: ReactNode
}) {
  return (
    <div className="flex items-end justify-between px-1 pt-2">
      <h2 className="text-[22px] font-semibold tracking-[-0.02em]">
        {children}
      </h2>
      {right}
    </div>
  )
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
  dark,
}: {
  value: T
  options: readonly T[]
  onChange: (v: T) => void
  label: string
  dark?: boolean
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={`flex rounded-full p-1 ${dark ? "bg-inset" : "bg-border"}`}
    >
      {options.map((o) => (
        <button
          key={o}
          role="radio"
          aria-checked={o === value}
          onClick={() => onChange(o)}
          className={`min-h-11 flex-1 rounded-full px-2 text-[13px] font-semibold transition-colors ${
            o === value
              ? dark
                ? "bg-raised text-ink"
                : "bg-ink text-canvas"
              : dark
                ? "text-on-nav/70"
                : "text-label"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  )
}
