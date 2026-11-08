import { useState, useMemo } from "react"
import {
  Network,
  ShieldAlert,
  Activity,
  Layers,
  ChevronRight,
  ExternalLink,
  Info,
  Sliders,
  CheckCircle2,
} from "lucide-react"
import { Card, Title, SourceChip } from "../../components/ui"
import hazardsData from "../../data/processed/hazards_map_data.json"

export interface Hazard {
  id: string
  name: string
  nasaCode: string
  description: string
  operationalImpact: string
}

export interface Outcome {
  id: string
  name: string
  domain: string
  description: string
}

export interface Connection {
  id: string
  from: string
  to: string
  hazard: string
  outcome: string
  healthImpact: string
  measurements: string[]
  scientificEvidence: string
  evidenceStrength: string
  source: string
  sourceUrl: string
  suggestedAction: string
}

export default function Hazards() {
  const [selectedHazard, setSelectedHazard] = useState<string | null>(null)
  const [selectedOutcome, setSelectedOutcome] = useState<string | null>(null)
  const [activeConnectionId, setActiveConnectionId] = useState<string | null>("C-H4-O4")
  const [strengthFilter, setStrengthFilter] = useState<string>("All")

  const { hazards, outcomes, connections } = hazardsData as {
    hazards: Hazard[]
    outcomes: Outcome[]
    connections: Connection[]
  }

  // Filter connections based on active selections
  const filteredConnections = useMemo(() => {
    return connections.filter((c) => {
      if (selectedHazard && c.from !== selectedHazard) return false
      if (selectedOutcome && c.to !== selectedOutcome) return false
      if (strengthFilter !== "All" && c.evidenceStrength !== strengthFilter) return false
      return true
    })
  }, [connections, selectedHazard, selectedOutcome, strengthFilter])

  const activeConnection = useMemo(() => {
    if (activeConnectionId) {
      const match = connections.find((c) => c.id === activeConnectionId)
      if (match) return match
    }
    return filteredConnections[0] || connections[0]
  }, [activeConnectionId, filteredConnections, connections])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Title a="NASA Five Hazards" b="to Health Outcomes Map" />
        <p className="max-w-3xl text-[14.5px] sm:text-[15.5px] leading-relaxed text-label">
          Interactive systems-biology mapping connecting NASA's <strong>Five Spaceflight Hazards</strong> (Radiation, Isolation, Distance, Altered Gravity, Hostile Environments) to verified human health outcomes. Click any hazard or outcome below to inspect evidence, physiological measurements, and operational monitoring actions.
        </p>
      </div>

      {/* Filter and reset bar */}
      <Card className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[12.5px] font-semibold text-label">Filter Evidence Strength:</span>
          {["All", "Established evidence", "Emerging research", "Experimental evidence"].map((st) => (
            <button
              key={st}
              onClick={() => setStrengthFilter(st)}
              className={`rounded-full px-3 py-1 text-[12px] font-medium transition-colors ${strengthFilter === st
                  ? "liquid-glass-dark text-white"
                  : "liquid-glass-clear text-label hover:text-ink"
                }`}
            >
              {st}
            </button>
          ))}
        </div>

        {(selectedHazard || selectedOutcome || strengthFilter !== "All") && (
          <button
            onClick={() => {
              setSelectedHazard(null)
              setSelectedOutcome(null)
              setStrengthFilter("All")
            }}
            className="text-[12.5px] font-medium text-accent hover:underline"
          >
            Clear Selections
          </button>
        )}
      </Card>

      {/* Interactive Flow Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Five Hazards */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <span className="label font-bold text-ink">1. Spaceflight Hazards</span>
            <span className="text-[11px] text-label">NASA HRP Architecture</span>
          </div>

          {hazards.map((h) => {
            const isSelected = selectedHazard === h.id
            const activeConnCount = connections.filter((c) => c.from === h.id).length
            return (
              <button
                key={h.id}
                onClick={() => {
                  setSelectedHazard(isSelected ? null : h.id)
                  setSelectedOutcome(null)
                }}
                className={`flex flex-col text-left rounded-[22px] p-4 transition-all duration-200 border ${isSelected
                    ? "liquid-glass-dark text-white border-cyan-400/30 shadow-md"
                    : "liquid-glass-clear text-ink border-border hover:border-border-strong hover:liquid-glass-clear/60"
                  }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-mono font-semibold tracking-wider ${isSelected ? "text-white/70" : "text-label"
                    }`}>
                    {h.nasaCode} · HAZARD {h.id}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-[10.5px] font-medium ${isSelected ? "bg-white/10 text-white" : "liquid-glass-clear text-label"
                    }`}>
                    {activeConnCount} links
                  </span>
                </div>
                <div className="mt-1 text-[16px] font-semibold tracking-tight">{h.name}</div>
                <div className={`mt-1 text-[12px] line-clamp-2 leading-snug ${isSelected ? "text-white/80" : "text-label"
                  }`}>
                  {h.description}
                </div>
              </button>
            )
          })}
        </div>

        {/* Center / Right Column: Health Outcomes & Dynamic Evidence Inspector */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="flex items-center justify-between px-1">
            <span className="label font-bold text-ink">2. Connected Health Domains</span>
            <span className="text-[11px] text-label">Clinical & Biological Impacts</span>
          </div>

          {/* Outcome Pills Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {outcomes.map((o) => {
              const isSelected = selectedOutcome === o.id
              const hasConnectionToHazard = selectedHazard
                ? connections.some((c) => c.from === selectedHazard && c.to === o.id)
                : true

              return (
                <button
                  key={o.id}
                  onClick={() => {
                    setSelectedOutcome(isSelected ? null : o.id)
                  }}
                  className={`flex flex-col text-left rounded-2xl p-3 border transition-all text-[13px] ${isSelected
                      ? "bg-cyan-600 text-white border-cyan-600 shadow-sm"
                      : hasConnectionToHazard
                        ? "liquid-glass-clear border-border hover:liquid-glass-clear/70 text-ink"
                        : "liquid-glass-clear/50 border-border/50 text-label/60 opacity-60"
                    }`}
                >
                  <span className={`text-[10px] uppercase font-mono font-medium ${isSelected ? "text-white/80" : "text-label"
                    }`}>
                    {o.domain}
                  </span>
                  <span className="font-semibold leading-tight mt-0.5">{o.name}</span>
                </button>
              )
            })}
          </div>

          {/* Detailed Connection Inspector Card */}
          {activeConnection && (
            <Card className="p-5 sm:p-6 space-y-4 border-2 border-accent/20">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full liquid-glass-clear px-2.5 py-0.5 text-[11px] font-mono font-medium text-label">
                      {activeConnection.hazard} → {activeConnection.outcome}
                    </span>
                    <span className={`rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold ${activeConnection.evidenceStrength === "Established evidence"
                        ? "bg-signal/15 text-signal"
                        : activeConnection.evidenceStrength === "Emerging research"
                          ? "bg-accent/15 text-accent"
                          : "bg-warning/15 text-warning"
                      }`}>
                      {activeConnection.evidenceStrength}
                    </span>
                  </div>
                  <h3 className="mt-2 text-[20px] sm:text-[22px] font-semibold text-ink tracking-tight">
                    {activeConnection.healthImpact}
                  </h3>
                </div>

                <SourceChip kind="nasa" label="NASA Evidence Book" />
              </div>

              {/* Specific Sections */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13.5px]">
                <div className="rounded-2xl liquid-glass-clear p-4 space-y-2">
                  <div className="label !text-[11px] text-ink font-bold">Key Telemetry & Measurements</div>
                  <ul className="space-y-1 text-label list-disc pl-4">
                    {activeConnection.measurements.map((m) => (
                      <li key={m} className="font-medium text-ink/90">{m}</li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl liquid-glass-clear p-4 space-y-2">
                  <div className="label !text-[11px] text-ink font-bold">Suggested Monitoring Action</div>
                  <p className="text-label leading-relaxed font-medium">
                    {activeConnection.suggestedAction}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-border p-4 text-[13px] text-label space-y-1.5 leading-relaxed">
                <div className="font-semibold text-ink">Authoritative Scientific Source:</div>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span>{activeConnection.scientificEvidence} ({activeConnection.source})</span>
                  <a
                    href={activeConnection.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-medium text-accent hover:underline"
                  >
                    NASA Human System Risk Reference
                    <ExternalLink className="size-3" />
                  </a>
                </div>
              </div>

              {/* Selector for other related connections */}
              {filteredConnections.length > 1 && (
                <div className="pt-2 border-t border-border">
                  <div className="text-[12px] font-medium text-label mb-2">
                    Other connections matching current view ({filteredConnections.length}):
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {filteredConnections.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setActiveConnectionId(c.id)}
                        className={`rounded-full px-3 py-1 text-[12px] transition-colors ${activeConnection.id === c.id
                            ? "bg-cyan-600 text-white font-semibold"
                            : "liquid-glass-clear text-label hover:text-ink"
                          }`}
                      >
                        {c.hazard} → {c.outcome}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}



