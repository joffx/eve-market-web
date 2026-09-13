"use client"

import { getResourceSecurity, type ResourceSecurity } from "@/data/resources"
import type { MessageKey } from "@/lib/i18n/messages"
import { useT } from "@/stores/locale-store"
import { cn } from "@/lib/utils"

const LABEL_KEY: Record<Exclude<ResourceSecurity, null>, MessageKey> = {
  high: "resource.sec.high",
  low: "resource.sec.low",
  null: "resource.sec.null",
}

type ResourceSecurityBadgeProps = {
  typeId?: number
  security?: ResourceSecurity
  className?: string
  /** Show "Sector" label above / beside */
  showLabel?: boolean
}

export function ResourceSecurityBadge({
  typeId,
  security: securityProp,
  className,
  showLabel = false,
}: ResourceSecurityBadgeProps) {
  const t = useT()
  const security =
    securityProp !== undefined
      ? securityProp
      : typeId !== undefined
        ? getResourceSecurity(typeId)
        : null

  if (security === null) {
    return null
  }

  const tone =
    security === "high"
      ? "text-success border-success/30 bg-success/10"
      : security === "low"
        ? "text-warning border-warning/30 bg-warning/10"
        : "text-destructive border-destructive/30 bg-destructive/10"

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-medium tracking-wide uppercase",
        tone,
        className
      )}
      title={t(LABEL_KEY[security])}
    >
      {showLabel ? <span className="opacity-70">{t("resource.sec.short")}: </span> : null}
      {t(LABEL_KEY[security])}
    </span>
  )
}
