import { useState } from "react"
import { Download, Satellite } from "lucide-react"
import { Card, Segmented, AdviceFooter } from "../../components/ui"
import { AlertBadge } from "../../components/Level"
import { SlideToAct } from "../../components/SlideToAct"
import { useEvaluation, useTriage, useSBAR, useSendSBAR, useSetDelay, useConnection, useApp } from "../../api/hooks"
import { exportJson, exportPdf } from "../../lib/export"

const LANES = [
  { id: "act", title: "Act now", sub: "Decide on board" },
  { id: "monitor", title: "Monitor", sub: "Keep watching" },
  { id: "earth", title: "Can wait for Earth", sub: "Send in report" },
] as const
const DELAYS = ["0", "5", "20", "40"] as const

export default function Triage() {
  const day = useApp((s) => s.day)
  const delay = useApp((s) => s.delay)
  const setAppDelay = useApp((s) => s.setDelay)
  const { data: ev } = useEvaluation(day)
  const { data: triageData } = useTriage(delay)
  const { data: sbarData } = useSBAR(delay)
  const setDelay = useSetDelay()
  const { state: commsState, queue } = useConnection()
  const [sent, setSent] = useState(false)
  const sendSBAR = useSendSBAR()

  const rtt = delay * 2
  const secs = delay * 60
  const items = triageData ?? []

  const exportPdfNow = () =>
    exportPdf("vitastra-sbar", "VITASTRA hand-off report (SBAR)", [
      ["Situation", sbarData?.situation ?? "No data"],
      ["Background", sbarData?.background ?? "No data"],
      ["Assessment", sbarData?.assessment ?? "No data"],
      ["Recommendation", sbarData?.recommendation ?? "No data"],
      ["Note", "VITASTRA advises. The astronaut and mission procedures decide."],
    ])

  if (!ev) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-[52px] font-light leading-[1.02] tracking-[-0.03em] md:text-[72px]"><span className="block text-ink-2">Delay-Aware Triage</span>& Earth Hand-off</h1>
        <div className="animate-pulse space-y-4"><div className="h-20 bg-border rounded" /><div className="h-20 bg-border rounded" /></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-[52px] font-light leading-[1.02] tracking-[-0.03em] md:text-[72px]"><span className="block text-ink-2">Delay-Aware Triage</span>& Earth Hand-off</h1>
      <Card className="flex flex-col gap-5 p-4 md:p-5">
        <div className="grid items-center gap-5 md:grid-cols-[minmax(0,360px)_1fr]">
          <div>
            <div className="label mb-2">One-way light delay, minutes</div>
            <Segmented
              label="Communication delay"
              value={String(delay) as typeof DELAYS[number]}
              options={DELAYS}
              onChange={(v) => {
                const dVal = Number(v) as 0 | 5 | 20 | 40
                setAppDelay(dVal)
                setDelay.mutate(dVal)
              }}
            />
          </div>
          <div>
            <div className="relative h-14" role="img" aria-label={`Signal travel: ${delay} minutes one way, ${rtt} minutes round trip`}>
              <div className="absolute left-4 right-4 top-1/2 h-px bg-border" />
              <div className="absolute left-0 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-ink text-canvas"><Satellite size={16} strokeWidth={1.5} /></div>
              <div className="absolute right-0 top-1/2 size-9 -translate-y-1/2 rounded-full bg-gradient-to-br from-border to-ink-3" />
              {delay > 0 && <div className="absolute top-1/2 size-3 -translate-y-1/2 rounded-full bg-signal shadow-[0_0_14px_var(--signal-soft)]" style={{ animation: `travel ${Math.max(1.6, delay / 6)}s linear infinite` }} />}
              <style>{`@keyframes travel{from{left:28px}to{left:calc(100% - 40px)}}@media (prefers-reduced-motion:reduce){[style*="travel"]{animation:none!important;left:50%}}`}</style>
            </div>
            <div className="mt-1 text-[13.5px] text-label">{delay === 0 ? "Real-time link. Earth can respond immediately." : `Round trip about ${rtt} min (${secs} s one way). Anything needing a decision sooner stays on board.`}</div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        {LANES.map((ln) => {
          const list = items.filter((i) => i.lane === ln.id)
          return (
            <section key={ln.id} aria-label={ln.title} className={`min-h-40 rounded-[28px] p-4 ${ln.id === "act" ? "bg-nav text-on-nav" : "bg-border/50"}`}>
              <div className="mb-3 flex items-baseline justify-between"><h2 className="text-[20px] font-semibold tracking-[-0.02em]">{ln.title}</h2><span className={`text-[12.5px] ${ln.id === "act" ? "text-on-nav/60" : "text-label"}`}>{ln.sub}</span></div>
              <ul className="flex flex-col gap-2.5">
                {list.length === 0 && <li className={`rounded-2xl border border-dashed px-4 py-5 text-[13.5px] ${ln.id === "act" ? "border-on-nav/25 text-on-nav/60" : "border-border text-label"}`}>Nothing here</li>}
                {list.map((i) => (
                  <li key={i.alertId} className={`rounded-[20px] p-4 transition-all duration-500 ${ln.id === "act" ? "bg-ink text-canvas" : "bg-raised shadow-[0_2px_8px_rgba(0,0,0,.05)] text-ink"}`}>
                    <div className="mb-2"><AlertBadge level={i.level} dark={ln.id === "act"} /></div>
                    <div className="text-[15.5px] font-semibold leading-tight">{i.title}</div>
                    <div className={`mt-1 text-[12.5px] leading-snug ${ln.id === "act" ? "text-canvas/70" : "text-label"}`}>{i.reason}</div>
                  </li>
                ))}
              </ul>
            </section>
          )
        })}
      </div>

      <Card className="p-5 md:p-7">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 className="text-[26px] font-semibold tracking-[-0.03em]">SBAR hand-off report</h2><span className="label">Generated mission day {sbarData?.generatedDay ?? day + 1} · delay {sbarData?.delayMin ?? delay} min</span></div>
        <dl className="grid gap-4 md:grid-cols-2">
          {([
            ["Situation", sbarData?.situation],
            ["Background", sbarData?.background],
            ["Assessment", sbarData?.assessment],
            ["Recommendation", sbarData?.recommendation],
          ] as const).map(([k, v]) => (
            <div key={k} className="rounded-[22px] bg-raised p-4 shadow-[0_2px_8px_rgba(0,0,0,.05)]"><dt className="label mb-1">{k}</dt><dd className="text-[14.5px] leading-snug">{v ?? "No data"}</dd></div>
          ))}
        </dl>
        <div className="mt-5 flex flex-wrap gap-3">
          <button onClick={exportPdfNow} className="btn btn-soft"><Download size={18} strokeWidth={1.6} />Export PDF</button>
          <button onClick={() => exportJson("vitastra-sbar", { report: sbarData, alerts: ev.alerts.map((a) => ({ id: a.id, title: a.title, level: a.level, confidence: a.confidence })) })} className="btn btn-soft">Export JSON</button>
        </div>
        <div className="mt-5 max-w-md">
          {sent ? <div className="rounded-full bg-ink px-6 py-4 text-center font-semibold text-canvas">Queued for Earth. Sends at the next contact window.</div> : <SlideToAct label="Slide to send to Earth" doneLabel="Queued" onConfirm={() => { setSent(true); sendSBAR.mutate(sbarData!); useApp.getState().queue(); useApp.getState().audit_("Astronaut", "SBAR report sent to Mission Control") }} />}
        </div>
      </Card>
      <AdviceFooter />
    </div>
  )
}