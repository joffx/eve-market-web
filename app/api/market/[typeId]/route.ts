import { NextResponse } from "next/server"

import { parseRegionId } from "@/data/regions"
import { getResourceById } from "@/data/resources"
import { EsiError } from "@/lib/eve/esi"
import { getMarketSnapshot } from "@/lib/eve/market"
import { resolveLocaleFromRequest } from "@/lib/i18n/locale"
import { translate } from "@/lib/i18n/messages"
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
  const locale = resolveLocaleFromRequest(request)
  const { typeId: typeIdParam } = await context.params
  const typeId = Number(typeIdParam)

  if (!Number.isInteger(typeId) || typeId <= 0) {
    return NextResponse.json({ error: translate(locale, "api.invalidTypeId") }, { status: 400 })
  }

  if (!getResourceById(typeId)) {
    return NextResponse.json(
      { error: translate(locale, "api.unsupportedTypeId") },
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
      locale,
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
          error: translate(locale, "api.esiError"),
          details: error.message,
        },
        { status }
      )
    }

    console.error(error)
    return NextResponse.json(
      {
        error: translate(locale, "api.marketLoadFailed"),
        details: error instanceof Error ? error.message : translate(locale, "api.unknownError"),
      },
      { status: 500 }
    )
  }
}
