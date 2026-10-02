import { useEffect, useRef, useState } from "react"
import { useReducedMotion } from "framer-motion"

export function DotWave({
  values,
  rows = 10,
  dot = 4,
  gap = 3,
  tone = "red",
  dark = false,
  label,
  className = "",
}: {
  values: number[]
  rows?: number
  dot?: number
  gap?: number
  tone?: "red" | "ink"
  dark?: boolean
  label: string
  className?: string
}) {
  const wrap = useRef<HTMLDivElement>(null)
  const cv = useRef<HTMLCanvasElement>(null)
  const vals = useRef(values)
  const [w, setW] = useState(300)
  const reduce = useReducedMotion()
  vals.current = values
  const pitch = dot + gap
  const cols = Math.max(8, Math.floor(w / pitch))
  const h = rows * pitch

  useEffect(() => {
    const el = wrap.current!
    const ro = new ResizeObserver(() => setW(el.clientWidth))
    ro.observe(el)
    setW(el.clientWidth)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const c = cv.current!,
      ctx = c.getContext("2d")!
    const dpr = window.devicePixelRatio || 1
    c.width = cols * pitch * dpr
    c.height = h * dpr
    c.style.width = `${cols * pitch}px`
    c.style.height = `${h}px`
    ctx.scale(dpr, dpr)
    const off = dark ? "var(--ink-3)" : "var(--data-muted)"
    const on = tone === "red" ? "var(--signal)" : "var(--ink)"
    const start = performance.now()
    let raf = 0
    const draw = (now: number) => {
      const t = (now - start) / 1000
      const reveal = reduce ? cols : Math.min(cols, (t / 1.1) * cols)
      const head = reduce ? -10 : (t * cols * 0.35) % (cols + 10)
      ctx.clearRect(0, 0, cols * pitch, h)
      const v = vals.current
      for (let i = 0; i < cols; i++) {
        const val = v.length
          ? v[Math.min(v.length - 1, Math.floor((i / cols) * v.length))]
          : 0
        const filled = Math.round(Math.max(0, Math.min(1, val)) * rows)
        for (let r = 0; r < rows; r++) {
          const lit = i <= reveal && r < filled
          ctx.globalAlpha = lit && Math.abs(i - head) < 2.5 ? 1 : lit ? 0.92 : 1
          ctx.fillStyle = lit ? on : off
          if (lit && tone === "red" && Math.abs(i - head) < 1.5) {
            ctx.shadowColor = "var(--signal-soft)"
            ctx.shadowBlur = 8
          } else ctx.shadowBlur = 0
          ctx.beginPath()
          ctx.arc(
            i * pitch + dot / 2,
            h - r * pitch - dot / 2 - gap / 2,
            lit && Math.abs(i - head) < 1.5 ? dot / 2 + 0.6 : dot / 2,
            0,
            6.283,
          )
          ctx.fill()
        }
      }
      if (!reduce) raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [cols, rows, pitch, h, dot, gap, tone, dark, reduce, values])

  return (
    <div
      ref={wrap}
      className={`w-full ${className}`}
      role="img"
      aria-label={label}
    >
      <canvas ref={cv} aria-hidden />
    </div>
  )
}
