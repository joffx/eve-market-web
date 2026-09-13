import { STRATEGY_HUB_REGION_IDS, MINING_SYSTEM_CANDIDATES } from "@/data/mining-systems"
import { MARKET_REGIONS } from "@/data/regions"
import { getResourceById, getResourceSecurity } from "@/data/resources"
import { esiFetch, isStructureLocation } from "@/lib/eve/esi"
import { classifySecurity, getSystemDetails, type SystemDetails } from "@/lib/eve/route"
import type { EsiMarketOrder } from "@/types/market"

export type StrategyBuyHub = {
  rank: number
  recommended: boolean
  regionId: number
  regionName: string
  hubName: string
  bestPrice: number
  buyVolume: number
  orderCount: number
  locationId: number
  locationName: string
  systemId: number
  systemName: string
}

export type StrategyBuyersSnapshot = {
  typeId: number
  typeName: string
  best: StrategyBuyHub | null
  hubs: StrategyBuyHub[]
  updatedAt: string
}

export type StrategyMineSite = {
  rank: number
  systemId: number
  name: string
  securityStatus: number
  securityClass: "high" | "low" | "null"
  /** null when origin was not provided yet */
  jumpsFromOrigin: number | null
  jumpsToMarket: number
  totalJumps: number
}

export type StrategyMinesSnapshot = {
  typeId: number
  typeName: string
  origin: SystemDetails | null
  sellSystem: SystemDetails
  sites: StrategyMineSite[]
  updatedAt: string
}

const ROUTE_CACHE = new Map<string, number>()

const STRATEGY_HUB_REGIONS = MARKET_REGIONS.filter((region) =>
  (STRATEGY_HUB_REGION_IDS as readonly number[]).includes(region.regionId)
)

async function getRouteJumps(originId: number, destinationId: number): Promise<number> {
  if (originId === destinationId) {
    return 0
  }
  const key = `${originId}->${destinationId}`
  const cached = ROUTE_CACHE.get(key)
  if (cached !== undefined) {
    return cached
  }

  try {
    const { data } = await esiFetch<number[]>(`/latest/route/${originId}/${destinationId}/`, {
      searchParams: { flag: "secure" },
      revalidate: 3600,
    })
    const jumps = Math.max(data.length - 1, 0)
    ROUTE_CACHE.set(key, jumps)
    return jumps
  } catch {
    try {
      const { data } = await esiFetch<number[]>(`/latest/route/${originId}/${destinationId}/`, {
        searchParams: { flag: "shortest" },
        revalidate: 3600,
      })
      const jumps = Math.max(data.length - 1, 0)
      ROUTE_CACHE.set(key, jumps)
      return jumps
    } catch {
      ROUTE_CACHE.set(key, 99)
      return 99
    }
  }
}

async function fetchBuyOrders(regionId: number, typeId: number): Promise<EsiMarketOrder[]> {
  const first = await esiFetch<EsiMarketOrder[]>(`/markets/${regionId}/orders/`, {
    searchParams: {
      order_type: "buy",
      type_id: typeId,
      page: 1,
    },
    revalidate: 300,
  })

  const orders = [...first.data]
  const totalPages = Math.min(first.pages, 3)

  if (totalPages > 1) {
    const remaining = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, index) =>
        esiFetch<EsiMarketOrder[]>(`/markets/${regionId}/orders/`, {
          searchParams: {
            order_type: "buy",
            type_id: typeId,
            page: index + 2,
          },
          revalidate: 300,
        })
      )
    )
    for (const page of remaining) {
      orders.push(...page.data)
    }
  }

  return orders.filter((order) => order.is_buy_order)
}

async function resolveStationName(
  locationId: number,
  systemId: number
): Promise<{ name: string; systemName: string }> {
  if (isStructureLocation(locationId)) {
    const system = await getSystemDetails(systemId)
    return { name: `${system.name} (structure)`, systemName: system.name }
  }

  try {
    const { data } = await esiFetch<{ name: string; system_id: number }>(
      `/universe/stations/${locationId}/`,
      { revalidate: 86400 }
    )
    const system = await getSystemDetails(data.system_id)
    return { name: data.name, systemName: system.name }
  } catch {
    const system = await getSystemDetails(systemId)
    return { name: system.name, systemName: system.name }
  }
}

/** Buy hubs ranked by best buy price for a single type. */
export async function getBuyHubsForType(typeId: number): Promise<StrategyBuyersSnapshot> {
  const resource = getResourceById(typeId)
  const typeName = resource?.name ?? `Type ${typeId}`

  const regionResults = await Promise.all(
    STRATEGY_HUB_REGIONS.map(async (region) => {
      try {
        const orders = await fetchBuyOrders(region.regionId, typeId)
        return { region, orders }
      } catch {
        return { region, orders: [] as EsiMarketOrder[] }
      }
    })
  )

  const hubsRaw = await Promise.all(
    regionResults.map(async ({ region, orders }) => {
      if (orders.length === 0) {
        return null
      }

      let best = orders[0]
      let buyVolume = 0
      for (const order of orders) {
        buyVolume += order.volume_remain
        if (order.price > best.price) {
          best = order
        }
      }

      const location = await resolveStationName(best.location_id, best.system_id)

      return {
        regionId: region.regionId,
        regionName: region.name,
        hubName: region.mainHub,
        bestPrice: best.price,
        buyVolume,
        orderCount: orders.length,
        locationId: best.location_id,
        locationName: location.name,
        systemId: best.system_id,
        systemName: location.systemName,
      }
    })
  )

  const hubs = hubsRaw
    .filter((hub): hub is NonNullable<typeof hub> => hub !== null)
    .sort((a, b) => b.bestPrice - a.bestPrice)
    .map((hub, index) => ({
      ...hub,
      rank: index + 1,
      recommended: index === 0,
    }))

  return {
    typeId,
    typeName,
    best: hubs[0] ?? null,
    hubs,
    updatedAt: new Date().toISOString(),
  }
}

/** Mining candidate systems ranked by jumps to sell hub (and from origin when known). */
export async function getMineSitesForPlan(options: {
  typeId: number
  sellSystemId: number
  originSystemId?: number | null
  limit?: number
}): Promise<StrategyMinesSnapshot> {
  const limit = options.limit ?? 5
  const resource = getResourceById(options.typeId)
  const typeName = resource?.name ?? `Type ${options.typeId}`
  const requiredSecurity = getResourceSecurity(options.typeId)

  const sellSystem = await getSystemDetails(options.sellSystemId)
  const origin =
    options.originSystemId != null
      ? await getSystemDetails(options.originSystemId)
      : null

  // Only suggest systems in the same security band as the ore/gas (e.g. Hedbergite → low-sec).
  const bandCandidates =
    requiredSecurity == null
      ? MINING_SYSTEM_CANDIDATES
      : MINING_SYSTEM_CANDIDATES.filter((c) => c.securityClass === requiredSecurity)

  const candidateDetails = await Promise.all(
    bandCandidates.map(async (candidate) => {
      const details = await getSystemDetails(candidate.systemId)
      return { ...candidate, details }
    })
  )

  const pool = candidateDetails.filter((c) => {
    if (requiredSecurity == null) return true
    return classifySecurity(c.details.securityStatus) === requiredSecurity
  })

  const scored = await Promise.all(
    pool.map(async (mine) => {
      const jumpsToMarket = await getRouteJumps(mine.systemId, sellSystem.systemId)
      const jumpsFromOrigin =
        origin != null ? await getRouteJumps(origin.systemId, mine.systemId) : null

      const totalJumps =
        jumpsFromOrigin != null ? jumpsFromOrigin + jumpsToMarket : jumpsToMarket

      return {
        systemId: mine.systemId,
        name: mine.name,
        securityStatus: mine.details.securityStatus,
        securityClass: mine.details.securityClass,
        jumpsFromOrigin,
        jumpsToMarket,
        totalJumps,
      }
    })
  )

  const reachable = scored.filter((site) => {
    if (site.jumpsToMarket >= 99) return false
    if (site.jumpsFromOrigin != null && site.jumpsFromOrigin >= 99) return false
    return true
  })

  reachable.sort((a, b) => {
    if (a.totalJumps !== b.totalJumps) {
      return a.totalJumps - b.totalJumps
    }
    // Prefer systems closer to the typical mid of the band (e.g. ~0.2 for low)
    if (requiredSecurity === "low") {
      return Math.abs(a.securityStatus - 0.25) - Math.abs(b.securityStatus - 0.25)
    }
    return b.securityStatus - a.securityStatus
  })

  const sites = reachable.slice(0, limit).map((site, index) => ({
    ...site,
    rank: index + 1,
  }))

  return {
    typeId: options.typeId,
    typeName,
    origin,
    sellSystem,
    sites,
    updatedAt: new Date().toISOString(),
  }
}

export function parsePositiveInt(value: string | null): number | null {
  if (!value) return null
  const n = Number(value)
  if (!Number.isInteger(n) || n <= 0) return null
  return n
}

/** @deprecated unused after wizard refactor */
export type StrategyMode = "safer" | "profitable" | "closest"

export function assertKnownTypeId(typeId: number): boolean {
  return getResourceById(typeId) !== undefined
}
