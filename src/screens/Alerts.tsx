import { Link } from "react-router"
import { Bell } from "lucide-react"
import { Screen } from "../components/Layout"
import { Card, Title } from "../components/ui"
import { AlertCard } from "../components/WhyDrawer"
import { AlertCounter } from "../components/AlertCounter"
import { LevelDot, levelLabel } from "../components/Level"
import { useAlerts } from "../api/hooks"
import { EmptyState } from "../components/EmptyState"

const LEVEL_DETAILS: Record<string, { desc: string; shape: string; protocol: string }> = {
  normal: {
    shape: "Solid Circle",
    desc: "Within your personal baseline",
    protocol: "Nominal monitoring. Automatic overnight check.",
  },
  observe: {
    shape: "Rotated Diamond",
    desc: "Worth a look, no immediate action needed",
    protocol: "Track 24-hr trend. Compare with Body Twin.",
  },
  warning: {
    shape: "Equilateral Triangle",
    desc: "Act on the suggested mitigation steps",
    protocol: "Follow MED-4.2 procedure & log symptoms.",
  },
  critical: {
    shape: "Octagon Shield",
    desc: "Act immediately — safety threshold crossed",
    protocol: "Execute emergency checklist & notify Flight Surgeon.",
  },
}

export default function Alerts() {
  const { data: alertsData, isLoading } = useAlerts()
  const alerts = alertsData ?? []

  if (isLoading) {
    return (
      <Screen>
        <Title a="Alerts" b="& Signals" />
        <div className="animate-pulse space-y-4">
          <div className="h-16 bg-border rounded" />
          <div className="h-16 bg-border rounded" />
        </div>
      </Screen>
    )
  }

  return (
    <Screen>
      <Title a="Alerts" b="& Signals" />
      <AlertCounter />

      {alerts.length === 0 ? (
        <EmptyState
          icon={<Bell size={36} strokeWidth={1.4} />}
          title="No active alerts"
          description="All telemetry signals match your personal baseline. When a pattern emerges, it will appear here grouped with contributing signals and suggested actions."
        />
      ) : (
        alerts.map((a) => <AlertCard key={a.id} alert={a} expandable />)
      )}

      {/* ── Shape-Based Severity System Card ── */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <span className="label font-semibold text-ink">Levels are shapes, not colors</span>
          <span className="text-[11px] font-medium text-label uppercase tracking-wider">NASA STD-3001</span>
        </div>

        <p className="mt-1.5 text-[12.5px] leading-snug text-label">
          In spaceflight environments, alert levels rely on distinct geometric shapes rather than color alone:
        </p>

        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {(["normal", "observe", "warning", "critical"] as const).map((l) => {
            const item = LEVEL_DETAILS[l]
            return (
              <div key={l} className="flex items-start gap-2.5 rounded-xl bg-raised p-2.5 shadow-xs">
                <div className="mt-0.5 shrink-0">
                  <LevelDot level={l} size={15} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-[13.5px]">{levelLabel(l)}</span>
                    <span className="text-[10.5px] font-medium text-ink-3">({item.shape})</span>
                  </div>
                  <div className="mt-0.5 text-[12.5px] font-medium text-ink">{item.desc}</div>
                  <div className="mt-0.5 text-[11.5px] text-label">{item.protocol}</div>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      <div className="flex flex-wrap gap-2 pt-1">
        <Link to="/contested" className="btn btn-soft">
          Contested patterns (never alarm)
        </Link>
        <Link to="/triage" className="btn btn-soft">
          Triage Matrix
        </Link>
      </div>
    </Screen>
  )
}