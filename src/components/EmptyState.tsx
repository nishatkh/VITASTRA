import type { ReactNode } from "react"
import { BarChart3 } from "lucide-react"

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="card flex flex-col items-center justify-center gap-4 p-8 text-center">
      {icon && <div className="text-ink/40">{icon}</div>}
      <div>
        <div className="text-[18px] font-semibold">{title}</div>
        <p className="mt-2 text-label max-w-xs">{description}</p>
      </div>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function EmptyChart({ title = "No data available", description = "Connect a data source to see trends." }: { title?: string; description?: string }) {
  return (
    <div className="card flex flex-col items-center justify-center gap-3 p-8 text-center" role="img" aria-label={title}>
      <div className="text-ink/40"><BarChart3 size={36} strokeWidth={1.4} /></div>
      <div className="text-[16px] font-semibold">{title}</div>
      <p className="text-label">{description}</p>
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="card p-5 animate-pulse space-y-4">
      <div className="h-4 bg-border rounded w-1/4" />
      <div className="h-8 bg-border rounded w-1/2" />
      <div className="h-4 bg-border rounded w-3/4" />
      <div className="h-4 bg-border rounded w-full" />
    </div>
  )
}

export function SkeletonChart({ height = 200 }: { height?: number }) {
  return (
    <div className="card p-5 animate-pulse" style={{ height }}>
      <div className="h-4 bg-border rounded w-1/4 mb-4" />
      <div className="h-full bg-gradient-to-t from-border/50 to-transparent rounded" />
    </div>
  )
}