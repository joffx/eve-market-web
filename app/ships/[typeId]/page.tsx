import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ShipDetailView } from "@/components/ships/ShipDetailView"
import { getShipById } from "@/data/ships"

type Props = {
  params: Promise<{ typeId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { typeId: raw } = await params
  const typeId = Number(raw)
  const ship = Number.isInteger(typeId) ? getShipById(typeId) : undefined

  if (!ship) {
    return { title: "Nave" }
  }

  return {
    title: ship.name,
    description: `${ship.name} · ${ship.groupName}`,
  }
}

export default async function ShipDetailPage({ params }: Props) {
  const { typeId: raw } = await params
  const typeId = Number(raw)

  if (!Number.isInteger(typeId) || typeId <= 0 || !getShipById(typeId)) {
    notFound()
  }

  return <ShipDetailView typeId={typeId} />
}
