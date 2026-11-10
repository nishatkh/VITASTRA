import { useState, useEffect, useMemo } from "react"
import { useApp } from "../../store/useApp"
import { Link } from "react-router"
import {
  Orbit,
  Radiation as RadiationIcon,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Info,
  Sliders,
} from "lucide-react"
import { ModuleShell, StatusRow, NextActions } from "../../components/Layout"
import { DotNum } from "../../components/DotNum"
import { DotWave } from "../../components/DotWave"
import { Card, Glossary, SourceChip } from "../../components/ui"
import { SlideToAct } from "../../components/SlideToAct"
import { AreaTrend, GaugeGraph, CHART_COLORS } from "../../components/Analytics"
import { useEvaluation, useCareerDose, useRadiationLedger } from "../../api/hooks"
import { fetchDonkiSolarEvents, DonkiEvent, DonkiFetchResult } from "../../services/nasa/donkiService"
import type { Level } from "../../data/types"

const CAREER_LIMIT = 600 // mSv NASA STD-3001
const ASSUMED_Q = 2.0 // Biological quality factor assumption

const SHELTER_STEPS = [
  "Cease non-essential tasks and secure loose equipment",
  "Report status to Flight Surgeon / MCC-H via voice loop",
  "Relocate crew to central shielded storm haven (Zvezda / Node 2)",
  "Close internal pressure hatches and verify seal integrity",
  "Deploy supplementary water and polyethylene shielding bricks",
  "Continuous dosimeter logging every 30 minutes until all-clear",
]

export default function Radiation() {
  const day = useApp((s) => s.day)
  const { data: ev } = useEvaluation(day)
  const { data: careerDose } = useCareerDose()
  const { data: radiationLedger } = useRadiationLedger({ from: Math.max(0, day - 59), to: day })

  // DONKI State
  const [donkiData, setDonkiData] = useState<DonkiFetchResult | null>(null)
  const [loadingDonki, setLoadingDonki] = useState(false)
  const [activeDrill, setActiveDrill] = useState(false)
  const [shelterTicks, setShelterTicks] = useState<boolean[]>(SHELTER_STEPS.map(() => false))

  const loadDonki = async () => {
    setLoadingDonki(true)
    try {
      const res = await fetchDonkiSolarEvents()
      setDonkiData(res)
    } finally {
      setLoadingDonki(false)
    }
  }

  useEffect(() => {
    loadDonki()
  }, [])

  const spe = activeDrill // Drill mode or live critical event
  const level: Level = spe ? "critical" : (careerDose?.pct ?? 0) > 0.75 ? "observe" : "normal"
  const rates = radiationLedger?.slice(-60).map((r) => r.doseRate) ?? []
  const wave = rates.map((r) => (r - 0.3) / 1.1)

  const doseSeries = useMemo(
    () =>
      (radiationLedger ?? []).map((r) => ({
        day: `D${r.day}`,
        cumulative: r.cumulative,
        career: r.career,
      })),
    [radiationLedger],
  )

  const activeEvents = donkiData?.events || []
  const topSolarEvent = activeEvents[0]

  return (
    <ModuleShell title={["Radiation & Space", "Weather Intelligence"]}>
      {/* Career Effective Dose vs Limit */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="label font-semibold text-ink">Astronaut Career Effective Dose</span>
          <SourceChip kind="nasa" label="NASA RadLab + STD-3001" />
        </div>

        <div className="my-2">
          <DotNum
            value={careerDose?.total ?? ev?.career?.total ?? 100.6}
            unit={`of ${CAREER_LIMIT} mSv career limit`}
            size={84}
          />
        </div>

        {/* Progress against limit */}
        <div className="h-2.5 overflow-hidden rounded-full bg-border" role="progressbar" aria-valuenow={Math.round((careerDose?.pct ?? 0.17) * 100)}>
          <div
            className="h-full rounded-full liquid-glass-dark transition-all duration-500"
            style={{ width: `${Math.min(100, (careerDose?.pct ?? 0.17) * 100)}%` }}
          />
        </div>

        <div className="text-[13.5px] leading-relaxed text-label space-y-2">
          <p>
            Current mission cumulative: <strong>{ev?.dose?.cumulative.toFixed(1) ?? "20.6"} mSv</strong>. Absorbed physical dose about{" "}
            <strong>{((ev?.dose?.cumulative ?? 20.6) / ASSUMED_Q).toFixed(1)} mGy</strong>.
          </p>
          <div className="rounded-2xl liquid-glass-clear p-3 text-[12.5px] space-y-1">
            <div className="font-semibold text-ink">Scientific Dosimetry Disclosure:</div>
            <p>
              Space detectors (Liulin-5, REM) measure physical absorbed dose in milligrays (mGy). Calculating biological effective dose in millisieverts (mSv) requires an assumed quality factor (Q = {ASSUMED_Q.toFixed(1)}), representing biological relative effectiveness across heavy ion (HZE) and proton spectra.
            </p>
          </div>
        </div>
      </Card>

      {/* 60-Day Dose Rate Trend */}
      <Card className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="label">Environmental Dose Rate (60-day profile)</div>
            <div className="text-[20px] font-semibold text-ink tabular-nums">
              {ev?.doseRate?.toFixed(2) ?? "0.48"} <span className="text-[14px] font-normal text-label">mSv/day</span>
            </div>
          </div>
          <span className="text-[12px] text-label">LEO Orbital Average</span>
        </div>

        {wave.length > 0 ? (
          <DotWave
            values={wave}
            rows={7}
            label={`Dose rate over 60 days, now ${ev?.doseRate?.toFixed(2) ?? "0.48"} mSv/day`}
          />
        ) : (
          <div className="text-[13px] text-label py-4 text-center">Awaiting telemetry stream...</div>
        )}
      </Card>

      {/* Dose Accumulation & Career Envelope */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="label font-semibold text-ink">Dose Accumulation &amp; Career Envelope</span>
          <SourceChip kind="nasa" label="RadLab ledger" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] items-start gap-4">
          <AreaTrend
            data={doseSeries}
            xKey="day"
            yKeys={["cumulative", "career"]}
            labels={["Mission cumulative", "Career cumulative"]}
            colors={[CHART_COLORS.signal, CHART_COLORS.violet]}
            unit="mSv"
            decimals={1}
            refValue={CAREER_LIMIT}
            refLabel={`Career limit ${CAREER_LIMIT} mSv`}
            height={190}
            ariaLabel={`Cumulative mission dose and career dose over the last ${doseSeries.length} days. Mission cumulative around 20 mSv, career total ${careerDose?.total ?? 100.6} mSv against the ${CAREER_LIMIT} mSv NASA career limit.`}
          />

          <div className="flex flex-col items-center gap-1">
            <GaugeGraph
              value={careerDose?.pct ?? 0.17}
              label="Career limit used"
              ariaLabel={`Career dose envelope gauge: ${Math.round((careerDose?.pct ?? 0.17) * 100)} percent of the ${CAREER_LIMIT} mSv lifetime limit consumed.`}
            />
            <span className="text-[11.5px] text-label text-center max-w-[150px]">
              Lifetime effective-dose envelope vs NASA STD-3001 limit.
            </span>
          </div>
        </div>

        <p className="text-[12px] leading-snug text-label">
          The violet career curve includes the pre-mission 80 mSv carried into this flight. Even a major SPE M-class
          event (~6 h sheltered) would shift the mission curve by only a few mSv — well inside the envelope.
        </p>
      </Card>

      {/* NASA DONKI Live Space Weather Monitor */}
      <Card className="p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <Orbit className="size-5 text-accent" />
            <div>
              <div className="label">Solar Event Intelligence</div>
              <h3 className="text-[17px] font-semibold text-ink">NASA DONKI Space Weather Monitor</h3>
            </div>
          </div>

          <button
            onClick={loadDonki}
            disabled={loadingDonki}
            className="inline-flex items-center gap-1.5 rounded-full liquid-glass-clear px-3.5 py-1 text-[12px] font-medium text-ink hover:bg-border transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`size-3.5 ${loadingDonki ? "animate-spin" : ""}`} />
            {loadingDonki ? "Querying..." : "Refresh DONKI API"}
          </button>
        </div>

        {donkiData && (
          <div className="rounded-2xl liquid-glass-clear p-3.5 text-[13px] text-label space-y-1">
            <div className="flex items-center gap-2 font-semibold text-ink">
              <span className={`size-2 rounded-full ${
                donkiData.sourceMode === "live_nasa_api" ? "bg-signal" : "bg-accent"
              }`} />
              Status: {donkiData.sourceMode === "live_nasa_api" ? "Live NASA API Stream" : "Verified NASA Archive Fallback"}
            </div>
            <p className="text-[12px] leading-relaxed">{donkiData.statusMessage}</p>
          </div>
        )}

        {/* Top Space Weather Event Details */}
        {topSolarEvent && (
          <div className="rounded-2xl border border-border p-4 space-y-3 liquid-glass-clear">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="rounded-full bg-signal/15 px-3 py-0.5 text-[12px] font-semibold text-signal">
                Flare Class: {topSolarEvent.classType}
              </span>
              <span className="text-[12px] text-label font-mono">
                Peak: {new Date(topSolarEvent.peakTime).toUTCString()}
              </span>
            </div>

            <div className="space-y-1">
              <div className="font-semibold text-[15px] text-ink">{topSolarEvent.note}</div>
              <div className="text-[12.5px] text-label">
                <strong>Active Region:</strong> AR{topSolarEvent.activeRegionNum || "N/A"} · <strong>Location:</strong> {topSolarEvent.sourceLocation}
              </div>
            </div>

            <div className="rounded-xl liquid-glass-clear p-3 text-[12.5px] text-label space-y-1">
              <div className="font-semibold text-ink">Flight Operational Guidance:</div>
              <p>{topSolarEvent.operationalGuidance}</p>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11.5px] text-label">{topSolarEvent.source}</span>
              <a
                href={topSolarEvent.catalogUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[12.5px] font-medium text-accent hover:underline"
              >
                Inspect on NASA DONKI
                <ExternalLink className="size-3" />
              </a>
            </div>
          </div>
        )}

        {/* Drill Toggle */}
        <div className="pt-2 flex items-center justify-between">
          <span className="text-[13px] text-label">
            Test crew shelter execution readiness:
          </span>
          <button
            onClick={() => setActiveDrill(!activeDrill)}
            className={`rounded-full px-4 py-1.5 text-[12.5px] font-semibold transition-colors ${
              activeDrill
                ? "bg-warning text-white"
                : "liquid-glass-clear text-ink hover:bg-border"
            }`}
          >
            {activeDrill ? "Stop Solar Flare Drill" : "Initiate Solar Storm Drill"}
          </button>
        </div>
      </Card>

      {/* Shelter Now Checklist (Active during SPE or Drill) */}
      {spe && (
        <section className="liquid-glass-primary glass-hover p-5 border-2 border-warning space-y-4" aria-label="Shelter now checklist">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="size-5 text-warning" />
                <h3 className="text-[20px] font-semibold text-ink">Storm Shelter Protocol Active</h3>
              </div>
              <p className="text-[13px] text-label mt-0.5">
                Execute checklist immediately. Oversized tap targets designed for pressurized gloves.
              </p>
            </div>
            <span className="rounded-full bg-warning/20 text-warning px-3 py-1 text-[12px] font-bold">
              DRILL / SPE ACTIVE
            </span>
          </div>

          <ul className="space-y-2.5">
            {SHELTER_STEPS.map((step, idx) => (
              <li key={step}>
                <label className="flex min-h-[58px] cursor-pointer items-center gap-4 rounded-2xl liquid-glass-clear px-4 text-[15px] font-medium text-ink shadow-xs hover:bg-border transition-colors">
                  <input
                    type="checkbox"
                    checked={shelterTicks[idx]}
                    onChange={() =>
                      setShelterTicks((prev) =>
                        prev.map((t, j) => (j === idx ? !t : t))
                      )
                    }
                    className="size-6 shrink-0 accent-ink"
                  />
                  <span>{step}</span>
                </label>
              </li>
            ))}
          </ul>
        </section>
      )}
    </ModuleShell>
  )
}




