import { ModuleShell, NextActions } from "../../components/Layout"
import { Card, Segmented } from "../../components/ui"
import { ConfidenceBar } from "../../components/Level"
import { DotWave } from "../../components/DotWave"
import { useEvaluation, useApp } from "../../api/hooks"
import { EmptyState, SkeletonCard } from "../../components/EmptyState"

const MODES = ["Normal", "Sensor dropout", "Real change"] as const

export default function Sensor() {
  const day = useApp((s) => s.day)
  const { data: ev } = useEvaluation(day)
  const mode = useApp((s) => s.flags.sensorMode)
  const setFlag = useApp((s) => s.setFlag)
  const cur = mode === "none" ? "Normal" : mode === "dropout" ? "Sensor dropout" : "Real change"

  if (!ev) {
    return (
      <ModuleShell title={["Sensor", "Check"]}>
        <SkeletonCard />
        <SkeletonCard />
      </ModuleShell>
    )
  }

  const f = ev.fault
  const trace = Array.from({ length: 48 }, (_, i) =>
    mode === "dropout" && i > 30 ? 0 : mode === "real" && i > 30 ? 0.3 + Math.sin(i) * 0.02 : 0.75 + Math.sin(i * 0.6) * 0.04,
  )

  return (
    <ModuleShell title={["Sensor", "Check"]}>
      <Card className="p-5">
        <div className="label mb-3">Demo input</div>
        <Segmented label="Simulated SpO2 signal" value={cur} options={MODES} onChange={(v) => setFlag("sensorMode", v === "Normal" ? "none" : v === "Sensor dropout" ? "dropout" : "real")} />
        <div className="mt-4"><DotWave values={trace} rows={7} tone={mode === "none" ? "ink" : "red"} label="SpO2 signal trace" /></div>
      </Card>
      {f ? (
        <Card className="flex flex-col gap-4 p-5">
          <div className="text-[26px] font-semibold leading-tight tracking-[-0.03em]">
            {f.faultPct >= 50 ? `Likely sensor fault (${f.faultPct}%)` : `Likely real change (${f.realPct}%)`}
          </div>
          <ConfidenceBar value={f.faultPct >= 50 ? f.faultPct / 100 : f.realPct / 100} label={f.faultPct >= 50 ? "Fault likelihood" : "Real-change likelihood"} />
          <ul className="flex flex-col gap-1.5 text-[14.5px]">
            <li>{f.abrupt > 0.5 ? "Signal fell abruptly to zero in one sample." : "Signal changed gradually, like a physiological change."}</li>
            <li>{f.corro < 0.5 ? "No other channel moved. Heart rate and breathing are steady." : "Heart rate and breathing moved with it."}</li>
          </ul>
        </Card>
      ) : (
        <Card className="p-5 text-[15px] text-label">The signal looks consistent with the other channels. Choose a demo input above to see how a fault is told apart from a real change.</Card>
      )}
      <NextActions items={f ? f.faultPct >= 50 ? ["Reseat the finger sensor and re-read after 30 seconds", "Hold the alert until the re-read confirms"] : ["Treat the reading as real and repeat with a second sensor", "Escalate through the Coach if it persists (MED-1.1)"] : ["No action needed"]} />
    </ModuleShell>
  )
}