import Image from "next/image"
import Link from "next/link"

import { cn } from "@/lib/utils"

type BrandLogoProps = {
  className?: string
  priority?: boolean
  onClick?: () => void
}

/** Horizontal brand mark. Source has a black plate; lighten blend knocks it out on dark UI. */
export function BrandLogo({ className, priority = false, onClick }: BrandLogoProps) {
  return (
    <Link
      href="/"
      onClick={onClick}
      className={cn("inline-flex shrink-0 items-center transition-opacity hover:opacity-90", className)}
      aria-label="EVE Mining Market"
    >
      <Image
        src="/logo-eve-mining-market.png"
        alt="EVE Mining Market"
        width={1024}
        height={341}
        priority={priority}
        className="h-9 w-auto mix-blend-lighten sm:h-10"
      />
    </Link>
  )
}
