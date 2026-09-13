import { NextResponse } from "next/server"

import { parseRegionId } from "@/data/regions"
import { getResourceById } from "@/data/resources"
import { EsiError } from "@/lib/eve/esi"
import { getMarketSnapshot } from "@/lib/eve/market"
import type { OrderType } from "@/types/market"

export const revalidate = 300

type RouteContext = {
  params: Promise<{ typeId: string }>
}

function parseOrderType(value: string | null): OrderType {
  if (value === "buy" || value === "sell" || value === "all") {
    return value
  }
  return "all"
}

export async function GET(request: Request, context: RouteContext) {
  const { typeId: typeIdParam } = await context.params
  const typeId = Number(typeIdParam)

  if (!Number.isInteger(typeId) || typeId <= 0) {
    return NextResponse.json({ error: "typeId inválido" }, { status: 400 })
  }

  if (!getResourceById(typeId)) {
    return NextResponse.json(
      { error: "Este typeId no es un mineral o mena soportado" },
      { status: 404 }
    )
  }

  const { searchParams } = new URL(request.url)
  const region = parseRegionId(searchParams.get("region"))
  const orderType = parseOrderType(searchParams.get("orderType"))

  try {
    const snapshot = await getMarketSnapshot({
      typeId,
      regionId: region,
      orderType,
    })

    return NextResponse.json(snapshot, {
      headers: {
        "Cache-Control": "s-maxage=300, stale-while-revalidate=60",
      },
    })
  } catch (error) {
    if (error instanceof EsiError) {
      const status = error.status === 404 ? 404 : error.status === 429 || error.status === 420 ? 429 : 502
      return NextResponse.json(
        {
          error: "Error al consultar ESI",
          details: error.message,
        },
        { status }
      )
    }

    console.error(error)
    return NextResponse.json(
      {
        error: "No se pudieron cargar los datos del mercado",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    )
  }
}
