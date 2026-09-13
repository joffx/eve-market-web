import { NextResponse } from "next/server"

import { EsiError } from "@/lib/eve/esi"
import { getTopsSnapshot } from "@/lib/eve/tops"
import { resolveLocaleFromRequest } from "@/lib/i18n/locale"
import { translate } from "@/lib/i18n/messages"

export const revalidate = 300

export async function GET(request: Request) {
  const locale = resolveLocaleFromRequest(request)

  try {
    const snapshot = await getTopsSnapshot(10)
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
        error: translate(locale, "api.topsLoadFailed"),
        details: error instanceof Error ? error.message : translate(locale, "api.unknownError"),
      },
      { status: 500 }
    )
  }
}
