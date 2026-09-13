import { MARKET_REGIONS, getRegionById } from "@/data/regions"
import { getResourceById } from "@/data/resources"
import { esiFetch } from "@/lib/eve/esi"
import { resolveLocations, type LocationInfo } from "@/lib/eve/universe"
import type {
  EsiMarketOrder,
  MarketOrderRow,
  MarketSnapshot,
  MarketSummary,
  OrderType,
} from "@/types/market"

function addDays(isoDate: string, days: number): string {
  const date = new Date(isoDate)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString()
}

async function fetchOrdersForRegion(
  regionId: number,
  typeId: number,
  orderType: OrderType
): Promise<{ orders: EsiMarketOrder[]; updatedAt: string }> {
  const first = await esiFetch<EsiMarketOrder[]>(`/markets/${regionId}/orders/`, {
    searchParams: {
      order_type: orderType,
      type_id: typeId,
      page: 1,
    },
  })

  const orders = [...first.data]
  const totalPages = first.pages

  if (totalPages > 1) {
    const remaining = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, index) =>
        esiFetch<EsiMarketOrder[]>(`/markets/${regionId}/orders/`, {
          searchParams: {
            order_type: orderType,
            type_id: typeId,
            page: index + 2,
          },
        })
      )
    )

    for (const pageResult of remaining) {
      orders.push(...pageResult.data)
    }
  }

  return {
    orders,
    updatedAt: first.lastModified
      ? new Date(first.lastModified).toISOString()
      : new Date().toISOString(),
  }
}

function resolveRowLocation(
  order: EsiMarketOrder,
  locations: Map<number, LocationInfo>,
  systems: Map<number, { name: string; securityStatus: number }>
): Pick<MarketOrderRow, "locationName" | "systemName" | "securityStatus"> {
  const location = locations.get(order.location_id)
  const system = systems.get(order.system_id)

  return {
    locationName: location?.name ?? "Estructura de jugador desconocida",
    systemName: location?.systemName ?? system?.name ?? null,
    securityStatus: location?.securityStatus ?? system?.securityStatus ?? null,
  }
}

function toOrderRow(
  order: EsiMarketOrder,
  regionId: number,
  updatedAt: string,
  location: Pick<MarketOrderRow, "locationName" | "systemName" | "securityStatus">
): MarketOrderRow {
  const region = getRegionById(regionId)

  return {
    orderId: order.order_id,
    regionId,
    regionName: region?.name ?? String(regionId),
    quantity: order.volume_remain,
    price: order.price,
    locationId: order.location_id,
    locationName: location.locationName,
    systemName: location.systemName,
    securityStatus: location.securityStatus,
    range: order.range,
    minVolume: order.min_volume,
    issued: order.issued,
    duration: order.duration,
    expiresAt: addDays(order.issued, order.duration),
    isBuyOrder: order.is_buy_order,
    updatedAt,
  }
}

function buildSummary(
  typeId: number,
  typeName: string,
  sellers: MarketOrderRow[],
  buyers: MarketOrderRow[],
  updatedAt: string
): MarketSummary {
  const bestSell = sellers.length > 0 ? Math.min(...sellers.map((o) => o.price)) : null
  const bestBuy = buyers.length > 0 ? Math.max(...buyers.map((o) => o.price)) : null

  let spread: number | null = null
  let spreadPercent: number | null = null

  if (bestSell !== null && bestBuy !== null) {
    spread = bestBuy - bestSell
    if (bestSell > 0) {
      spreadPercent = ((bestBuy - bestSell) / bestSell) * 100
    }
  }

  return {
    typeId,
    typeName,
    bestSell,
    bestBuy,
    spread,
    spreadPercent,
    sellVolume: sellers.reduce((sum, order) => sum + order.quantity, 0),
    buyVolume: buyers.reduce((sum, order) => sum + order.quantity, 0),
    updatedAt,
  }
}

async function fetchSystems(
  systemIds: number[]
): Promise<Map<number, { name: string; securityStatus: number }>> {
  const unique = [...new Set(systemIds)]
  const entries = await Promise.all(
    unique.map(async (systemId) => {
      try {
        const { data } = await esiFetch<{ name: string; security_status: number }>(
          `/universe/systems/${systemId}/`,
          { revalidate: 86400 }
        )
        return [
          systemId,
          { name: data.name, securityStatus: data.security_status },
        ] as const
      } catch {
        return null
      }
    })
  )

  return new Map(entries.filter((entry): entry is NonNullable<typeof entry> => entry !== null))
}

export async function getMarketSnapshot(options: {
  typeId: number
  regionId?: number | "all"
  orderType?: OrderType
}): Promise<MarketSnapshot> {
  const resource = getResourceById(options.typeId)
  if (!resource) {
    throw new Error(`typeId desconocido: ${options.typeId}`)
  }

  const orderType = options.orderType ?? "all"
  const regionId = options.regionId ?? "all"
  const regions =
    regionId === "all"
      ? MARKET_REGIONS
      : MARKET_REGIONS.filter((region) => region.regionId === regionId)

  if (regions.length === 0) {
    throw new Error(`regionId desconocido: ${String(regionId)}`)
  }

  const regionResults = await Promise.all(
    regions.map(async (region) => {
      const result = await fetchOrdersForRegion(region.regionId, options.typeId, orderType)
      return { regionId: region.regionId, ...result }
    })
  )

  const locationIds: number[] = []
  const systemIds: number[] = []

  for (const result of regionResults) {
    for (const order of result.orders) {
      locationIds.push(order.location_id)
      systemIds.push(order.system_id)
    }
  }

  const [locations, systems] = await Promise.all([
    resolveLocations(locationIds, systemIds),
    fetchSystems(systemIds),
  ])

  const updatedAt =
    regionResults.map((r) => r.updatedAt).sort().at(-1) ?? new Date().toISOString()

  const sellers: MarketOrderRow[] = []
  const buyers: MarketOrderRow[] = []

  for (const result of regionResults) {
    for (const order of result.orders) {
      const location = resolveRowLocation(order, locations, systems)
      const row = toOrderRow(order, result.regionId, result.updatedAt, location)

      if (order.is_buy_order) {
        buyers.push(row)
      } else {
        sellers.push(row)
      }
    }
  }

  sellers.sort((a, b) => a.price - b.price || b.quantity - a.quantity)
  buyers.sort((a, b) => b.price - a.price || b.quantity - a.quantity)

  return {
    typeId: options.typeId,
    typeName: resource.name,
    orderType,
    regionId,
    summary: buildSummary(options.typeId, resource.name, sellers, buyers, updatedAt),
    sellers,
    buyers,
    updatedAt,
  }
}
