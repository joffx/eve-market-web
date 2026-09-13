import type { MarketApiError, MarketSnapshot, OrderType } from "@/types/market"
import type { TopsSnapshot } from "@/lib/eve/tops"
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/locale"
import { translate } from "@/lib/i18n/messages"

async function readJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T
}

function errorMessage(
  payload: MarketApiError | { error: string; details?: string },
  fallback: string
) {
  if ("details" in payload && payload.details) {
    return `${payload.error}: ${payload.details}`
  }
  return payload.error || fallback
}

function localeHeaders(locale: Locale): HeadersInit {
  return { "Accept-Language": locale }
}

export async function fetchMarketSnapshot(options: {
  typeId: number
  region: number | "all"
  orderType: OrderType
  locale?: Locale
}): Promise<MarketSnapshot> {
  const locale = options.locale ?? DEFAULT_LOCALE
  const params = new URLSearchParams({ orderType: options.orderType, lang: locale })
  if (options.region !== "all") {
    params.set("region", String(options.region))
  }

  const response = await fetch(`/api/market/${options.typeId}?${params.toString()}`, {
    headers: localeHeaders(locale),
  })
  const payload = await readJson<MarketSnapshot | MarketApiError>(response)

  if (!response.ok) {
    throw new Error(
      errorMessage(payload as MarketApiError, translate(locale, "client.error.market"))
    )
  }

  return payload as MarketSnapshot
}

export async function fetchTopsSnapshot(locale: Locale = DEFAULT_LOCALE): Promise<TopsSnapshot> {
  const params = new URLSearchParams({ lang: locale })
  const response = await fetch(`/api/market/tops?${params.toString()}`, {
    headers: localeHeaders(locale),
  })
  const payload = await readJson<TopsSnapshot | { error: string; details?: string }>(response)

  if (!response.ok) {
    throw new Error(
      errorMessage(
        payload as { error: string; details?: string },
        translate(locale, "client.error.tops")
      )
    )
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
  locale?: Locale
}): Promise<RouteResult> {
  const locale = options.locale ?? DEFAULT_LOCALE
  const params = new URLSearchParams({ preference: options.preference, lang: locale })

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

  const response = await fetch(`/api/map/route?${params.toString()}`, {
    headers: localeHeaders(locale),
  })
  const payload = await readJson<RouteResult | { error: string; details?: string }>(response)

  if (!response.ok) {
    throw new Error(
      errorMessage(
        payload as { error: string; details?: string },
        translate(locale, "client.error.route")
      )
    )
  }

  return payload as RouteResult
}

export type SystemOption = {
  systemId: number
  name: string
  region?: string
}

export async function fetchSystems(
  query: string,
  locale: Locale = DEFAULT_LOCALE
): Promise<SystemOption[]> {
  const params = new URLSearchParams({ q: query, lang: locale })
  const response = await fetch(`/api/map/systems?${params.toString()}`, {
    headers: localeHeaders(locale),
  })
  if (!response.ok) {
    return []
  }
  const payload = await readJson<{ results: SystemOption[] }>(response)
  return payload.results ?? []
}
