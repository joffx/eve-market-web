import { NextResponse } from "next/server"

import { filterSystems, type NamedSystem } from "@/data/systems"
import { EsiError, esiPost } from "@/lib/eve/esi"
import { resolveLocaleFromRequest } from "@/lib/i18n/locale"
import { translate } from "@/lib/i18n/messages"

export const revalidate = 3600

async function resolveFromEsi(query: string, locale: ReturnType<typeof resolveLocaleFromRequest>) {
  try {
    const data = await esiPost<{
      systems?: Array<{ id: number; name: string }>
    }>("/universe/ids/", [query], locale)

    return (data.systems ?? []).map((system) => ({
      systemId: system.id,
      name: system.name,
    }))
  } catch (error) {
    if (error instanceof EsiError && error.status === 404) {
      return []
    }
    throw error
  }
}

export async function GET(request: Request) {
  const locale = resolveLocaleFromRequest(request)
  const { searchParams } = new URL(request.url)
  const query = (searchParams.get("q") ?? "").trim()

  try {
    const local = filterSystems(query, 12)
    const esiMatches =
      query.length >= 2 ? await resolveFromEsi(query, locale) : ([] as NamedSystem[])

    const byId = new Map<number, NamedSystem>()

    for (const system of [...esiMatches, ...local]) {
      if (!byId.has(system.systemId)) {
        byId.set(system.systemId, system)
      }
    }

    const results = [...byId.values()].slice(0, 15)

    return NextResponse.json({
      query,
      results,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      {
        error: translate(locale, "api.systemsFailed"),
        details: error instanceof Error ? error.message : translate(locale, "api.unknownError"),
      },
      { status: 500 }
    )
  }
}
