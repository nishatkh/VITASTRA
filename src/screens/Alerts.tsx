import { useState } from "react"
import { Link } from "react-router"
import {
  Bell,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  AlertTriangle,
  ChevronDown,
  Layers,
  ChevronRight,
} from "lucide-react"
import { Screen } from "../components/Layout"
import { Card, Title, SourceChip } from "../components/ui"
import { AlertCounter } from "../components/AlertCounter"
import { LevelDot, levelLabel, AlertBadge } from "../components/Level"
import { DonutGraph, StackBar, CHART_COLORS } from "../components/Analytics"
import { useAlerts } from "../api/hooks"
import type { Alert, Level } from "../data/types"

export type AlertLifecycleState = "New" | "Acknowledged" | "Resolved" | "Dismissed"

export interface ManagedAlert extends Alert {
  lifecycleState: AlertLifecycleState
  acknowledgedAt?: string
  resolvedAt?: string
  resolutionNotes?: string
}

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
  const { data: alertsData } = useAlerts()
  const rawAlerts = alertsData ?? []

  const [managedAlerts, setManagedAlerts] = useState<ManagedAlert[]>(() => {
    return rawAlerts.map((a, i) => ({
      ...a,
      lifecycleState: i === 0 ? "New" : "Acknowledged",
    }))
  })

  const [activeTab, setActiveTab] = useState<"All" | "New" | "Acknowledged" | "Resolved">("All")
  const [expandedAlertId, setExpandedAlertId] = useState<string | null>(rawAlerts[0]?.id || null)

  const handleStateChange = (id: string, newState: AlertLifecycleState) => {
    setManagedAlerts((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a
        return {
          ...a,
          lifecycleState: newState,
          acknowledgedAt: newState === "Acknowledged" ? new Date().toISOString() : a.acknowledgedAt,
          resolvedAt: newState === "Resolved" ? new Date().toISOString() : a.resolvedAt,
        }
      })
    )
  }

  const displayedAlerts = managedAlerts.filter((a) => {
    if (activeTab === "All") return true
    return a.lifecycleState === activeTab
  })

  // ── Alert lifecycle analytics ──
  const levelSegments = (["normal", "observe", "warning", "critical"] as const).map((l) => ({
    value: managedAlerts.filter((a) => a.level === l).length,
    color: l === "normal" ? CHART_COLORS.label : l === "observe" ? CHART_COLORS.signal : l === "warning" ? CHART_COLORS.warning : CHART_COLORS.red,
  }))
  const lifecycleParts = (["New", "Acknowledged", "Resolved"] as const).map((s) => ({
    value: managedAlerts.filter((a) => a.lifecycleState === s).length,
    color: s === "New" ? CHART_COLORS.amber : s === "Acknowledged" ? CHART_COLORS.label : CHART_COLORS.teal,
    label: s,
  }))
  const lifecycleTotal = managedAlerts.length || 1
  const oldestWait = Math.max(0, ...managedAlerts.map((a) => a.canWaitMinutes))

  return (
    <Screen>
      <div className="col-span-full">
        <Title a="Intelligent Alert" b="Management & Lifecycle" />
      </div>

      <div className="col-span-full">
        <AlertCounter />
      </div>

      {/* Filter and Lifecycle Tabs */}
      <Card className="col-span-full p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[12.5px] font-semibold text-label">Filter Lifecycle State:</span>
          {(["All", "New", "Acknowledged", "Resolved"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-4 py-1.5 text-[12.5px] font-medium transition-colors ${
                activeTab === tab
                  ? "liquid-glass-dark text-white shadow-xs"
                  : "liquid-glass-clear text-label hover:text-ink"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="text-[12px] text-label">
          {managedAlerts.filter((a) => a.lifecycleState === "New").length} unacknowledged alerts
        </div>
      </Card>

      {/* Alert Intelligence Analytics */}
      <Card className="col-span-full p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="label font-semibold text-ink">Alert Intelligence Analytics</span>
          <SourceChip kind="synthetic" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] items-center gap-5">
          <div className="flex items-center gap-4">
            <DonutGraph
              segments={levelSegments}
              centerValue={`${managedAlerts.length}`}
              centerLabel="Open alerts"
              ariaLabel={`Alert severity distribution: ${levelSegments
                .map((s, i) => `${["normal", "observe", "warning", "critical"][i]} ${s.value}`)
                .join(", ")}`}
            />
            <ul className="flex flex-col gap-1 text-[11.5px] text-label">
              {(["normal", "observe", "warning", "critical"] as const).map((l, i) => (
                <li key={l} className="flex items-center gap-1.5">
                  <i className="h-2.5 w-3.5 rounded-sm" style={{ background: levelSegments[i].color }} />
                  {levelLabel(l)} · <span className="text-ink font-semibold">{levelSegments[i].value}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2.5">
            <StackBar
              parts={lifecycleParts}
              ariaLabel={`Alert lifecycle breakdown: ${lifecycleParts.map((p) => `${p.label} ${p.value}`).join(", ")}`}
            />
            <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[11.5px] text-label">
              {lifecycleParts.map((p) => (
                <li key={p.label} className="flex items-center gap-1.5">
                  <i className="h-2.5 w-3.5 rounded-sm" style={{ background: p.color }} />
                  {p.label} · <span className="text-ink font-semibold">{p.value}</span>
                  <span className="text-label/70">({Math.round((p.value / lifecycleTotal) * 100)}%)</span>
                </li>
              ))}
            </ul>
            <div className="text-[12.5px] text-label leading-snug">
              Longest-dwell signal can wait <strong className="text-ink">{oldestWait} min</strong> before escalation.
              Grouping has collapsed {managedAlerts.length} raw signals into confirmed notifications.
            </div>
          </div>
        </div>
      </Card>

      {/* Alerts Feed */}
      <div className="col-span-full space-y-4">
        {displayedAlerts.map((a) => {
          const isExpanded = expandedAlertId === a.id
          return (
            <div
              key={a.id}
              className={`rounded-[28px] border liquid-glass-clear p-5 shadow-xs transition-all ${
                a.lifecycleState === "New"
                  ? "border-accent/40 shadow-sm"
                  : a.lifecycleState === "Resolved"
                  ? "border-signal/30 opacity-80"
                  : "border-border"
              }`}
            >
              {/* Alert Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
                <div className="flex items-center gap-2.5">
                  <LevelDot level={a.level} size={15} />
                  <AlertBadge level={a.level} />
                  <span className="font-mono text-[12px] text-label">{a.module}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                    a.lifecycleState === "New"
                      ? "bg-accent/15 text-accent"
                      : a.lifecycleState === "Acknowledged"
                      ? "bg-warning/15 text-warning"
                      : "bg-signal/15 text-signal"
                  }`}>
                    {a.lifecycleState}
                  </span>
                  <span className="text-[11.5px] text-label">Confidence: {Math.round(a.confidence * 100)}%</span>
                </div>
              </div>

              {/* Alert Content */}
              <div className="mt-3 space-y-2">
                <h3 className="text-[18px] font-semibold text-ink leading-snug">{a.title}</h3>

                {/* Contributing grouped signals */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] uppercase font-mono font-semibold text-label">
                    Grouped Signals:
                  </span>
                  {a.grouped.map((g) => (
                    <span key={g} className="rounded-full liquid-glass-clear px-2.5 py-0.5 text-[11.5px] font-medium text-ink">
                      {g}
                    </span>
                  ))}
                </div>

                {/* Evidence List */}
                <div className="rounded-2xl liquid-glass-clear p-4 text-[13px] text-label space-y-1.5 mt-2">
                  <div className="font-semibold text-ink text-[12.5px] flex items-center gap-1.5">
                    <Layers className="size-3.5 text-accent" /> Why are you seeing this alert?
                  </div>
                  <ul className="list-disc pl-4 space-y-1">
                    {a.why.map((w, idx) => (
                      <li key={idx} className="leading-snug">{w}</li>
                    ))}
                  </ul>
                </div>

                {/* Connected Risk Chain */}
                {a.chain && a.chain.length > 0 && (
                  <div className="rounded-2xl border border-border p-3.5 text-[12.5px] text-label space-y-1">
                    <span className="font-semibold text-ink">Coupled Risk Chain:</span>
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {a.chain.flat().map((node, i) => (
                        <span key={i} className="flex items-center gap-1">
                          <span className="rounded-md liquid-glass-clear px-2 py-0.5 font-medium text-ink">{node}</span>
                          {i < a.chain.flat().length - 1 && <ChevronRight className="size-3 text-label" />}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggested Actions */}
                <div className="space-y-1 pt-1">
                  <span className="text-[11.5px] uppercase font-mono font-semibold text-label">
                    Suggested Operational Mitigation:
                  </span>
                  <ul className="space-y-1 text-[13.5px] text-label list-disc pl-4 font-medium text-ink/90">
                    {a.actions.map((act, i) => (
                      <li key={i}>{act}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Lifecycle Actions Bar */}
              <div className="mt-4 pt-3 border-t border-border flex flex-wrap items-center justify-between gap-2">
                <div className="text-[12px] text-label">
                  Triage Lane: Can wait {a.canWaitMinutes} min
                </div>

                <div className="flex gap-2">
                  {a.lifecycleState === "New" && (
                    <button
                      onClick={() => handleStateChange(a.id, "Acknowledged")}
                      className="rounded-full liquid-glass-clear px-4 py-1.5 text-[12.5px] font-medium text-ink hover:bg-border transition-colors"
                    >
                      Acknowledge Alert
                    </button>
                  )}
                  {a.lifecycleState !== "Resolved" && (
                    <button
                      onClick={() => handleStateChange(a.id, "Resolved")}
                      className="rounded-full liquid-glass-dark px-4 py-1.5 text-[12.5px] font-medium text-white hover:bg-border-strong transition-colors"
                    >
                      Mark Resolved
                    </button>
                  )}
                  {a.lifecycleState === "Resolved" && (
                    <span className="inline-flex items-center gap-1 text-[12.5px] font-medium text-signal">
                      <CheckCircle2 className="size-4" /> Issue Closed
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* NASA STD-3001 Geometric Shape Reference */}
      <Card className="col-span-full p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="label font-semibold text-ink">NASA STD-3001 Geometric Shape Triage</span>
          <span className="text-[11px] font-medium text-label uppercase tracking-wider">Operational Standard</span>
        </div>
        <p className="text-[12.5px] leading-snug text-label">
          In spaceflight operations, alert severity relies on distinct tactile and geometric shapes (Circle, Diamond, Triangle, Octagon) to prevent color-deficiency confusion during high-stress cockpit situations.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
          {(["normal", "observe", "warning", "critical"] as const).map((l) => {
            const item = LEVEL_DETAILS[l]
            return (
              <div key={l} className="rounded-xl liquid-glass-clear p-3 space-y-1">
                <div className="flex items-center gap-2">
                  <LevelDot level={l} size={14} />
                  <span className="font-semibold text-[13px] text-ink">{levelLabel(l)}</span>
                </div>
                <div className="text-[11.5px] font-medium text-label">{item.shape}</div>
                <div className="text-[11.5px] text-label leading-tight">{item.desc}</div>
              </div>
            )
          })}
        </div>
      </Card>
    </Screen>
  )
}



