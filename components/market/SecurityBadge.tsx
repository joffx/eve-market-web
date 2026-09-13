import { cn } from "@/lib/utils"

type SecurityBadgeProps = {
  value: number | null
  className?: string
}

/** Compact security status indicator for EVE systems. */
export function SecurityBadge({ value, className }: SecurityBadgeProps) {
  if (value === null || Number.isNaN(value)) {
    return <span className={cn("font-mono text-xs tabular-nums text-muted-foreground", className)}>—</span>
  }

  const rounded = Math.round(value * 10) / 10
  const tone =
    rounded >= 0.5
      ? "text-success"
      : rounded >= 0.1
        ? "text-warning"
        : "text-destructive"

  return (
    <span className={cn("font-mono text-xs font-medium tabular-nums", tone, className)}>
      {rounded.toFixed(1)}
    </span>
  )
}
