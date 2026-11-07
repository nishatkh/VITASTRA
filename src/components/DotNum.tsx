import { useEffect, useRef, useState } from "react"
import { animate, useReducedMotion } from "framer-motion"

export function DotNum({
  value,
  dec = 0,
  unit,
  size = 88,
  className = "",
  dark,
}: {
  value: number
  dec?: number
  unit?: string
  size?: number
  className?: string
  dark?: boolean
}) {
  const reduce = useReducedMotion()
  const [v, setV] = useState(value)
  const ref = useRef(value)
  useEffect(() => {
    if (reduce) {
      setV(value)
      ref.current = value
      return
    }
    const c = animate(ref.current, value, {
      duration: 0.6,
      ease: "easeOut",
      onUpdate: (x) => {
        ref.current = x
        setV(x)
      },
    })
    return () => c.stop()
  }, [value, reduce])
  return (
    <span
      className={`inline-flex items-baseline gap-2 ${className}`}
      role="text"
      aria-label={`${value.toFixed(dec)} ${unit ?? ""}`}
    >
      <span
        aria-hidden
        className={`dot-num ${dark ? "text-white" : "text-ink"}`}
        style={{ fontSize: size }}
      >
        {v.toFixed(dec)}
      </span>
      {unit && (
        <span
          aria-hidden
          className={`text-[14px] font-medium ${
            dark ? "text-white/60" : "text-label"
          }`}
        >
          {unit}
        </span>
      )}
    </span>
  )
}
