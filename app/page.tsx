import type { Metadata } from "next"

import { LandingHero } from "@/components/landing/LandingHero"
import { LandingMarketBoard, LandingStats } from "@/components/landing/LandingMarketBoard"

export const metadata: Metadata = {
  title: "Inicio",
  description:
    "Live market data, mining locations and tools for smarter decisions across New Eden.",
}

export default function HomePage() {
  return (
    <>
      <LandingHero />
      <LandingStats />
      <LandingMarketBoard />
    </>
  )
}
