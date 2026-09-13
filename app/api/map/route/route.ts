import { NextResponse } from "next/server"

import { EsiError, esiFetch, esiPost } from "@/lib/eve/esi"
import { getSystemDetails } from "@/lib/eve/route"
import { resolveLocaleFromRequest, type Locale } from "@/lib/i18n/locale"
import { translate } from "@/lib/i18n/messages"

export const revalidate = 3600

type RoutePreference = "shorter" | "secure" | "insecure"

const FLAG_BY_PREFERENCE: Record<RoutePreference, string> = {
  shorter: "shortest",
  secure: "secure",
  insecure: "insecure",
}

function parsePreference(value: string | null): RoutePreference {
  if (value === "shorter" || value === "secure" || value === "insecure") {
    return value
  }
  return "secure"
}

async function resolveSystemId(
  name: string,
  locale: Locale
): Promise<{ id: number; name: string } | null> {
  const trimmed = name.trim()
  if (!trimmed) {
    return null
  }

  const data = await esiPost<{
    systems?: Array<{ id: number; name: string }>
  }>("/universe/ids/", [trimmed], locale)

  const match = data.systems?.find(
    (system) => system.name.toLowerCase() === trimmed.toLowerCase()
  )

  return match ?? data.systems?.[0] ?? null
}

export async function GET(request: Request) {
  const locale = resolveLocaleFromRequest(request)
  const { searchParams } = new URL(request.url)
  const originName = searchParams.get("origin")
  const destinationName = searchParams.get("destination")
  const originIdParam = searchParams.get("originId")
  const destinationIdParam = searchParams.get("destinationId")
  const preference = parsePreference(searchParams.get("preference"))

  if (!originName && !originIdParam) {
    return NextResponse.json({ error: translate(locale, "api.originRequired") }, { status: 400 })
  }

  if (!destinationName && !destinationIdParam) {
    return NextResponse.json(
      { error: translate(locale, "api.destinationRequired") },
      { status: 400 }
    )
  }

  try {
    const [origin, destination] = await Promise.all([
      originIdParam
        ? Promise.resolve({ id: Number(originIdParam), name: originName ?? originIdParam })
        : resolveSystemId(originName ?? "", locale),
      destinationIdParam
        ? Promise.resolve({
            id: Number(destinationIdParam),
            name: destinationName ?? destinationIdParam,
          })
        : resolveSystemId(destinationName ?? "", locale),
    ])

    if (!origin || !Number.isFinite(origin.id)) {
      return NextResponse.json(
        {
          error: translate(locale, "api.originNotFound", { name: originName ?? "" }),
        },
        { status: 404 }
      )
    }

    if (!destination || !Number.isFinite(destination.id)) {
      return NextResponse.json(
        {
          error: translate(locale, "api.destinationNotFound", {
            name: destinationName ?? "",
          }),
        },
        { status: 404 }
      )
    }

    if (origin.id === destination.id) {
      return NextResponse.json({ error: translate(locale, "api.sameSystem") }, { status: 400 })
    }

    const { data: systemIds } = await esiFetch<number[]>(
      `/latest/route/${origin.id}/${destination.id}/`,
      {
        searchParams: { flag: FLAG_BY_PREFERENCE[preference] },
        revalidate: 3600,
        locale,
      }
    )

    const systems = await Promise.all(systemIds.map((systemId) => getSystemDetails(systemId)))

    const hasLowSec = systems.some((system) => system.securityClass === "low")
    const hasNullSec = systems.some((system) => system.securityClass === "null")

    return NextResponse.json({
      origin: systems[0],
      destination: systems[systems.length - 1],
      jumps: Math.max(systemIds.length - 1, 0),
      preference,
      systems,
      hasLowSec,
      hasNullSec,
      isFullyHighSec: !hasLowSec && !hasNullSec,
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
        error: translate(locale, "api.routeFailed"),
        details: error instanceof Error ? error.message : translate(locale, "api.unknownError"),
      },
      { status: 500 }
    )
  }
}
