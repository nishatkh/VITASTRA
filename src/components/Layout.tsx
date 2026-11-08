import type { ReactNode } from "react"
import { useNavigate } from "react-router"
import {
  ArrowLeft,
  LayoutGrid,
  Wifi,
  WifiOff,
  Clock3,
  CloudUpload,
} from "lucide-react"
import { IconBtn, Title, SourceChip, AdviceFooter, SectionHead } from "./ui"
import { useConnection, useAlerts } from "../api/hooks"
import { useApp } from "../store/useApp"
import { AlertBadge, ConfidenceBar } from "./Level"
import { WhyButton } from "./WhyDrawer"
import { Sheet } from "./Sheet"
const procedures: Record<string, { title: string; summary: string }> = {
  "MED-4.2": { title: "Vision Self-Check", summary: "Repeat the near-acuity card check in matched lighting. Record both eyes. Report if the index is below personal baseline on two consecutive checks." },
  "MED-2.7": { title: "Sample Collection, Saliva", summary: "Collect the scheduled saliva sample before the first meal. Label, stow at 4 C, log the time." },
  "ENV-1.3": { title: "CO2 Scrubber Verification", summary: "Confirm CDRA bed state, check vent airflow paths, and verify the portable CO2 monitor reading against the fixed sensor." },
  "ENV-1.5": { title: "Cabin Ventilation Check", summary: "Clear obstructed intake vents near the sleep station and workspace. Re-read CO2 after 15 minutes." },
  "EXR-3.1": { title: "Countermeasure Plan Reallocation", summary: "Shift the lost treadmill load onto ARED and CEVIS sessions, log the substitute minutes and intensity." },
  "RAD-5.2": { title: "Solar Particle Event Shelter", summary: "Move to the designated shelter, close hatches, log crew positions, and stay until the all-clear from the flight surgeon." },
  "BHP-1.1": { title: "Behavioral Health Check-in", summary: "Complete the private mood check-in. Schedule a private family conference or a call with the behavioral health contact." },
  "MED-1.1": { title: "Escalation to Flight Surgeon", summary: "Prepare an SBAR summary and send it on the next contact window. Request a voice conference if symptoms appear." },
  "CRW-2.4": { title: "Sleep Hygiene and Light Schedule", summary: "Hold fixed sleep timing for 5 nights, dim the workspace light 90 minutes before sleep, and log sleep quality." },
}
import type { Alert, Level, SourceKind } from "../data/types"
import { useState } from "react"

export function ConnectionPill({ dark }: { dark?: boolean }) {
  const { state, delay } = useConnection()
  const cfg = {
    online: { Icon: Wifi, text: "Online" },
    offline: { Icon: WifiOff, text: "Offline" },
    delayed: { Icon: Clock3, text: `Delayed ${delay} min` },
  }[state]
  const inv = state !== "online"
  return (
    <span
      role="status"
      aria-label={`Connection: ${cfg.text}`}
      className={`inline-flex min-h-9 items-center gap-2 rounded-full px-3.5 text-[13px] font-semibold ${
        inv
          ? "liquid-glass-dark text-white border border-white/20 shadow-xs"
          : dark
            ? "bg-inset text-on-nav border border-white/10"
            : "liquid-glass-clear text-ink-2 border border-cyan-400/30 shadow-xs"
      }`}
    >
      <cfg.Icon size={15} strokeWidth={1.8} className={inv ? "text-amber-400" : "text-emerald-400"} aria-hidden />
      {cfg.text}
    </span>
  )
}

export function OfflineBanner() {
  const { state, queue } = useConnection()
  if (state !== "offline") return null
  return (
    <div className="liquid-glass-dark flex items-center gap-3 rounded-[22px] p-4 shadow-xl border border-white/15">
      <CloudUpload size={22} strokeWidth={1.5} aria-hidden />
      <div className="text-[13px] leading-snug">
        <div className="font-semibold">
          Working offline. Last sync with Earth: 6h ago.
        </div>
        <div className="text-on-nav/70">
          {queue} item{queue === 1 ? "" : "s"} waiting to send. Monitoring keeps
          running.
        </div>
      </div>
    </div>
  )
}

export function Screen({ children }: { children: ReactNode; back?: boolean }) {
  return (
    <div
      className="grid items-start gap-4 pb-6"
      style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 340px), 1fr))" }}
    >
      {children}
    </div>
  )
}

export function ModuleShell({
  title,
  children,
  footer = true,
}: {
  title: [string, string]
  children: ReactNode
  footer?: boolean
}) {
  return (
    <Screen>
      <Title a={title[0]} b={title[1]} />
      {children}
      {footer && <AdviceFooter />}
    </Screen>
  )
}

export function StatusRow({
  alert,
  level,
  title,
  confidence,
  why,
  source = "synthetic",
  sources,
}: {
  alert?: Alert
  level: Level
  title: string
  confidence: number
  why: string[]
  source?: SourceKind
  sources?: { kind: SourceKind; label: string }[]
}) {
  const info = alert ?? {
    title,
    level,
    why,
    confidence,
    sources: sources ?? [
      { kind: source, label: source === "synthetic" ? "Synthetic" : "NASA" },
    ],
  }
  return (
    <div className="liquid-glass-primary glass-hover flex flex-col gap-4 p-5">
      <div className="flex items-center justify-between gap-2">
        <AlertBadge level={level} text={title} />
        <SourceChip
          kind={info.sources[0].kind}
          label={info.sources[0].kind === "synthetic" ? "Synthetic" : undefined}
        />
      </div>
      <ConfidenceBar value={confidence} />
      <WhyButton info={info} />
    </div>
  )
}

export function ProcChip({ code }: { code: string }) {
  const [o, setO] = useState(false)
  const p = procedures[code]
  return (
    <>
      <button
        onClick={() => setO(true)}
        className="mx-0.5 inline-flex min-h-7 items-center rounded-full liquid-glass-dark px-2.5 align-baseline text-[12px] font-semibold text-white border border-cyan-400/30 shadow-xs hover:border-cyan-400/60 transition-colors"
      >
        {code}
      </button>
      <Sheet
        open={o}
        onClose={() => setO(false)}
        title={`${code}: ${p?.title ?? "Procedure"}`}
      >
        <p className="text-[15px] leading-relaxed">
          {p?.summary ?? "Procedure text is available in the mission library."}
        </p>
        <p className="mt-4 text-[13px] text-label">
          Source: onboard procedure library (local copy).
        </p>
      </Sheet>
    </>
  )
}

export function Steps({ items }: { items: string[] }) {
  return (
    <ol className="flex flex-col gap-2.5">
      {items.map((t, i) => {
        const m = t.match(/^(.*?)\s*\(([A-Z]{3}-\d\.\d)\)$/)
        return (
          <li
            key={i}
            className="flex items-start gap-3 text-[15px] leading-snug"
          >
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full liquid-glass-dark text-[12px] font-semibold text-white border border-cyan-400/30 shadow-xs">
              {i + 1}
            </span>
            <span className="pt-0.5">
              {m ? m[1] : t}
              {m && <ProcChip code={m[2]} />}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

export function NextActions({ items }: { items: string[] }) {
  return (
    <div className="liquid-glass-primary p-5">
      <div className="label mb-3">Suggested next actions</div>
      <Steps items={items} />
    </div>
  )
}

export function useModuleAlert(id: string) {
  const { data: alerts } = useAlerts()
  return alerts?.find((a) => a.id === id)
}
export { SectionHead, useApp }

