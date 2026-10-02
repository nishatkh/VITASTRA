import { useState } from "react"
import { Link } from "react-router"
import { ModuleShell, StatusRow, NextActions } from "../../components/Layout"
import { DotNum } from "../../components/DotNum"
import { BaselineChart } from "../../components/Charts"
import { Card, Glossary, SourceChip } from "../../components/ui"
import { useEvaluation, useApp } from "../../api/hooks"
import type { Level } from "../../data/types"
import { EmptyChart, EmptyState, SkeletonCard } from "../../components/EmptyState"

const CUSUM_H = 5

const Q = ["Headache on waking", "Blurred near vision", "Flashes or halos"]

export default function Vision() {
  const day = useApp((s) => s.day)
  const { data: ev } = useEvaluation(day)
  const setPrompt = useApp((s) => s.setCoachPrompt)
  const [ans, setAns] = useState<boolean[]>([false, false, false])
  const [sent, setSent] = useState(false)

  if (!ev) {
    return (
      <ModuleShell title={["Vision &", "Fluid Shift"]}>
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </ModuleShell>
    )
  }

  const level: Level = ev.cusum > CUSUM_H ? "warning" : ev.cusum > 0.6 * CUSUM_H ? "observe" : "normal"
  const n = ans.filter(Boolean).length
  const repeat = n > 0 || level !== "normal"

  return (
    <ModuleShell title={["Vision &", "Fluid Shift"]}>
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <span className="label">Vision index · weekly check</span>
          <SourceChip kind="synthetic" />
        </div>
        <div className="my-3">
          <DotNum value={ev.sm.vision} dec={1} unit={`pts (${(ev.sm.vision - (ev.sm.vision - ev.z.vision * 2)).toFixed(1)} vs baseline)`} size={84} />
        </div>
        <p className="text-[14px] leading-snug text-label">
          Fluid shifts toward the head in microgravity are tracked through{" "}
          <Glossary term="SANS">
            Spaceflight-Associated Neuro-ocular Syndrome. Fluid shifts in
            microgravity can change the eye and optic nerve. VITASTRA only
            watches for change from your baseline. It does not diagnose.
          </Glossary>
          -related signs.
        </p>
      </Card>
      <section className="card p-5">
        <div className="label mb-1">Vision check vs your baseline</div>
        {ev ? <BaselineChart metric="vision" day={day} /> : <EmptyChart title="No baseline data" />}
      </section>
      <Card className="flex flex-col gap-3 p-5">
        <div className="text-[18px] font-semibold tracking-[-0.02em]">Headache and vision questionnaire</div>
        {Q.map((q, i) => (
          <label key={q} className="flex min-h-12 items-center justify-between gap-3 rounded-2xl bg-raised px-4 text-[15px] shadow-[0_2px_8px_rgba(0,0,0,.05)]">
            {q}
            <input
              type="checkbox"
              className="size-6 accent-ink"
              checked={ans[i]}
              onChange={() => {
                setSent(false)
                setAns(ans.map((a, j) => (j === i ? !a : a)))
              }}
            />
          </label>
        ))}
        <button className="btn btn-ink" onClick={() => { setSent(true); useApp.getState().queue(); useApp.getState().audit_("Astronaut", "Vision questionnaire submitted") }}>
          Save answers
        </button>
        {sent && (
          <div className="rounded-2xl bg-raised p-4 text-[14.5px] leading-snug shadow-[0_2px_8px_rgba(0,0,0,.05)]">
            {repeat ? (
              <>
                <b>Repeat or report.</b> Repeat the near-acuity check tomorrow in matched lighting. If the index is below baseline again, report it.
              </>
            ) : (
              <>
                <b>No change reported.</b> Next scheduled check continues as planned.
              </>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <Link to="/coach" onClick={() => setPrompt("Explain my vision drift")} className="btn btn-soft !min-h-11">Ask the Coach</Link>
            </div>
          </div>
        )}
      </Card>
      <StatusRow
        level={level}
        title={level === "normal" ? "Inside your baseline" : "Slow vision drift"}
        confidence={Math.min(0.92, 0.3 + ev.cusum / 10)}
        why={[
          `CUSUM statistic ${ev.cusum.toFixed(1)} of the ${CUSUM_H} alarm line.`,
          `Vision index ${ev.sm.vision.toFixed(1)} against a baseline that will be computed from first 30 days.`,
          "CUSUM adds up small, steady shortfalls that a single day would hide.",
        ]}
      />
      <NextActions
        items={
          level === "normal"
            ? ["Next vision check stays on schedule (MED-4.2)"]
            : [
                "Repeat the vision check in matched lighting (MED-4.2)",
                "Note any new headache or blurred vision in the questionnaire",
                "Share the trend with the flight surgeon (MED-1.1)",
              ]
        }
      />
    </ModuleShell>
  )
}