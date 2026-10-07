import { useEffect, useRef, useState } from "react"
import { useReducedMotion } from "framer-motion"

export function DotWave({
  values,
  rows = 10,
  tone = "red",
  dark = false,
  label,
  className = "",
}: {
  values: number[]
  rows?: number
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
  const h = rows * 20

  useEffect(() => {
    const el = wrap.current
    if (!el) return
    const ro = new ResizeObserver(() => setW(el.clientWidth))
    ro.observe(el)
    setW(el.clientWidth)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const c = cv.current!
    if (!c) return
    const ctx = c.getContext("2d")!
    const dpr = window.devicePixelRatio || 1
    c.width = (wrap.current?.clientWidth || 300) * dpr
    c.height = h * dpr
    c.style.width = `${wrap.current?.clientWidth || 300}px`
    c.style.height = `${h}px`
    ctx.scale(dpr, dpr)
    const off = dark ? "var(--ink-3)" : "var(--data-muted)"
    const on = tone === "red" ? "var(--signal)" : "var(--ink)"
    const start = performance.now()
    let raf = 0
    const draw = (now: number) => {
      const t = (now - start) / 1000
      ctx.clearRect(0, 0, c.width, c.height)
      const v = vals.current
      const width = wrap.current?.clientWidth || 300
      const pointCount = Math.max(2, Math.floor((width / 2) / 2))
      ctx.beginPath()
      for (let i = 0; i < pointCount; i++) {
        const x = (i / (pointCount - 1)) * c.width
        const idx = Math.min(v.length - 1, Math.floor((i / (pointCount - 1)) * v.length))
        const y = h - (v[idx] * h) / 2 + h / 2
        if (i === 0) { ctx.moveTo(x, y) } else { ctx.lineTo(x, y) }
      }
      ctx.strokeStyle = on
      ctx.lineWidth = 2
      ctx.lineCap = "round"
      ctx.stroke()
      if (!reduce) raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [reduce, values])

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