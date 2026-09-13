import type { SecurityClass } from "@/lib/eve/route"

export type ResourceCategory = "mineral" | "ore" | "gas"

/**
 * Typical space where the resource is mined/harvested in New Eden.
 * Minerals are refined products (no belt security).
 */
export type ResourceSecurity = SecurityClass | null

export type MarketResource = {
  typeId: number
  name: string
  category: ResourceCategory
  /** Base ore typeId when this entry is a compressed/variant form */
  parentTypeId?: number
  /**
   * Typical security band for mining/harvesting.
   * Based on classic asteroid / gas site distribution (not live belt spawn data).
   */
  typicalSecurity?: ResourceSecurity
  /** Packaged volume in m³ (for earnings estimates). */
  volumeM3?: number
}

/**
 * Type IDs verified via ESI POST /universe/ids/ → inventory_types.
 * Legacy named ore variants (Dense Veldspar, etc.) are no longer present in ESI;
 * compressed ores are the current variants returned by ESI.
 * Gases verified 2026-09-12.
 *
 * typicalSecurity: where the base ore/gas is usually mined (high ≥0.5, low 0.1–0.4, null ≤0.0).
 */
export const MARKET_RESOURCES: MarketResource[] = [
  // Minerals (refined — not mined)
  { typeId: 34, name: "Tritanium", category: "mineral", typicalSecurity: null },
  { typeId: 35, name: "Pyerite", category: "mineral", typicalSecurity: null },
  { typeId: 36, name: "Mexallon", category: "mineral", typicalSecurity: null },
  { typeId: 37, name: "Isogen", category: "mineral", typicalSecurity: null },
  { typeId: 38, name: "Nocxium", category: "mineral", typicalSecurity: null },
  { typeId: 39, name: "Zydrine", category: "mineral", typicalSecurity: null },
  { typeId: 40, name: "Megacyte", category: "mineral", typicalSecurity: null },
  { typeId: 11399, name: "Morphite", category: "mineral", typicalSecurity: null },

  // Base ores — high-sec belts
  { typeId: 1230, name: "Veldspar", category: "ore", typicalSecurity: "high", volumeM3: 0.1 },
  { typeId: 1228, name: "Scordite", category: "ore", typicalSecurity: "high", volumeM3: 0.15 },
  { typeId: 1224, name: "Pyroxeres", category: "ore", typicalSecurity: "high", volumeM3: 0.3 },
  { typeId: 18, name: "Plagioclase", category: "ore", typicalSecurity: "high", volumeM3: 0.35 },
  { typeId: 1227, name: "Omber", category: "ore", typicalSecurity: "high", volumeM3: 0.6 },
  { typeId: 20, name: "Kernite", category: "ore", typicalSecurity: "high", volumeM3: 1.2 },

  // Low-sec belts
  { typeId: 1226, name: "Jaspet", category: "ore", typicalSecurity: "low", volumeM3: 2 },
  { typeId: 1231, name: "Hemorphite", category: "ore", typicalSecurity: "low", volumeM3: 3 },
  { typeId: 21, name: "Hedbergite", category: "ore", typicalSecurity: "low", volumeM3: 3 },
  { typeId: 1229, name: "Gneiss", category: "ore", typicalSecurity: "low", volumeM3: 5 },
  { typeId: 1232, name: "Dark Ochre", category: "ore", typicalSecurity: "low", volumeM3: 8 },

  // Null-sec belts
  { typeId: 1225, name: "Crokite", category: "ore", typicalSecurity: "null", volumeM3: 16 },
  { typeId: 1223, name: "Bistot", category: "ore", typicalSecurity: "null", volumeM3: 16 },
  { typeId: 22, name: "Arkonor", category: "ore", typicalSecurity: "null", volumeM3: 16 },
  { typeId: 11396, name: "Mercoxit", category: "ore", typicalSecurity: "null", volumeM3: 40 },

  // Compressed ore variants (inherit parent security via helper)
  { typeId: 62516, name: "Compressed Veldspar", category: "ore", parentTypeId: 1230 },
  { typeId: 62520, name: "Compressed Scordite", category: "ore", parentTypeId: 1228 },
  { typeId: 62524, name: "Compressed Pyroxeres", category: "ore", parentTypeId: 1224 },
  { typeId: 62528, name: "Compressed Plagioclase", category: "ore", parentTypeId: 18 },
  { typeId: 62532, name: "Compressed Omber", category: "ore", parentTypeId: 1227 },
  { typeId: 62536, name: "Compressed Kernite", category: "ore", parentTypeId: 20 },
  { typeId: 62540, name: "Compressed Jaspet", category: "ore", parentTypeId: 1226 },
  { typeId: 62544, name: "Compressed Hemorphite", category: "ore", parentTypeId: 1231 },
  { typeId: 62548, name: "Compressed Hedbergite", category: "ore", parentTypeId: 21 },
  { typeId: 62552, name: "Compressed Gneiss", category: "ore", parentTypeId: 1229 },
  { typeId: 62556, name: "Compressed Dark Ochre", category: "ore", parentTypeId: 1232 },
  { typeId: 62560, name: "Compressed Crokite", category: "ore", parentTypeId: 1225 },
  { typeId: 62564, name: "Compressed Bistot", category: "ore", parentTypeId: 1223 },
  { typeId: 62568, name: "Compressed Arkonor", category: "ore", parentTypeId: 22 },
  { typeId: 62586, name: "Compressed Mercoxit", category: "ore", parentTypeId: 11396 },

  // Harvestable gases (Fullerite) — wormhole / null sites
  { typeId: 30375, name: "Fullerite-C28", category: "gas", typicalSecurity: "null", volumeM3: 2 },
  { typeId: 30376, name: "Fullerite-C32", category: "gas", typicalSecurity: "null", volumeM3: 5 },
  { typeId: 30370, name: "Fullerite-C50", category: "gas", typicalSecurity: "null", volumeM3: 1 },
  { typeId: 30371, name: "Fullerite-C60", category: "gas", typicalSecurity: "null", volumeM3: 1 },
  { typeId: 30372, name: "Fullerite-C70", category: "gas", typicalSecurity: "null", volumeM3: 1 },
  { typeId: 30373, name: "Fullerite-C72", category: "gas", typicalSecurity: "null", volumeM3: 2 },
  { typeId: 30374, name: "Fullerite-C84", category: "gas", typicalSecurity: "null", volumeM3: 2 },
  { typeId: 30377, name: "Fullerite-C320", category: "gas", typicalSecurity: "null", volumeM3: 5 },
  { typeId: 30378, name: "Fullerite-C540", category: "gas", typicalSecurity: "null", volumeM3: 10 },
]

export const RESOURCE_BY_ID = new Map(
  MARKET_RESOURCES.map((resource) => [resource.typeId, resource])
)

export const BASE_RESOURCES = MARKET_RESOURCES.filter(
  (resource) => resource.parentTypeId === undefined
)

export function getResourceById(typeId: number): MarketResource | undefined {
  return RESOURCE_BY_ID.get(typeId)
}

/** Resolves typical mining security, following parentTypeId for compressed variants. */
export function getResourceSecurity(typeId: number): ResourceSecurity {
  const resource = RESOURCE_BY_ID.get(typeId)
  if (!resource) return null
  if (resource.typicalSecurity !== undefined) {
    return resource.typicalSecurity
  }
  if (resource.parentTypeId !== undefined) {
    return getResourceSecurity(resource.parentTypeId)
  }
  return null
}

/** Packaged m³ per unit (follows parent for compressed ores). */
export function getResourceVolumeM3(typeId: number): number | null {
  const resource = RESOURCE_BY_ID.get(typeId)
  if (!resource) return null
  if (resource.volumeM3 !== undefined) return resource.volumeM3
  if (resource.parentTypeId !== undefined) {
    return getResourceVolumeM3(resource.parentTypeId)
  }
  return null
}

export function searchResources(query: string): MarketResource[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) {
    return BASE_RESOURCES
  }

  return MARKET_RESOURCES.filter((resource) =>
    resource.name.toLowerCase().includes(normalized)
  )
}
