import { NextResponse } from "next/server"

import { EsiError } from "@/lib/eve/esi"
import { getTopsSnapshot } from "@/lib/eve/tops"

export const revalidate = 300

export async function GET() {
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
          error: "Error al consultar ESI",
          details: error.message,
        },
        { status: error.status === 404 ? 404 : 502 }
      )
    }

    console.error(error)
    return NextResponse.json(
      {
        error: "No se pudieron cargar los tops",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    )
  }
}
