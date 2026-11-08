import MorphOrb from "../../components/ui/ai-thiking-orb-and-input"
import { queryNasaBrain } from "./coachBrain"
import { useEvaluation, useBaselines } from "../../api/hooks"
import { useApp } from "../../store/useApp"

const SUGGESTED_INQUIRIES = [
  "What physiological trends changed today?",
  "Why is my resting heart rate elevated?",
  "Explain my vision SANS surveillance status",
  "How does cabin CO2 relate to my symptoms?",
  "What is my cumulative radiation dose status?",
  "What checks are due or missing?",
]

export default function Coach() {
  const day = useApp((s) => s.day)
  const { data: ev } = useEvaluation(day)
  const { data: baselinesData } = useBaselines(day)

  const handleOrbSubmit = async (text: string): Promise<string> => {
    const result = queryNasaBrain(text, ev, baselinesData ?? [])
    return result.speechSummary
  }

  return (
    <div className="flex min-h-[500px] w-full items-center justify-center py-4">
      <MorphOrb
        onSubmit={handleOrbSubmit}
        minThinkMs={1800}
        speed={1}
        recommendations={SUGGESTED_INQUIRIES}
      />
    </div>
  )
}
