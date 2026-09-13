import type { Metadata } from "next"

import { TopsView } from "@/components/tops/TopsView"

export const metadata: Metadata = {
  title: "Tops 10",
  description:
    "Top 10 minerales, menas y gases más caros de EVE Online para ganar ISK.",
}

export default function TopsPage() {
  return <TopsView />
}
