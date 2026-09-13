import type { Metadata } from "next"

import { MarketView } from "@/components/market/MarketView"

export const metadata: Metadata = {
  title: "Compradores",
  description:
    "Órdenes de compra de minerales y menas de EVE Online vía ESI.",
}

export default function CompradoresPage() {
  return <MarketView mode="buyers" />
}
