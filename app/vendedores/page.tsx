import type { Metadata } from "next"

import { MarketView } from "@/components/market/MarketView"

export const metadata: Metadata = {
  title: "Vendedores",
  description:
    "Órdenes de venta de minerales y menas de EVE Online vía ESI.",
}

export default function VendedoresPage() {
  return <MarketView mode="sellers" />
}
