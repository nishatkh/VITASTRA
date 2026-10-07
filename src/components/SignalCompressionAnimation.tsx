import * as React from "react"

export function SignalCompressionAnimation({ height = 48, color = "var(--signal)" }: { height?: number; color?: string }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const rafRef = React.useRef(0)

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const dpr = window.devicePixelRatio || 1

    const resize = () => {
      const w = canvas.parentElement?.clientWidth || 300
      canvas.width = w * dpr
      canvas.height = height * dpr
      canvas.style.width = w + "px"
      canvas.style.height = height + "px"
      ctx.scale(dpr, dpr)
    }
    resize()
    const ro = new ResizeObserver(resize)
    if (canvas.parentElement) ro.observe(canvas.parentElement)

    let activeColor = color
    if (color.startsWith("var(")) {
      const varName = color.slice(4, -1).trim()
      const computed = getComputedStyle(canvas).getPropertyValue(varName).trim()
      if (computed) activeColor = computed
    }

    let phase = 0

    const draw = (t: number) => {
      const W = canvas.width / dpr
      const H = canvas.height / dpr
      ctx.clearRect(0, 0, W, H)

      phase += 0.04
      const midY = H * 0.5

      // Left side: 6 chaotic high-frequency raw telemetry waves (72 signals metaphor)
      ctx.save()
      ctx.lineWidth = 1.2
      for (let i = 0; i < 5; i++) {
        ctx.strokeStyle = activeColor
        ctx.globalAlpha = 0.18 + i * 0.08
        ctx.beginPath()
        const yOffset = (i - 2) * 5
        let started = false
        const endX = W * 0.45

        for (let x = 0; x <= endX; x += 4) {
          const freq = 0.15 + i * 0.04
          const amp = Math.sin(x * 0.05 + phase * 2 + i) * 6
          const y = midY + yOffset + amp
          if (!started) {
            ctx.moveTo(x, y)
            started = true
          } else {
            ctx.lineTo(x, y)
          }
        }
        ctx.stroke()
      }
      ctx.restore()

      // Center: Funnel / compression node
      ctx.save()
      ctx.fillStyle = activeColor
      ctx.shadowColor = activeColor
      ctx.shadowBlur = 8
      ctx.globalAlpha = 0.8
      ctx.beginPath()
      ctx.arc(W * 0.48, midY, 4, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()

      // Right side: 2 smooth, unified clinical story sine waves
      ctx.save()
      ctx.lineWidth = 2.2
      ctx.shadowColor = activeColor
      ctx.shadowBlur = 6
      ctx.strokeStyle = activeColor

      const drawRightWave = (offsetY: number, phaseShift: number) => {
        ctx.beginPath()
        let started = false
        const startX = W * 0.52
        for (let x = startX; x <= W; x += 4) {
          const progress = (x - startX) / (W - startX)
          const amp = Math.sin(progress * Math.PI * 3 - phase + phaseShift) * 7
          const y = midY + offsetY + amp
          if (!started) {
            ctx.moveTo(x, y)
            started = true
          } else {
            ctx.lineTo(x, y)
          }
        }
        ctx.stroke()
      }

      ctx.globalAlpha = 0.95
      drawRightWave(-4, 0)
      ctx.globalAlpha = 0.65
      drawRightWave(4, Math.PI * 0.5)

      ctx.restore()

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(rafRef.current)
      ro.disconnect()
    }
  }, [height, color])

  return <canvas ref={canvasRef} className="block w-full" />
}
