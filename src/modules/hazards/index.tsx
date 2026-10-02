import { useEffect, useRef, useState } from "react"
import { Pause, Play } from "lucide-react"
import { Card } from "../../components/ui"
import { useEvaluation, useHazards, useHazardOutcomes, useHazardLinks, useHazardExposures } from "../../api/hooks"
import { EmptyState, SkeletonCard } from "../../components/EmptyState"

const N = 183
const W = 920, H = 440, XL = 250, XR = 670, TOP = 50, GAP = 84
const ys = (i: number) => TOP + i * GAP
const monthLabel = (d: number) => d === 0 ? "Day 1" : d < 30 ? `Day ${d + 1}` : `Month ${(d / 30.4).toFixed(1)}`

export default function Hazards() {
  const day = 0
  const { data: ev } = useEvaluation(day)
  const { data: hazardsData } = useHazards()
  const { data: outcomesData } = useHazardOutcomes()
  const { data: linksData } = useHazardLinks()
  const { data: exposuresData } = useHazardExposures(day)

  const start = 0
  const [d, setD] = useState(start)
  const [play, setPlay] = useState(false)
  const [hover, setHover] = useState<string | null>(null)
  const raf = useRef(0)

  useEffect(() => {
    if (!play) return
    let last = performance.now(), acc = d
    const loop = (t: number) => {
      acc += ((t - last) / 1000) * 24; last = t
      if (acc >= N - 1) { setD(N - 1); setPlay(false); return }
      setD(Math.floor(acc)); raf.current = requestAnimationFrame(loop)
    }
    raf.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf.current)
  }, [play])

  if (!ev) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-[52px] font-light leading-[1.02] tracking-[-0.03em] md:text-[72px]"><span className="block text-ink-2">Hazard-to-Outcome</span>Map</h1>
        <SkeletonCard />
      </div>
    )
  }

  const hazards = hazardsData ?? []
  const outcomes = outcomesData ?? []
  const hazardLinks = linksData ?? []
  const exposures = exposuresData ?? {}

  const key = (l: typeof hazardLinks[number]) => `${l.from}-${l.to}`
  const active = hover ? hazardLinks.find((l) => key(l) === hover) : null
  const hi = (l: typeof hazardLinks[number]) => !hover || hover === key(l) || (hover.startsWith("h:") && l.from === hover.slice(2)) || (hover.startsWith("o:") && l.to === hover.slice(2))
  const hl = hover?.startsWith("h:") || hover?.startsWith("o:")

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-[52px] font-light leading-[1.02] tracking-[-0.03em] md:text-[72px]"><span className="block text-ink-2">Hazard-to-Outcome</span>Map</h1>
      <p className="max-w-2xl text-[16px] leading-snug text-label">Five spaceflight hazards feed five health outcomes. Curve thickness grows with cumulative exposure on the selected day. Hover or focus a curve to see which signals connect them.</p>
      <Card className="p-4 md:p-6">
        <style>{`@keyframes hz-flow{to{stroke-dashoffset:-24}}.hz-flow{animation:hz-flow 1.6s linear infinite}@media (prefers-reduced-motion:reduce){.hz-flow{animation:none}}`}</style>
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`Map of five hazards to five outcomes at ${monthLabel(d)}. Thicker lines mean more exposure.`}>
          {hazardLinks.map((l) => {
            const a = hazards.findIndex((h) => h.id === l.from), b = outcomes.findIndex((o) => o.id === l.to)
            const y1 = ys(a), y2 = ys(b), mx = (XL + XR) / 2
            const w = 1 + l.w * (exposures[l.from] ?? 0) * 20
            const path = `M${XL},${y1} C${mx},${y1} ${mx},${y2} ${XR},${y2}`
            const on = hi(l), sel = hover === key(l) || (hl && on)
            return (
              <g key={key(l)}>
                <path d={path} fill="none" stroke={sel ? "var(--signal)" : "var(--ink)"} strokeOpacity={on ? (sel ? 0.9 : 0.55) : 0.08} strokeWidth={w} strokeLinecap="round" style={{ transition: "stroke-width .35s cubic-bezier(.3,1.2,.5,1), stroke-opacity .2s" }} />
                {on && <path d={path} fill="none" stroke="var(--canvas)" strokeOpacity={0.55} strokeWidth={1.2} strokeDasharray="2 10" strokeLinecap="round" className="hz-flow" />}
                <path d={path} fill="none" stroke="transparent" strokeWidth={Math.max(w, 22)} tabIndex={0} role="button" aria-label={`${hazards[a].label} to ${outcomes[b].label}. Signals: ${l.signals.join(", ")}`} className="cursor-pointer outline-none" onMouseEnter={() => setHover(key(l))} onMouseLeave={() => setHover(null)} onFocus={() => setHover(key(l))} onBlur={() => setHover(null)} />
              </g>
            )
          })}
          {hazards.map((h, i) => (
            <g key={h.id} tabIndex={0} role="button" aria-label={`Hazard: ${h.label}, exposure ${Math.round((exposures[h.id] ?? 0) * 100)} percent`} onMouseEnter={() => setHover("h:" + h.id)} onMouseLeave={() => setHover(null)} onFocus={() => setHover("h:" + h.id)} onBlur={() => setHover(null)} className="cursor-pointer outline-none">
              <rect x={0} y={ys(i) - 24} width={XL - 18} height={48} rx={24} fill="var(--surface)" stroke="var(--border)" />
              <text x={22} y={ys(i) + 5} fontSize={14} fontWeight={600} fill="var(--ink)">{h.label.length > 22 ? h.label.replace("Hostile / ", "") : h.label}</text>
              <circle cx={XL} cy={ys(i)} r={6} fill="var(--ink)" />
            </g>
          ))}
          {outcomes.map((o, i) => (
            <g key={o.id} tabIndex={0} role="button" aria-label={`Outcome: ${o.label}`} onMouseEnter={() => setHover("o:" + o.id)} onMouseLeave={() => setHover(null)} onFocus={() => setHover("o:" + o.id)} onBlur={() => setHover(null)} className="cursor-pointer outline-none">
              <circle cx={XR} cy={ys(i)} r={6} fill="var(--ink)" />
              <rect x={XR + 18} y={ys(i) - 24} width={W - XR - 18} height={48} rx={24} fill="var(--ink)" />
              <text x={XR + 42} y={ys(i) + 5} fontSize={14} fontWeight={600} fill="var(--canvas)">{o.label}</text>
            </g>
          ))}
        </svg>
        <div aria-live="polite" className="mt-2 min-h-[64px] rounded-[20px] bg-raised p-4 text-[14px] shadow-[0_2px_8px_rgba(0,0,0,.05)]">
          {active ? <><b>{hazards.find((h) => h.id === active.from)?.label} to {outcomes.find((o) => o.id === active.to)?.label}.</b> Contributing signals: {active.signals.join(", ")}.</> : <span className="text-label">Hover or focus a curve, hazard or outcome to see the signals behind it. Physiology signals are synthetic. Radiation and solar data come from NASA RadLab and DONKI.</span>}
        </div>
        <div className="mt-4 flex items-center gap-4">
          <button onClick={() => { if (d >= N - 1) setD(0); setPlay(!play) }} aria-label={play ? "Pause" : "Play"} className="icon-btn size-14 bg-ink text-canvas">{play ? <Pause size={22} strokeWidth={1.6} /> : <Play size={22} strokeWidth={1.6} />}</button>
          <div className="flex-1">
            <div className="mb-1 flex justify-between text-[12.5px] font-semibold"><span>Day 1</span><span className="dot-num text-[15px]">{monthLabel(d)}</span><span>6 months</span></div>
            <input type="range" min={0} max={N - 1} value={d} onChange={(e) => { setPlay(false); setD(+e.target.value) }} aria-label="Mission day" className="h-11 w-full accent-ink" />
          </div>
        </div>
      </Card>
    </div>
  )
}