import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router"
import { motion } from "framer-motion"
import { PulseOrb } from "../../components/PulseOrb"
import { SlideToAct } from "../../components/SlideToAct"
import { AlertBadge } from "../../components/Level"
import { useEvaluation, useApp } from "../../api/hooks"
import { fitness, saveResult } from "./fit"

type Phase = "intro" | "count" | "wait" | "go" | "early" | "balance" | "result"
const TRIALS = 5,
  HOLD = 10

export default function CognitiveTest() {
  const nav = useNavigate()
  const day = useApp((s) => s.day)
  const { data: ev } = useEvaluation(day)

  if (!ev) return null
  const [phase, setPhase] = useState<Phase>("intro")
  const [count, setCount] = useState(3)
  const [trial, setTrial] = useState(0)
  const [times, setTimes] = useState<number[]>([])
  const [hold, setHold] = useState(0)
  const [sway, setSway] = useState(0)
  const t0 = useRef(0)
  const motionVals = useRef<number[]>([])
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => () => clearTimeout(timer.current), [])
  const armTrial = () => {
    setPhase("wait")
    timer.current = setTimeout(
      () => {
        t0.current = performance.now()
        setPhase("go")
      },
      1200 + Math.random() * 2000,
    )
  }
  const start = () => {
    setPhase("count")
    setCount(3)
    setTimes([])
    setTrial(0)
  }
  useEffect(() => {
    if (phase !== "count") return
    if (count === 0) {
      armTrial()
      return
    }
    const t = setTimeout(() => setCount(count - 1), 800)
    return () => clearTimeout(t)
  }, [phase, count])

  const tap = () => {
    if (phase === "wait") {
      clearTimeout(timer.current)
      setPhase("early")
      timer.current = setTimeout(armTrial, 1200)
      return
    }
    if (phase !== "go") return
    const rt = performance.now() - t0.current
    const all = [...times, rt]
    setTimes(all)
    if (all.length >= TRIALS) {
      beginBalance()
      return
    }
    setTrial(all.length)
    armTrial()
  }

  const beginBalance = () => {
    setPhase("balance")
    setHold(0)
    motionVals.current = []
    const h = (e: DeviceMotionEvent) => {
      const a = e.accelerationIncludingGravity
      if (a) motionVals.current.push(Math.hypot(a.x ?? 0, a.y ?? 0, a.z ?? 0))
    }
    window.addEventListener("devicemotion", h)
    let s = 0
    const iv = setInterval(() => {
      s++
      setHold(s)
      if (s >= HOLD) {
        clearInterval(iv)
        window.removeEventListener("devicemotion", h)
        const v = motionVals.current
        let idx: number
        if (v.length > 20) {
          const m = v.reduce((a, b) => a + b, 0) / v.length
          idx =
            1 +
            Math.sqrt(v.reduce((a, b) => a + (b - m) ** 2, 0) / v.length) / 4
        } else idx = (ev.sm.balance ?? 1) + (Math.random() - 0.5) * 0.06
        setSway(idx)
        setPhase("result")
      }
    }, 1000)
    timer.current = (iv as unknown as ReturnType<typeof setTimeout>)
  }

  const median = times.length
    ? [...times].sort((a, b) => a - b)[Math.floor(times.length / 2)]
    : 0
  const adj = median ? Math.max(180, median) : 0
  const f = fitness(adj || ev.sm.reaction, sway || ev.sm.balance, ev.z.sleep)
  const progress =
    phase === "intro"
      ? 0
      : phase === "result"
        ? 1
        : phase === "balance"
          ? (TRIALS + hold / HOLD) / (TRIALS + 1)
          : (trial + (phase === "go" ? 0.5 : 0)) / (TRIALS + 1)
  const stim = phase === "go"
  return (
    <div className="bg-nav fixed inset-0 z-[80] flex flex-col items-center px-5 pb-8 pt-10 text-on-nav [&>*]:w-full [&>*]:max-w-xl">
      <div className="mb-4 flex items-center justify-between text-[13px] text-on-nav/70">
        <span>
          {phase === "balance"
            ? "Balance test"
            : phase === "result"
              ? "Result"
              : "Reaction test"}
        </span>
        <span>
          {phase === "balance"
            ? `${HOLD - hold}s left`
            : phase === "wait" || phase === "go" || phase === "early"
              ? `Trial ${Math.min(trial + 1, TRIALS)} of ${TRIALS}`
              : ""}
        </span>
      </div>
      <div
        role="progressbar"
        aria-label="Test progress"
        aria-valuenow={Math.round(progress * 100)}
        className="mb-6 h-1.5 overflow-hidden rounded-full bg-border"
      >
        <motion.div
          className="h-full rounded-full bg-signal"
          animate={{ width: `${progress * 100}%` }}
        />
      </div>

      {phase === "intro" && (
        <div className="flex flex-1 flex-col justify-between">
          <div>
            <h1 className="text-[44px] font-light leading-[1.02] tracking-[-0.03em]">
              <span className="block text-ink-2">Reaction and</span>Balance test
            </h1>
            <p className="mt-4 text-[16px] leading-relaxed text-on-nav/75">
              Five quick taps, then ten seconds holding still. Tap the moment
              the ring turns red. Tapping early restarts the trial.
            </p>
          </div>
          <div className="flex justify-center">
            <PulseOrb size={240} bpm={ev.nowS.hr} />
          </div>
          <button
            onClick={start}
            className="btn btn-lg w-full bg-on-nav text-nav"
          >
            Begin
          </button>
        </div>
      )}
      {phase === "count" && (
        <div className="flex flex-1 items-center justify-center">
          <span className="dot-num text-[180px]">{count || "Go"}</span>
        </div>
      )}
      {(phase === "wait" || phase === "go" || phase === "early") && (
        <button
          onPointerDown={tap}
          aria-label={stim ? "Tap now" : "Wait for the ring to turn red"}
          className="relative flex min-h-[56px] flex-1 flex-col items-center justify-center gap-6 rounded-[32px] outline-none"
        >
          <div
            className={`flex size-64 items-center justify-center rounded-full border-2 transition-colors duration-75 ${
              stim
                ? "border-signal bg-signal shadow-[0_0_80px_var(--signal-soft)]"
                : "bg-border/50"
            }`}
          >
            <span className="text-[22px] font-semibold">
              {stim ? "Tap" : phase === "early" ? "Too early" : "Wait"}
            </span>
          </div>
          <span className="text-[14px] text-on-nav/60" aria-live="polite">
            {times.length
              ? `Last: ${Math.round(times[times.length - 1])} ms`
              : " "}
          </span>
        </button>
      )}
      {phase === "balance" && (
        <div className="flex flex-1 flex-col items-center justify-center gap-8 text-center">
          <PulseOrb size={260} bpm={ev.nowS.hr} />
          <div>
            <div className="dot-num text-[120px]">{HOLD - hold}</div>
            <p className="text-[16px] text-on-nav/75">
              Stand with feet together. Hold the device against your chest and
              keep still.
            </p>
          </div>
        </div>
      )}
      {phase === "result" && (
        <div className="flex flex-1 flex-col gap-5">
          <h1 className="text-[44px] font-light leading-[1.02] tracking-[-0.03em]">
            <span className="block text-ink-2">Fit for demanding</span>tasks?
          </h1>
          <div className="bg-nav p-5">
            <div className="mb-3 flex items-center gap-3">
              <span className="text-[36px] font-semibold tracking-[-0.03em]">
                {f.verdict}
              </span>
              <AlertBadge
                dark
                level={
                  f.verdict === "Fit"
                    ? "normal"
                    : f.verdict === "Caution"
                      ? "observe"
                      : "warning"
                }
              />
            </div>
            <ul className="flex flex-col gap-2 text-[14.5px] leading-snug text-on-nav/80">
              {f.reasons.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
            <p className="mt-3 text-[12.5px] text-on-nav/50">
              Synthetic baseline. A result, not a diagnosis.
            </p>
          </div>
          <div className="mt-auto flex flex-col gap-3">
            <button
              className="btn btn-lg bg-on-nav text-nav"
              onClick={() => {
                saveResult({ reaction: adj, sway, day: ev.day })
                useApp.getState().queue()
                useApp
                  .getState()
                  .audit_("Astronaut", "Reaction and balance test saved")
                nav("/cognitive")
              }}
            >
              Save result
            </button>
          </div>
        </div>
      )}
      {phase !== "result" && phase !== "intro" && (
        <div className="mt-4">
          <SlideToAct
            label="Stop test"
            onConfirm={() => setTimeout(() => nav("/cognitive"), 500)}
          />
        </div>
      )}
      {phase === "intro" && (
        <button
          onClick={() => nav("/cognitive")}
          className="mt-3 min-h-14 text-[15px] text-on-nav/60"
        >
          Cancel
        </button>
      )}
    </div>
  )
}
