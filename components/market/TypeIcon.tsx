"use client"

import { useState } from "react"

import { localTypeIconUrl } from "@/lib/eve/images"
import { cn } from "@/lib/utils"

type TypeIconProps = {
  typeId: number
  name: string
  /** Display size in CSS px. */
  size?: 32 | 40 | 64
  className?: string
}

export function TypeIcon({ typeId, size = 32, className }: TypeIconProps) {
  const [failed, setFailed] = useState(false)
  const px = size

  if (failed) {
    return (
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-md border border-border bg-card-elevated text-[10px] font-mono text-muted-foreground",
          className
        )}
        style={{ width: px, height: px }}
        aria-hidden
      >
        ?
      </span>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- local immutable proxy; avoid /_next/image optimizer memory
    <img
      src={localTypeIconUrl(typeId)}
      alt=""
      width={px}
      height={px}
      loading="lazy"
      decoding="async"
      // Browser caches 1y (immutable) from /api/eve-icon; no optimizer variants.
      className={cn(
        "shrink-0 rounded-md border border-border bg-card-elevated object-contain",
        className
      )}
      onError={() => setFailed(true)}
    />
  )
}
