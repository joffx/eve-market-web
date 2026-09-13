import type { Metadata } from "next"

import { MarketView } from "@/components/market/MarketView"

export const metadata: Metadata = {
  title: "Sellers",
  description: "Sell orders for EVE Online minerals and ores via ESI.",
}

export default function SellersPage() {
  return <MarketView mode="sellers" />
}
