import type { Metadata } from "next"

import { MarketView } from "@/components/market/MarketView"

export const metadata: Metadata = {
  title: "Buyers",
  description: "Buy orders for EVE Online minerals and ores via ESI.",
}

export default function BuyersPage() {
  return <MarketView mode="buyers" />
}
