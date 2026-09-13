import type { Metadata } from "next"

import { MapView } from "@/components/map/MapView"

export const metadata: Metadata = {
  title: "Mapa",
  description:
    "Calcula saltos entre sistemas de EVE Online y revisa si la ruta es segura.",
}

export default function MapPage() {
  return <MapView />
}
