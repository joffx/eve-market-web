import type { Metadata } from "next"

import { StrategyView } from "@/components/strategy/StrategyView"

export const metadata: Metadata = {
  title: "Estrategia minera",
  description:
    "Planifica qué minar, dónde vender y cómo mover el cargamento en EVE Online.",
}

export default function EstrategiaMineraPage() {
  return <StrategyView />
}
