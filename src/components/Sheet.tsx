import { createContext, useContext, useEffect, type ReactNode } from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion } from "framer-motion"
import { X } from "lucide-react"

export const SheetRootCtx = createContext<HTMLElement | null>(null)

export function Sheet({
  open,
  onClose,
  title,
  children,
  side = "bottom",
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  side?: "bottom" | "right"
}) {
  const root = useContext(SheetRootCtx)
  useEffect(() => {
    if (!open) return
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", k)
    return () => window.removeEventListener("keydown", k)
  }, [open, onClose])
  const panel =
    side === "bottom"
      ? "inset-x-0 bottom-0 max-h-[88%] rounded-t-[32px] md:mx-auto md:max-w-xl"
      : "right-0 top-0 bottom-0 w-[min(420px,100%)] rounded-l-[32px]"
  const from = side === "bottom" ? { y: "100%" } : { x: "100%" }
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className={`${root ? "absolute" : "fixed"} inset-0 z-[70]`}>
          <motion.div
            className="absolute inset-0 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={`absolute overflow-y-auto bg-surface p-6 pb-8 shadow-2xl ${panel}`}
            initial={from}
            animate={{ x: 0, y: 0 }}
            exit={from}
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <h2 className="text-[24px] font-semibold leading-tight tracking-[-0.02em]">
                {title}
              </h2>
              <button
                aria-label="Close"
                autoFocus
                onClick={onClose}
                className="icon-btn size-11 shrink-0"
              >
                <X size={20} strokeWidth={1.6} />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    root ?? document.body,
  )
}
