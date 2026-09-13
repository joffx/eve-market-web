import type { Metadata } from "next"

import { ShipsView } from "@/components/ships/ShipsView"

export const metadata: Metadata = {
  title: "Naves",
  description: "Galería de todas las naves de EVE Online.",
}

export default function ShipsPage() {
  return <ShipsView />
}
