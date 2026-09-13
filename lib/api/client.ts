import type { MarketApiError, MarketSnapshot, OrderType } from "@/types/market"
import type { TopsSnapshot } from "@/lib/eve/tops"

async function readJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T
}

function errorMessage(payload: MarketApiError | { error: string; details?: string }, fallback: string) {
  if ("details" in payload && payload.details) {
    return `${payload.error}: ${payload.details}`
  }
  return payload.error || fallback
}

export async function fetchMarketSnapshot(options: {
  typeId: number
  region: number | "all"
  orderType: OrderType
}): Promise<MarketSnapshot> {
  const params = new URLSearchParams({ orderType: options.orderType })
  if (options.region !== "all") {
    params.set("region", String(options.region))
  }

  const response = await fetch(`/api/market/${options.typeId}?${params.toString()}`)
  const payload = await readJson<MarketSnapshot | MarketApiError>(response)

  if (!response.ok) {
    throw new Error(errorMessage(payload as MarketApiError, "Error al cargar el mercado"))
  }

  return payload as MarketSnapshot
}

export async function fetchTopsSnapshot(): Promise<TopsSnapshot> {
  const response = await fetch("/api/market/tops")
  const payload = await readJson<TopsSnapshot | { error: string; details?: string }>(response)

  if (!response.ok) {
    throw new Error(errorMessage(payload as { error: string; details?: string }, "Error al cargar tops"))
  }

  return payload as TopsSnapshot
}

export type RoutePreference = "shorter" | "secure" | "insecure"

export type RouteSystem = {
  systemId: number
  name: string
  securityStatus: number
  securityClass: "high" | "low" | "null"
}

export type RouteResult = {
  origin: RouteSystem
  destination: RouteSystem
  jumps: number
  preference: RoutePreference
  systems: RouteSystem[]
  hasLowSec: boolean
  hasNullSec: boolean
  isFullyHighSec: boolean
}

export async function fetchRoute(options: {
  originId?: number | null
  destinationId?: number | null
  originName?: string
  destinationName?: string
  preference: RoutePreference
}): Promise<RouteResult> {
  const params = new URLSearchParams({ preference: options.preference })

  if (options.originId) {
    params.set("originId", String(options.originId))
  } else if (options.originName) {
    params.set("origin", options.originName)
  }

  if (options.destinationId) {
    params.set("destinationId", String(options.destinationId))
  } else if (options.destinationName) {
    params.set("destination", options.destinationName)
  }

  const response = await fetch(`/api/map/route?${params.toString()}`)
  const payload = await readJson<RouteResult | { error: string; details?: string }>(response)

  if (!response.ok) {
    throw new Error(errorMessage(payload as { error: string; details?: string }, "No se pudo calcular la ruta"))
  }

  return payload as RouteResult
}

export type SystemOption = {
  systemId: number
  name: string
  region?: string
}

export async function fetchSystems(query: string): Promise<SystemOption[]> {
  const params = new URLSearchParams({ q: query })
  const response = await fetch(`/api/map/systems?${params.toString()}`)
  if (!response.ok) {
    return []
  }
  const payload = await readJson<{ results: SystemOption[] }>(response)
  return payload.results ?? []
}
