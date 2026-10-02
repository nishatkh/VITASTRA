import { Link } from "react-router"
import {
  Network,
  Radiation,
  Dumbbell,
  Smile,
  ClipboardList,
  Radio,
  FlaskConical,
  ShieldCheck,
  Settings,
  Database,
  GitCompare,
  Activity,
  Sparkles,
  Waves,
  type LucideIcon,
} from "lucide-react"
import { Screen } from "../components/Layout"
import { Title } from "../components/ui"

const items: { to: string; label: string; icon: LucideIcon; sub: string }[] = [
  {
    to: "/mc/hazards",
    label: "Hazard Map",
    icon: Network,
    sub: "Hazards to outcomes",
  },
  {
    to: "/radiation",
    label: "Radiation",
    icon: Radiation,
    sub: "Dose and shelter",
  },
  {
    to: "/bone",
    label: "Exercise",
    icon: Dumbbell,
    sub: "Planned vs delivered",
  },
  { to: "/mood", label: "Mood", icon: Smile, sub: "Private check-in" },
  {
    to: "/timeline",
    label: "Timeline & Reports",
    icon: ClipboardList,
    sub: "Filter and export",
  },
  {
    to: "/mc/triage",
    label: "Triage & Earth Link",
    icon: Radio,
    sub: "Delay-aware hand-off",
  },
  {
    to: "/mc/validation",
    label: "Validation",
    icon: FlaskConical,
    sub: "100 synthetic crews",
  },
  {
    to: "/privacy",
    label: "Privacy",
    icon: ShieldCheck,
    sub: "Tiers and audit log",
  },
  {
    to: "/settings",
    label: "Settings",
    icon: Settings,
    sub: "Storage and offline",
  },
  {
    to: "/sources",
    label: "Data Sources",
    icon: Database,
    sub: "Real vs synthetic",
  },
  {
    to: "/baseline",
    label: "Personal Baseline",
    icon: Activity,
    sub: "Adapting timeline",
  },
  {
    to: "/checks",
    label: "Silent Signals",
    icon: Sparkles,
    sub: "Checks and drift",
  },
  { to: "/twin", label: "Body Twin", icon: Waves, sub: "Expected vs actual" },
  {
    to: "/contested",
    label: "Contested Pattern",
    icon: GitCompare,
    sub: "Context, no alarms",
  },
]

export default function More() {
  return (
    <Screen>
      <div className="col-span-full">
        <Title a="Everything" b="Else" />
      </div>
      <div className="col-span-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {items.map((it) => (
          <Link
            key={it.to}
            to={it.to}
            className="card flex min-h-[120px] sm:min-h-[132px] flex-col justify-between p-4 active:scale-[.98]"
          >
            <span className="icon-btn size-10 sm:size-11 mb-3 sm:mb-0">
              <it.icon size={18} strokeWidth={1.5} aria-hidden />
            </span>
            <span>
              <span className="block text-[15px] sm:text-[15.5px] font-semibold leading-tight tracking-[-0.01em]">
                {it.label}
              </span>
              <span className="text-[12px] sm:text-[12.5px] text-label">{it.sub}</span>
            </span>
          </Link>
        ))}
      </div>
    </Screen>
  )
}