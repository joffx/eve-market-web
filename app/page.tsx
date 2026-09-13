import type { Metadata } from "next"

import { LandingHero } from "@/components/landing/LandingHero"
import { LandingTools } from "@/components/landing/LandingTools"

export const metadata: Metadata = {
  title: "Inicio",
  description:
    "EVE Mining Market: precios de minerales y menas con la API oficial ESI.",
}

export default function HomePage() {
  return (
    <>
      <LandingHero />
      <LandingTools />
    </>
  )
}
