import { useEffect, useRef } from "react"
import { useReducedMotion } from "framer-motion"

export function PulseOrb({
  size = 260,
  bpm = 62,
}: {
  size?: number
  bpm?: number
}) {
  const ref = useRef<HTMLCanvasElement>(null)
  const bp = useRef(bpm)
  bp.current = bpm
  const reduce = useReducedMotion()
  useEffect(() => {
    const c = ref.current!,
      ctx = c.getContext("2d")!
    const dpr = window.devicePixelRatio || 1
    c.width = size * dpr
    c.height = size * dpr
    ctx.scale(dpr, dpr)
    const n = 900
    const pts = Array.from({ length: n }, (_, i) => {
      const y = 1 - (i / (n - 1)) * 2,
        r = Math.sqrt(1 - y * y),
        th = i * 2.399963
      return [Math.cos(th) * r, y, Math.sin(th) * r]
    })
    const ring = Array.from({ length: 220 }, (_, i) => {
      const a = (i / 220) * 6.283
      return [Math.cos(a) * 1.32, 0, Math.sin(a) * 1.32]
    })
    const start = performance.now()
    let raf = 0
    const draw = (now: number) => {
      const t = (now - start) / 1000
      const beat = reduce
        ? 0
        : Math.pow(Math.max(0, Math.sin((t * bp.current * Math.PI) / 60)), 3)
      const R = size * 0.3 * (1 + 0.06 * beat)
      ctx.clearRect(0, 0, size, size)
      const ay = reduce ? 0.6 : t * 0.35,
        ax = 0.45
      for (const [list, big] of [
        [pts, 1],
        [ring, 0],
      ] as const) {
        for (let i = 0; i < list.length; i++) {
          let [x, y, z] = list[i]
          const bump = big ? 1 + 0.05 * beat * Math.sin(i * 0.7 + t * 3) : 1
          x *= bump
          y *= bump
          z *= bump
          const cx = x * Math.cos(ay) + z * Math.sin(ay),
            cz = -x * Math.sin(ay) + z * Math.cos(ay)
          const cy = y * Math.cos(ax) - cz * Math.sin(ax),
            dz = y * Math.sin(ax) + cz * Math.cos(ax)
          const d = (dz + 1.4) / 2.8
          ctx.fillStyle = `rgba(255,26,26,${0.18 + 0.82 * d})`
          ctx.beginPath()
          ctx.arc(size / 2 + cx * R, size / 2 + cy * R, 0.7 + d * 1.2, 0, 6.283)
          ctx.fill()
        }
      }
      if (!reduce) raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [size, reduce])
  return (
    <canvas
      ref={ref}
      role="img"
      aria-label={`Particle orb pulsing at ${Math.round(bpm)} beats per minute`}
      style={{ width: size, height: size }}
    />
  )
}
