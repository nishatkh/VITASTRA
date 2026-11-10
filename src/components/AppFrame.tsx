import { useState, useRef, useCallback, useEffect, type ReactNode } from "react"
import { NavLink, useLocation, useNavigate } from "react-router"
import {
  CalendarCheck,
  SlidersHorizontal,
  ClipboardList,
  Dumbbell,
  FlaskConical,
} from "lucide-react"
import { Sheet, SheetRootCtx } from "./Sheet"
import { OfflineBanner } from "./Layout"
import { useEvaluation } from "../api/hooks"
import { useApp } from "../store/useApp"
import { levelLabel } from "./Level"
import { LiquidNavbar, NimbusIcons, type LiquidNavItem } from "./ui/liquid-glass-navbar"
import { ShaderBackground } from "./ui/test"

const astronaut = { id: "AX-07", name: "Cdr. Ines Varga", initials: "IV", role: "Flight Engineer", mission: "Expedition 74", crew: "Crew of 4" }
const checks = [
  { type: "vision", due: 3 },
  { type: "cognitive", due: 1 },
  { type: "balance", due: 5 },
  { type: "sample", due: 8 },
] as const
const sessions = [] as any[]
const N = 183

const TABS = [
  { to: "/", label: "Home" },
  { to: "/body", label: "Body" },
  { to: "/checks", label: "Checks" },
  { to: "/env", label: "Environment" },
  { to: "/coach", label: "Coach" },
  { to: "/more", label: "More" },
]

const MORE_ICON = (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
)

const LIQUID_ITEMS: LiquidNavItem[] = [
  { label: "Home", href: "/", icon: NimbusIcons.home, fx: "glow" },
  { label: "Body", href: "/body", icon: NimbusIcons.drop, fx: "drop" },
  { label: "Checks", href: "/checks", icon: NimbusIcons.globe, fx: "spin" },
  { label: "Environment", href: "/env", icon: NimbusIcons.plane, fx: "plane" },
  { label: "Coach", href: "/coach", icon: NimbusIcons.user, fx: "wave" },
  { label: "More", href: "/more", icon: MORE_ICON, fx: "pop" },
]
const tabFor = (p: string) => {
  if (p === "/") return "/"
  if (
    ["/body", "/bone", "/immune", "/vision", "/twin", "/sensor"].some((x) =>
      p.startsWith(x),
    )
  )
    return "/body"
  if (["/checks", "/cognitive"].some((x) => p.startsWith(x))) return "/checks"
  if (["/env", "/radiation"].some((x) => p.startsWith(x))) return "/env"
  if (p.startsWith("/coach")) return "/coach"
  return "/more"
}

const PILLS = [
  { to: "/alerts", label: "Alerts" },
  { to: "/inspiration4", label: "Inspiration4 (NASA OSDR)" },
  { to: "/research", label: "Space Biology Library" },
  { to: "/radiation", label: "Radiation" },
  { to: "/bone", label: "Exercise" },
  { to: "/mood", label: "Mood" },
  { to: "/timeline", label: "Timeline" },
  { to: "/mc/hazards", label: "Hazard Map" },
  { to: "/mc/triage", label: "Triage & Earth Link" },
  { to: "/mc/validation", label: "Validation" },
  { to: "/baseline", label: "Baseline" },
  { to: "/privacy", label: "Privacy" },
  { to: "/sources", label: "Data Sources" },
]

function ScrollablePills() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (!scrollRef.current) return
    setIsDragging(true)
    setStartX(e.pageX - scrollRef.current.offsetLeft)
    setScrollLeft(scrollRef.current.scrollLeft)
  }, [])

  const onMouseLeave = useCallback(() => setIsDragging(false), [])
  const onMouseUp = useCallback(() => setIsDragging(false), [])
  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || !scrollRef.current) return
      e.preventDefault()
      const x = e.pageX - scrollRef.current.offsetLeft
      const walk = (x - startX) * 2 // Scroll speed multiplier
      scrollRef.current.scrollLeft = scrollLeft - walk
    },
    [isDragging, startX, scrollLeft]
  )

  return (
    <div
      ref={scrollRef}
      className={`mt-4 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide ${isDragging ? "cursor-grabbing select-none" : "cursor-grab"}`}
      role="navigation"
      aria-label="Mission sections"
      onMouseDown={onMouseDown}
      onMouseLeave={onMouseLeave}
      onMouseUp={onMouseUp}
      onMouseMove={onMouseMove}
    >
      <button
        type="button"
        aria-label="Open mission sections menu"
        aria-expanded={menuOpen}
        aria-haspopup="dialog"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={() => setMenuOpen(true)}
        className="icon-btn size-12 shrink-0 text-cyan-400"
      >
        <SlidersHorizontal size={18} strokeWidth={2} />
      </button>
      {PILLS.map((p) => (
        <NavLink
          key={p.to}
          to={p.to}
          onClick={(e) => {
            if (isDragging) e.preventDefault()
          }}
          className={({ isActive }) =>
            `inline-flex min-h-9 shrink-0 items-center rounded-full px-4 text-[12px] font-medium transition-colors ${
              isActive
                ? "liquid-glass-dark text-white border border-cyan-400/40 shadow-[0_4px_16px_rgba(53,189,230,0.3)] font-semibold"
                : "liquid-glass-clear text-ink-2 hover:text-ink hover:border-cyan-400/30"
            }`
          }
        >
          {p.label}
        </NavLink>
      ))}
      <Sheet open={menuOpen} onClose={() => setMenuOpen(false)} title="Mission sections">
        <nav aria-label="Mission sections" className="flex flex-wrap gap-2">
          {PILLS.map((p) => (
            <NavLink
              key={p.to}
              to={p.to}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `inline-flex min-h-10 items-center rounded-full px-4 text-[12px] font-medium transition-colors ${
                  isActive
                    ? "liquid-glass-dark text-white border border-cyan-400/40 font-semibold"
                    : "liquid-glass-clear text-ink-2 hover:text-ink hover:border-cyan-400/30"
                }`
              }
            >
              {p.label}
            </NavLink>
          ))}
        </nav>
      </Sheet>
    </div>
  )
}

function PatientStrip() {
  const day = useApp((s) => s.day)
  const { data: ev } = useEvaluation(day)
  const top = ev?.alerts?.find((a) => a.level !== "normal")

  const liveHR = ev?.nowS?.hr ?? 58
  const liveSpo2 = ev?.nowS?.spo2 ?? 97.8
  const liveCO2 = ev?.env?.co2 ?? 3200
  const liveTemp = ev?.sm?.temp ?? 36.7

  const v = [
    ["Heart rate", String(Math.round(liveHR)), "bpm"],
    ["SpO2", liveSpo2.toFixed(1), "%"],
    ["Cabin CO2", String(Math.round(liveCO2)), "ppm"],
    ["Skin temp", liveTemp.toFixed(1), "°C"],
  ]

  return (
    <section
      aria-label="Astronaut summary"
      className="mb-6 grid items-center gap-4 sm:gap-5 lg:grid-cols-[320px_1fr]"
    >
      <div className="liquid-glass-clear glass-edge flex items-center gap-3 sm:gap-4 rounded-[28px] sm:rounded-[34px] p-3 sm:p-4 shadow-[inset_0_1px_0_rgba(255,255,255,.2)]">
        <span
          className="flex size-[64px] sm:size-[84px] shrink-0 items-center justify-center rounded-[20px] sm:rounded-[28px] liquid-glass-dark text-[20px] sm:text-[26px] font-light tracking-wide text-on-nav"
          aria-hidden
        >
          {astronaut.initials}
        </span>
        <div className="leading-tight min-w-0">
          <div className="text-[11px] sm:text-[12px] text-label truncate">
            {astronaut.crew} · {astronaut.role}
          </div>
          <div className="mt-1 text-[18px] sm:text-[22px] font-medium tracking-[-0.02em] truncate">
            {astronaut.name}
          </div>
          <div className="text-[11px] sm:text-[12px] text-label truncate">{astronaut.mission}</div>
        </div>
      </div>
      <div className="min-w-0">
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-end gap-x-4 sm:gap-x-10 gap-y-2 sm:gap-y-3">
          <div className="col-span-2 sm:col-span-1 min-w-[140px] sm:min-w-[180px]">
            <div className="text-[11px] text-label">Status</div>
            <div className="text-[20px] sm:text-[30px] font-light leading-tight tracking-[-0.03em]">
              {top ? top.title.replace(/\.$/, "") : levelLabel("normal")}
            </div>
          </div>
          {v.map(([l, n, u]) => (
            <div key={l}>
              <div className="text-[11px] text-label">{l}</div>
              <div className="text-[20px] sm:text-[30px] font-light leading-tight tabular-nums tracking-[-0.03em]">
                {n}
                <span className="ml-1 text-[12px] sm:text-[14px] text-label">{u}</span>
              </div>
            </div>
          ))}
        </div>
        <ScrollablePills />
      </div>
    </section>
  )
}

const MONTHS = ["Mar", "Apr", "May", "Jun", "Jul", "Aug"]
const monthOf = (d: number) => Math.min(5, Math.floor(d / 30.5))

function TimelineBar() {
  const day = useApp((s) => s.day)
  const setDay = useApp((s) => s.setDay)
  const cur = monthOf(day)

  const nodes = [
    {
      icon: ClipboardList,
      label: "checks",
      color: "text-cyan-400",
      count: (m: number) =>
        checks.filter((c) => monthOf(c.due) === m && c.type !== "sample").length,
    },
    {
      icon: Dumbbell,
      label: "exercise",
      color: "text-fuchsia-400",
      count: (m: number) =>
        sessions.filter((s, i) => monthOf(i) === m && s.machineStatus !== "ok").length,
    },
    {
      icon: FlaskConical,
      label: "samples",
      color: "text-emerald-400",
      count: (m: number) =>
        checks.filter((c) => monthOf(c.due) === m && c.type === "sample").length,
    },
  ]

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-2.5 z-30 flex justify-center px-2 sm:px-6">
      <nav
        aria-label="Mission timeline"
        className="pointer-events-auto flex items-center gap-1.5 sm:gap-2.5 rounded-full p-1.5 liquid-glass-primary glass-edge shadow-[0_16px_40px_-8px_rgba(16,18,21,0.18)] max-w-full overflow-x-auto scrollbar-none"
      >
        {/* Mission Sol capsule */}
        <div className="flex shrink-0 items-center gap-2 rounded-full liquid-glass-dark py-1 pl-1.5 pr-3 text-on-nav shadow-xs">
          <span className="flex size-7 sm:size-8 items-center justify-center rounded-full liquid-glass-clear text-ink">
            <CalendarCheck size={14} strokeWidth={2} className="text-cyan-400" />
          </span>
          <div className="leading-none flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_6px_#0077A8]" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-on-nav/80">
                SOL {day + 1}
              </span>
            </div>
            <span className="mt-0.5 text-[11px] font-medium tabular-nums text-white">
              Day {day + 1} <span className="text-white/40">/ {N}</span>
            </span>
          </div>
        </div>

        {/* Month selector track */}
        <div className="flex items-center gap-0.5 sm:gap-1 rounded-full p-0.5 bg-black/30 border border-cyan-400/20">
          {MONTHS.map((m, i) => {
            const on = i === cur
            const future = i > cur
            return (
              <button
                key={m}
                onClick={() => setDay(Math.round(i * 30.5))}
                aria-label={`Jump to ${m}`}
                aria-current={on ? "true" : undefined}
                className={`min-h-7 sm:min-h-8 rounded-full px-2 sm:px-3 text-[11px] sm:text-[12px] font-medium transition-all ${
                  on
                    ? "bg-cyan-500/25 text-white border border-cyan-400/40 shadow-[0_2px_12px_rgba(53,189,230,0.3)] font-semibold scale-[1.02]"
                    : future
                      ? "text-ink/35 hover:text-ink/60"
                      : "text-ink/75 hover:text-white hover:bg-white/10"
                }`}
              >
                {m}
              </button>
            )
          })}
        </div>

        {/* Telemetry counters for selected month */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 pl-1 border-l border-white/15">
          {nodes.map((n) => {
            const count = n.count(cur)
            return (
              <button
                key={n.label}
                onClick={() => setDay(Math.round(cur * 30.5 + 12))}
                title={`${count} ${n.label} in ${MONTHS[cur]}`}
                className="group relative flex items-center gap-1 min-h-7 sm:min-h-8 rounded-full px-2 sm:px-2.5 liquid-glass-clear text-ink-2 hover:text-ink transition-all hover:border-cyan-400/40 hover:bg-cyan-950/40"
              >
                <n.icon size={13} strokeWidth={2} className={`${n.color} shrink-0`} />
                <span className="text-[11px] font-semibold tabular-nums text-ink">
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

export function AppFrame({ children }: { children: ReactNode }) {
  const [root, setRoot] = useState<HTMLElement | null>(null)
  const { pathname } = useLocation()
  const nav = useNavigate()
  const active = tabFor(pathname)
  return (
    <div className="relative flex h-screen w-screen flex-col overflow-hidden bg-[#020C14]">
      {/* Dynamic 21st.dev Waves WebGL ShaderBackground replacing the white background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <ShaderBackground className="h-full w-full" />
      </div>
      <div
        ref={setRoot}
        className="relative z-10 flex h-[calc(100dvh)] flex-col overflow-hidden"
        style={{ transform: "translateZ(0)" }}
      >
        <SheetRootCtx.Provider value={root}>
          {/* Floating Upper Liquid Glass Navbar - floating dock mirroring TimelineBar */}
          <header className="pointer-events-none absolute inset-x-0 top-2.5 sm:top-3 z-40 flex justify-center px-2 sm:px-4">
            <div className="pointer-events-auto">
              <LiquidNavbar
                items={LIQUID_ITEMS}
                active={TABS.findIndex((t) => t.to === active)}
                onChange={(index) => nav(TABS[index]?.to ?? "/")}
                tone="dark"
                sound={false}
              />
            </div>
          </header>
          <div className="relative flex min-h-0 flex-1 flex-col">
            <main
              id="scroll"
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-28 pt-18 sm:pt-20 lg:px-10"
            >
              <PatientStrip />
              <OfflineBanner />
              {children}
            </main>
            <TimelineBar />
          </div>
        </SheetRootCtx.Provider>
      </div>
    </div>
  )
}


