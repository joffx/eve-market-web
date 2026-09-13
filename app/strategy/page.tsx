import type { Metadata } from "next"

import { StrategyView } from "@/components/strategy/StrategyView"

export const metadata: Metadata = {
  title: "Mining strategy",
  description:
    "Pick your location and get the best ores to mine now — where to mine and where to sell.",
}

export default function StrategyPage() {
  return <StrategyView />
}
