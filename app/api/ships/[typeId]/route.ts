import { NextResponse } from "next/server"

import { getShipById } from "@/data/ships"
import { fetchShipDetail } from "@/lib/eve/ships"
import { resolveLocaleFromRequest } from "@/lib/i18n/locale"
import { translate } from "@/lib/i18n/messages"

export const revalidate = 86400

type Params = { params: Promise<{ typeId: string }> }

export async function GET(request: Request, { params }: Params) {
  const locale = resolveLocaleFromRequest(request)
  const { typeId: raw } = await params
  const typeId = Number(raw)

  if (!Number.isInteger(typeId) || typeId <= 0) {
    return NextResponse.json({ error: translate(locale, "api.invalidTypeId") }, { status: 400 })
  }

  if (!getShipById(typeId)) {
    return NextResponse.json({ error: translate(locale, "ships.notFound") }, { status: 404 })
  }

  try {
    const ship = await fetchShipDetail(typeId, locale)
    if (!ship) {
      return NextResponse.json({ error: translate(locale, "ships.notFound") }, { status: 404 })
    }
    return NextResponse.json(ship)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      {
        error: translate(locale, "ships.detailFailed"),
        details: error instanceof Error ? error.message : translate(locale, "api.unknownError"),
      },
      { status: 500 }
    )
  }
}
