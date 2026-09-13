import { NextResponse } from "next/server"

import { EsiError } from "@/lib/eve/esi"
import { assertKnownTypeId, getBuyHubsForType, parsePositiveInt } from "@/lib/eve/strategy"
import { resolveLocaleFromRequest } from "@/lib/i18n/locale"
import { translate } from "@/lib/i18n/messages"

export const revalidate = 300

export async function GET(request: Request) {
  const locale = resolveLocaleFromRequest(request)
  const { searchParams } = new URL(request.url)
  const typeId = parsePositiveInt(searchParams.get("typeId"))

  if (!typeId || !assertKnownTypeId(typeId)) {
    return NextResponse.json(
      { error: translate(locale, "strategy.api.typeRequired") },
      { status: 400 }
    )
  }

  try {
    const snapshot = await getBuyHubsForType(typeId)
    return NextResponse.json(snapshot, {
      headers: {
        "Cache-Control": "s-maxage=300, stale-while-revalidate=60",
      },
    })
  } catch (error) {
    if (error instanceof EsiError) {
      return NextResponse.json(
        {
          error: translate(locale, "api.esiError"),
          details: error.message,
        },
        { status: error.status === 404 ? 404 : 502 }
      )
    }

    console.error(error)
    return NextResponse.json(
      {
        error: translate(locale, "strategy.api.failed"),
        details: error instanceof Error ? error.message : translate(locale, "api.unknownError"),
      },
      { status: 500 }
    )
  }
}
