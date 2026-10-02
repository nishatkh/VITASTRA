import { useRef, useState } from "react"
import { animate, motion, useMotionValue, useTransform } from "framer-motion"
import { ChevronsRight, Square, Check } from "lucide-react"

export function SlideToAct({
  label,
  onConfirm,
  doneLabel = "Done",
}: {
  label: string
  onConfirm: () => void
  doneLabel?: string
}) {
  const track = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const [done, setDone] = useState(false)
  const opacity = useTransform(x, [0, 140], [1, 0])
  const max = () => (track.current?.clientWidth ?? 300) - 64
  const fire = () => {
    setDone(true)
    onConfirm()
    animate(x, max(), { type: "spring", stiffness: 300, damping: 30 })
    setTimeout(() => {
      setDone(false)
      animate(x, 0, { type: "spring", stiffness: 300, damping: 30 })
    }, 2200)
  }
  return (
    <div
      ref={track}
      className="relative flex h-16 w-full items-center rounded-full bg-ink p-1 text-canvas"
      role="group"
      aria-label={label}
    >
      <motion.div
        style={{ opacity }}
        className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2 pl-14 text-[15px] font-semibold"
      >
        {label}
        <ChevronsRight
          className="chev"
          size={20}
          strokeWidth={1.6}
          aria-hidden
        />
      </motion.div>
      {done && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center pr-14 text-[15px] font-semibold">
          {doneLabel}
        </div>
      )}
      <motion.button
        drag={done ? false : "x"}
        dragConstraints={track}
        dragElastic={0}
        dragMomentum={false}
        style={{ x }}
        onDragEnd={() =>
          x.get() > max() * 0.82
            ? fire()
            : animate(x, 0, { type: "spring", stiffness: 400, damping: 32 })
        }
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !done) {
            e.preventDefault()
            fire()
          }
        }}
        aria-label={`${label}. Drag right or press Enter to confirm.`}
        className="relative z-10 flex size-14 shrink-0 cursor-grab touch-none items-center justify-center rounded-full bg-signal text-canvas shadow-[0_0_18px_var(--signal-soft)] active:cursor-grabbing"
      >
        {done ? (
          <Check size={24} strokeWidth={2} />
        ) : (
          <Square size={18} strokeWidth={2.5} fill="currentColor" />
        )}
      </motion.button>
    </div>
  )
}
