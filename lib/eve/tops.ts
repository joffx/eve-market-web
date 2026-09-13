import { MARKET_RESOURCES, type ResourceCategory } from "@/data/resources"
import { esiFetch } from "@/lib/eve/esi"

export type TopItem = {
  rank: number
  typeId: number
  name: string
  category: ResourceCategory
  averagePrice: number
  adjustedPrice: number | null
}

export type TopsSnapshot = {
  minerals: TopItem[]
  ores: TopItem[]
  gases: TopItem[]
  updatedAt: string
}

type EsiMarketPrice = {
  type_id: number
  average_price?: number
  adjusted_price?: number
}

function rankCategory(
  category: ResourceCategory,
  priceByType: Map<number, EsiMarketPrice>,
  limit: number,
  options?: { baseOnly?: boolean }
): TopItem[] {
  const resources = MARKET_RESOURCES.filter((resource) => {
    if (resource.category !== category) {
      return false
    }
    if (options?.baseOnly && resource.parentTypeId !== undefined) {
      return false
    }
    return true
  })

  const ranked = resources
    .map((resource) => {
      const price = priceByType.get(resource.typeId)
      const averagePrice = price?.average_price
      if (averagePrice === undefined || !Number.isFinite(averagePrice)) {
        return null
      }
      return {
        typeId: resource.typeId,
        name: resource.name,
        category: resource.category,
        averagePrice,
        adjustedPrice: price?.adjusted_price ?? null,
      }
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => b.averagePrice - a.averagePrice)
    .slice(0, limit)
    .map((item, index) => ({ ...item, rank: index + 1 }))

  return ranked
}

export async function getTopsSnapshot(limit = 10): Promise<TopsSnapshot> {
  const { data, lastModified } = await esiFetch<EsiMarketPrice[]>("/markets/prices/", {
    revalidate: 300,
  })

  const priceByType = new Map(data.map((entry) => [entry.type_id, entry]))

  return {
    minerals: rankCategory("mineral", priceByType, limit),
    ores: rankCategory("ore", priceByType, limit, { baseOnly: true }),
    gases: rankCategory("gas", priceByType, limit),
    updatedAt: lastModified
      ? new Date(lastModified).toISOString()
      : new Date().toISOString(),
  }
}
