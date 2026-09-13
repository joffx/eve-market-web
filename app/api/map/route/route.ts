import { NextResponse } from "next/server"

import { EsiError, esiFetch, esiPost } from "@/lib/eve/esi"
import { getSystemDetails } from "@/lib/eve/route"

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

async function resolveSystemId(name: string): Promise<{ id: number; name: string } | null> {
  const trimmed = name.trim()
  if (!trimmed) {
    return null
  }

  const data = await esiPost<{
    systems?: Array<{ id: number; name: string }>
  }>("/universe/ids/", [trimmed])

  const match = data.systems?.find(
    (system) => system.name.toLowerCase() === trimmed.toLowerCase()
  )

  return match ?? data.systems?.[0] ?? null
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const originName = searchParams.get("origin")
  const destinationName = searchParams.get("destination")
  const originIdParam = searchParams.get("originId")
  const destinationIdParam = searchParams.get("destinationId")
  const preference = parsePreference(searchParams.get("preference"))

  if (!originName && !originIdParam) {
    return NextResponse.json(
      { error: "Debes indicar origen" },
      { status: 400 }
    )
  }

  if (!destinationName && !destinationIdParam) {
    return NextResponse.json(
      { error: "Debes indicar destino" },
      { status: 400 }
    )
  }

  try {
    const [origin, destination] = await Promise.all([
      originIdParam
        ? Promise.resolve({ id: Number(originIdParam), name: originName ?? originIdParam })
        : resolveSystemId(originName ?? ""),
      destinationIdParam
        ? Promise.resolve({
            id: Number(destinationIdParam),
            name: destinationName ?? destinationIdParam,
          })
        : resolveSystemId(destinationName ?? ""),
    ])

    if (!origin || !Number.isFinite(origin.id)) {
      return NextResponse.json(
        { error: `No se encontró el sistema de origen: ${originName}` },
        { status: 404 }
      )
    }

    if (!destination || !Number.isFinite(destination.id)) {
      return NextResponse.json(
        { error: `No se encontró el sistema de destino: ${destinationName}` },
        { status: 404 }
      )
    }

    if (origin.id === destination.id) {
      return NextResponse.json(
        { error: "El origen y el destino son el mismo sistema" },
        { status: 400 }
      )
    }

    const { data: systemIds } = await esiFetch<number[]>(
      `/latest/route/${origin.id}/${destination.id}/`,
      {
        searchParams: { flag: FLAG_BY_PREFERENCE[preference] },
        revalidate: 3600,
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
          error: "Error al consultar ESI",
          details: error.message,
        },
        { status: error.status === 404 ? 404 : 502 }
      )
    }

    console.error(error)
    return NextResponse.json(
      {
        error: "No se pudo calcular la ruta",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    )
  }
}
