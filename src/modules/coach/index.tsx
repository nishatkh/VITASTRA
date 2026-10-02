import { useEffect } from "react"
import { ModuleShell } from "../../components/Layout"
import { useEvaluation, useSendCoachMessage, useApp } from "../../api/hooks"
import MorphOrb from "../../components/ui/ai-thiking-orb-and-input"

const RECOMMENDATIONS = [
  "What changed today?",
  "What should I check?",
  "Radiation risk status",
  "Cognitive baseline check"
]

function getCoachReply(q: string, ev: any): string {
  const al = ev?.alerts?.filter((a: any) => a.level !== "normal") ?? []
  const t = q.toLowerCase()

  if (t.includes("changed")) {
    if (!al.length) return "All vitals and silent signals remain well within your personal baseline today. No anomalous telemetry detected."
    const a = al[0]
    return `${al.length} grouped pattern${al.length > 1 ? "s" : ""} detected from ${ev?.rawSignals?.length ?? 0} raw signals. Primary observation: ${a.title.toLowerCase()} (${Math.round((a.confidence ?? 0.85) * 100)}% confidence).`
  }

  if (t.includes("check")) {
    if (!al.length) return "No extra checks required right now. Maintain your regular balance, vision, and cognitive check-in schedule."
    const actions = al.flatMap((a: any) => a.actions ?? []).slice(0, 3)
    if (actions.length) {
      return `Recommended protocol actions: 1) ${actions[0]}. 2) ${actions[1] || "Review cabin CO2 scrubber"}. 3) ${actions[2] || "Log 15min biofeedback"}.`
    }
    return "Check vision acuity, inner ear balance drift, and cabin CO2 levels. Log results in Vitastra."
  }

  if (t.includes("radiation")) {
    return "Cumulative radiation exposure is within mission thresholds. Solar flux is normal, storm shelter protocol is currently standby."
  }

  if (t.includes("cognitive") || t.includes("sleep")) {
    return "Cognitive reaction speed is +4% compared to baseline. Sleep efficiency last night was 84%. Recommended: hydration and light stretch."
  }

  return `Analysis complete for "${q}". Telemetry shows stable trends across cardiovascular, ocular, and environmental metrics. Keep hydration steady and maintain daily baseline logs.`
}

export default function Coach() {
  const day = useApp((s) => s.day)
  const { data: ev } = useEvaluation(day)
  const pendingPrompt = useApp((s) => s.coachPrompt)
  const setPrompt = useApp((s) => s.setCoachPrompt)
  const sendMsg = useSendCoachMessage()

  const handleOrbSubmit = async (text: string): Promise<string> => {
    sendMsg.mutate(text)
    return getCoachReply(text, ev)
  }

  useEffect(() => {
    if (pendingPrompt) {
      handleOrbSubmit(pendingPrompt)
      setPrompt("")
    }
  }, [pendingPrompt])

  return (
    <ModuleShell title={["Health", "Coach"]}>
      <div className="col-span-full flex w-full flex-col items-center justify-center py-2 max-w-4xl mx-auto min-h-[480px]">
        <MorphOrb
          onSubmit={handleOrbSubmit}
          recommendations={RECOMMENDATIONS}
          minThinkMs={2800}
        />
      </div>
    </ModuleShell>
  )
}