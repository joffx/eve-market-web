import { NextResponse } from "next/server"

import { filterSystems, getSystemByName, type NamedSystem } from "@/data/systems"
import { EsiError, esiPost } from "@/lib/eve/esi"
import { resolveLocaleFromRequest } from "@/lib/i18n/locale"
import { translate } from "@/lib/i18n/messages"

export const revalidate = 3600

async function resolveExactFromEsi(
  query: string,
  locale: ReturnType<typeof resolveLocaleFromRequest>
): Promise<NamedSystem[]> {
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
  const rawQuery = (searchParams.get("q") ?? "").trim()
  const query = rawQuery.replace(/\*+$/g, "").trim()

  try {
    // Local catalog covers high/low/null (prefix + contains). ESI only for exact extras.
    const local = filterSystems(query, 20)
    const exactLocal = query.length >= 2 ? getSystemByName(query) : undefined

    let esiMatches: NamedSystem[] = []
    if (query.length >= 2 && local.length < 5) {
      esiMatches = await resolveExactFromEsi(query, locale)
    }

    const byId = new Map<number, NamedSystem>()
    if (exactLocal) {
      byId.set(exactLocal.systemId, exactLocal)
    }
    for (const system of [...local, ...esiMatches]) {
      if (!byId.has(system.systemId)) {
        byId.set(system.systemId, system)
      }
    }

    const results = [...byId.values()].slice(0, 20)

    return NextResponse.json({
      query: rawQuery,
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
