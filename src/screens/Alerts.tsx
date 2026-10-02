import { Link } from "react-router"
import { Bell } from "lucide-react"
import { Screen } from "../components/Layout"
import { Card, Title } from "../components/ui"
import { AlertCard } from "../components/WhyDrawer"
import { AlertCounter } from "../components/AlertCounter"
import { LevelDot, levelLabel } from "../components/Level"
import { useAlerts } from "../api/hooks"
import { EmptyState } from "../components/EmptyState"

const MEAN: Record<string, string> = {
  normal: "Within your baseline",
  observe: "Worth a look, no action needed",
  warning: "Act on the suggested steps",
  critical: "Act now",
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
          title="No alerts"
          description="All signals are within your personal baseline. When a pattern emerges, it will appear here grouped with its contributing signals and suggested actions."
        />
      ) : (
        alerts.map((a) => <AlertCard key={a.id} alert={a} expandable />)
      )}
      <Card className="p-5">
        <div className="label mb-3">Levels are shapes, not colors</div>
        <ul className="flex flex-col gap-3">
          {["normal", "observe", "warning", "critical"].map((l) => (
            <li key={l} className="flex items-center gap-3">
              <LevelDot level={l as any} size={16} />
              <span className="font-semibold">{levelLabel(l as any)}</span>
              <span className="text-[13.5px] text-label">{MEAN[l]}</span>
            </li>
          ))}
        </ul>
      </Card>
      <Link to="/contested" className="btn btn-soft self-start">
        Contested patterns (never alarm)
      </Link>
    </Screen>
  )
}