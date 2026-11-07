import * as React from "react"

export function EcgLine({ bpm = 60, color = "#ef4444", height = 64 }: { bpm?: number; color?: string; height?: number }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const offsetRef = React.useRef(0)
  const rafRef = React.useRef(0)
  const bpmRef = React.useRef(bpm)
  bpmRef.current = bpm

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const dpr = window.devicePixelRatio || 1

    const resize = () => {
      const w = canvas.parentElement?.clientWidth || 400
      canvas.width = w * dpr
      canvas.height = height * dpr
      canvas.style.width = w + "px"
      canvas.style.height = height + "px"
      ctx.scale(dpr, dpr)
    }
    resize()
    const ro = new ResizeObserver(resize)
    if (canvas.parentElement) ro.observe(canvas.parentElement)

    // Resolve color if it is a CSS variable (e.g. var(--signal))
    let activeColor = color
    if (color.startsWith("var(")) {
      const varName = color.slice(4, -1).trim()
      const computed = getComputedStyle(canvas).getPropertyValue(varName).trim()
      if (computed) activeColor = computed
    }

    // QRS wave cycle shape [xFrac (0..1), yFrac (0..1)]
    const SHAPE: [number, number][] = [
      [0.00, 0.50], [0.07, 0.50],
      [0.09, 0.42], [0.13, 0.50],             // P wave
      [0.16, 0.50],
      [0.18, 0.57], [0.21, 0.05], [0.24, 0.68], // QRS spike
      [0.27, 0.50],
      [0.32, 0.35], [0.40, 0.50],             // T wave
      [1.00, 0.50],                            // Baseline pause
    ]

    let lastT = 0
    const draw = (t: number) => {
      const dt = Math.min(t - (lastT || t - 16), 50)
      lastT = t
      const W = canvas.width / dpr
      const H = canvas.height / dpr
      const CW = W / 2.2
      const pxPerMs = (CW * (bpmRef.current / 60)) / 1000
      offsetRef.current = (offsetRef.current + pxPerMs * dt) % CW

      ctx.clearRect(0, 0, W, H)

      // Outer glow pass
      ctx.save()
      ctx.shadowColor = activeColor
      ctx.shadowBlur = 10
      ctx.strokeStyle = activeColor + "66"
      ctx.lineWidth = 3
      ctx.lineCap = "round"
      ctx.lineJoin = "round"
      drawPath()
      ctx.restore()

      // Sharp line pass
      ctx.save()
      ctx.shadowColor = activeColor
      ctx.shadowBlur = 4
      ctx.strokeStyle = activeColor
      ctx.lineWidth = 2.0
      ctx.lineCap = "round"
      ctx.lineJoin = "round"
      drawPath()
      ctx.restore()

      rafRef.current = requestAnimationFrame(draw)

      function drawPath() {
        if (!ctx) return
        ctx.beginPath()
        let started = false
        for (let c = -1; c <= 4; c++) {
          for (const [px, py] of SHAPE) {
            const x = c * CW + px * CW - offsetRef.current
            const y = py * H
            if (!started) {
              ctx.moveTo(x, y)
              started = true
            } else {
              ctx.lineTo(x, y)
            }
          }
        }
        ctx.stroke()
      }
    }

    rafRef.current = requestAnimationFrame((t) => draw(t))
    return () => {
      cancelAnimationFrame(rafRef.current)
      ro.disconnect()
    }
  }, [color, height])

  return <canvas ref={canvasRef} className="block w-full" />
}
