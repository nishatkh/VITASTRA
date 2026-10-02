import { useState, useRef, useCallback, type ReactNode } from "react"
import { NavLink, useLocation, useNavigate } from "react-router"
import {
  X,
  Orbit,
  House,
  HeartPulse,
  CalendarCheck,
  Wind,
  MessageCircle,
  LayoutGrid,
  SlidersHorizontal,
  ClipboardList,
  Dumbbell,
  FlaskConical,
  GripHorizontal,
} from "lucide-react"
import { SheetRootCtx } from "./Sheet"
import { ConnectionPill, OfflineBanner } from "./Layout"
import { useEvaluation } from "../api/hooks"
import { useApp } from "../store/useApp"
import { levelLabel } from "./Level"

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
  { to: "/", label: "Home", icon: House },
  { to: "/body", label: "Body", icon: HeartPulse },
  { to: "/checks", label: "Checks", icon: CalendarCheck },
  { to: "/env", label: "Environment", icon: Wind },
  { to: "/coach", label: "Coach", icon: MessageCircle },
  { to: "/more", label: "More", icon: LayoutGrid },
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
const TITLES: Record<string, string> = {
  "/": "Overview",
  "/body": "Body",
  "/checks": "Checks",
  "/env": "Environment",
  "/coach": "Coach",
  "/more": "Mission",
}

const PILLS = [
  { to: "/alerts", label: "Alerts" },
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
      <span className="icon-btn size-12 shrink-0 pointer-events-none" aria-hidden>
        <SlidersHorizontal size={18} strokeWidth={1.4} />
      </span>
      {PILLS.map((p) => (
        <NavLink
          key={p.to}
          to={p.to}
          onClick={(e) => {
            if (isDragging) e.preventDefault()
          }}
          className={({ isActive }) =>
            `inline-flex min-h-11 shrink-0 items-center rounded-full px-5 text-[13.5px] font-medium transition-colors ${
              isActive
                ? "bg-accent text-canvas shadow-[0_6px_14px_rgba(30,58,95,.3)]"
                : "bg-border text-ink/80 hover:bg-border-strong"
            }`
          }
        >
          {p.label}
        </NavLink>
      ))}
    </div>
  )
}

function PatientStrip() {
  const day = useApp((s) => s.day)
  const { data: ev } = useEvaluation(day)
  const top = ev?.alerts?.find((a) => a.level !== "normal")
  const v = [
    ["Heart rate", String(Math.round(ev?.nowS?.hr ?? 0)), "bpm"],
    ["SpO2", ev?.nowS?.spo2?.toFixed(0) ?? "0", "%"],
    ["Cabin CO2", String(Math.round(ev?.env?.co2 ?? 0)), "ppm"],
    ["Skin temp", ev?.sm?.temp?.toFixed(1) ?? "0", "°C"],
  ]
  return (
    <section
      aria-label="Astronaut summary"
      className="mb-6 grid items-center gap-4 sm:gap-5 lg:grid-cols-[320px_1fr]"
    >
      <div className="flex items-center gap-3 sm:gap-4 rounded-[28px] sm:rounded-[34px] bg-raised p-3 sm:p-4 shadow-[inset_0_1px_0_rgba(255,255,255,.7)]">
        <span
          className="flex size-[64px] sm:size-[84px] shrink-0 items-center justify-center rounded-[20px] sm:rounded-[28px] bg-nav text-[20px] sm:text-[26px] font-light tracking-wide text-on-nav"
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
        <div className="flex flex-wrap items-end gap-x-6 sm:gap-x-10 gap-y-2 sm:gap-y-3">
          <div className="min-w-[140px] sm:min-w-[200px]">
            <div className="text-[11px] text-label">Status</div>
            <div className="text-[22px] sm:text-[30px] font-light leading-tight tracking-[-0.03em]">
              {top ? top.title.replace(/\.$/, "") : levelLabel("normal")}
            </div>
          </div>
          {v.map(([l, n, u]) => (
            <div key={l}>
              <div className="text-[11px] text-label">{l}</div>
              <div className="text-[22px] sm:text-[30px] font-light leading-tight tabular-nums tracking-[-0.03em]">
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
      count: (m: number) =>
        checks.filter((c) => monthOf(c.due) === m && c.type !== "sample")
          .length,
    },
    {
      icon: Dumbbell,
      label: "exercise sessions with degraded machines",
      count: (m: number) =>
        sessions.filter((s, i) => monthOf(i) === m && s.machineStatus !== "ok")
          .length,
    },
    {
      icon: FlaskConical,
      label: "samples",
      count: (m: number) =>
        checks.filter((c) => monthOf(c.due) === m && c.type === "sample")
          .length,
    },
  ]
  return (
    <nav
      aria-label="Mission timeline"
      className="absolute inset-x-3 bottom-3 z-30 flex items-center gap-1 overflow-x-auto rounded-full bg-raised/95 p-1.5 shadow-[0_14px_34px_rgba(0,0,0,.22)] backdrop-blur lg:inset-x-6"
    >
      <div className="flex shrink-0 items-center gap-3 rounded-full bg-nav py-1.5 pl-1.5 pr-5 text-on-nav">
        <span className="flex size-11 items-center justify-center rounded-full bg-inset text-ink">
          <CalendarCheck size={19} strokeWidth={1.3} />
        </span>
        <span className="leading-tight">
          <span className="block text-[11px] text-on-nav/60">Mission day</span>
          <span className="text-[15px] font-medium tabular-nums">
            {day + 1} / {N}
          </span>
        </span>
      </div>
      {MONTHS.map((m, i) => {
        const on = i === cur,
          future = i > cur
        return (
          <div
            key={m}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 ${
              on ? "bg-accent text-canvas" : future ? "text-ink/40" : ""
            }`}
          >
            <button
              onClick={() => setDay(Math.round(i * 30.5))}
              aria-label={`Jump to ${m}`}
              aria-current={on ? "true" : undefined}
              className={`min-h-11 px-2 text-[12.5px] font-medium ${
                on ? "text-canvas" : "text-ink/70"
              }`}
            >
              {m}
            </button>
            {nodes.map((n) => {
              const c = n.count(i)
              return (
                <button
                  key={n.label}
                  onClick={() => setDay(Math.round(i * 30.5 + 12))}
                  aria-label={`${c} ${n.label} in ${m}`}
                  className={`relative flex size-10 items-center justify-center rounded-full transition-colors ${
                    on ? "bg-raised/20 text-ink" : "bg-border text-ink/80 hover:bg-border-strong"
                  }`}
                >
                  <n.icon size={16} strokeWidth={1.3} aria-hidden />
                  {c > 0 && (
                    <span className="absolute -right-0.5 -top-1 flex size-[18px] items-center justify-center rounded-full bg-signal text-[10px] font-medium text-canvas">
                      {c}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        )
      })}
    </nav>
  )
}

export function AppFrame({ children }: { children: ReactNode }) {
  const [root, setRoot] = useState<HTMLElement | null>(null)
  const { pathname } = useLocation()
  const nav = useNavigate()
  const active = tabFor(pathname)
  const home = pathname === "/"
  return (
    <div className="min-h-dvh p-1.5 sm:p-3 lg:p-9">
      <div
        ref={setRoot}
        className="relative mx-auto flex h-[calc(100dvh-0.75rem)] sm:h-[calc(100dvh-1.5rem)] max-w-[1640px] flex-col overflow-hidden rounded-[24px] sm:rounded-[40px] bg-nav p-1.5 sm:p-2.5 shadow-[0_50px_100px_rgba(0,0,0,.35)] lg:h-[calc(100dvh-4.5rem)] lg:rounded-[56px]"
        style={{ transform: "translateZ(0)" }}
      >
        <SheetRootCtx.Provider value={root}>
          <header className="shrink-0">
            {/* Mobile header (hidden on lg+) */}
            <div className="flex items-center gap-2 rounded-t-[22px] bg-surface px-2 pt-2 pb-2 lg:hidden">
              <button
                onClick={() => (home ? undefined : nav("/"))}
                aria-label={home ? "VITASTRA" : "Back to Overview"}
                className="flex shrink-0 size-[44px] items-center justify-center rounded-full border-2 border-nav bg-raised shadow-[0_6px_14px_rgba(0,0,0,.15)]"
              >
                {home ? (
                  <Orbit size={20} strokeWidth={1.3} />
                ) : (
                  <X size={18} strokeWidth={1.4} />
                )}
              </button>
              <h2 className="min-w-0 flex-1 truncate text-[26px] font-light tracking-[-0.04em]">
                {TITLES[active]}
              </h2>
              <nav
                aria-label="Primary"
                className="flex shrink-0 items-center gap-1.5 overflow-x-auto scrollbar-hide"
              >
                {TABS.map((t) => (
                  <NavLink
                    key={t.to}
                    to={t.to}
                    aria-current={t.to === active ? "page" : undefined}
                    className={`inline-flex size-[40px] shrink-0 items-center justify-center rounded-full text-[12px] font-medium transition-all ${
                      t.to === active
                        ? "bg-accent text-canvas shadow-[0_8px_18px_rgba(30,58,95,.35)]"
                        : "bg-border text-ink/80"
                    }`}
                  >
                    <t.icon size={17} strokeWidth={1.3} aria-hidden />
                  </NavLink>
                ))}
              </nav>
            </div>

            {/* Desktop header (hidden below lg) */}
            <div className="hidden lg:flex lg:h-[76px] lg:items-start lg:justify-between">
              <div className="flex items-start">
                <div className="relative flex h-[76px] items-center rounded-tl-[44px] bg-surface pl-[88px] pr-4">
                  <button
                    onClick={() => (home ? undefined : nav("/"))}
                    aria-label={home ? "VITASTRA" : "Back to Overview"}
                    className="absolute left-2 top-3 flex size-[54px] items-center justify-center rounded-full border-2 border-nav bg-raised shadow-[0_6px_14px_rgba(0,0,0,.15)]"
                  >
                    {home ? (
                      <Orbit size={20} strokeWidth={1.3} />
                    ) : (
                      <X size={18} strokeWidth={1.4} />
                    )}
                  </button>
                  <h2 className="text-[40px] font-light tracking-[-0.04em]">
                    {TITLES[active]}
                  </h2>
                </div>
                <svg width="46" height="76" viewBox="0 0 46 76" aria-hidden className="-ml-px shrink-0">
                  <path d="M0 0 C30 0 16 76 46 76 L0 76 Z" fill="var(--surface)" />
                </svg>
              </div>
              <div className="flex min-w-0 items-center gap-3 pr-5 pt-4">
                <nav
                  aria-label="Primary"
                  className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1"
                >
                  {TABS.map((t) => (
                    <NavLink
                      key={t.to}
                      to={t.to}
                      aria-current={t.to === active ? "page" : undefined}
                      className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full px-4 text-[13.5px] font-medium transition-all ${
                        t.to === active
                          ? "bg-accent text-canvas shadow-[0_8px_18px_rgba(30,58,95,.35)]"
                          : "bg-border text-ink/80 hover:bg-border-strong"
                      }`}
                    >
                      <t.icon size={16} strokeWidth={1.3} aria-hidden />
                      <span>{t.label}</span>
                    </NavLink>
                  ))}
                </nav>
                <span className="hidden shrink-0 xl:block">
                  <ConnectionPill />
                </span>
              </div>
            </div>
          </header>
          <div className="relative flex min-h-0 flex-1 flex-col rounded-b-[44px] bg-surface lg:rounded-tr-[44px]">
            <main
              id="scroll"
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-28 pt-6 lg:px-10"
            >
              <PatientStrip />
              <OfflineBanner />
              {children}
            </main>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-28 rounded-b-[28px] sm:rounded-b-[44px] bg-gradient-to-t from-surface via-surface/80 to-transparent" />
            <TimelineBar />
          </div>
        </SheetRootCtx.Provider>
      </div>
    </div>
  )
}
