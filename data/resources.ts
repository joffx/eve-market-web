export type ResourceCategory = "mineral" | "ore" | "gas"

export type MarketResource = {
  typeId: number
  name: string
  category: ResourceCategory
  /** Base ore typeId when this entry is a compressed/variant form */
  parentTypeId?: number
}

/**
 * Type IDs verified via ESI POST /universe/ids/ → inventory_types.
 * Legacy named ore variants (Dense Veldspar, etc.) are no longer present in ESI;
 * compressed ores are the current variants returned by ESI.
 * Gases verified 2026-09-12.
 */
export const MARKET_RESOURCES: MarketResource[] = [
  // Minerals
  { typeId: 34, name: "Tritanium", category: "mineral" },
  { typeId: 35, name: "Pyerite", category: "mineral" },
  { typeId: 36, name: "Mexallon", category: "mineral" },
  { typeId: 37, name: "Isogen", category: "mineral" },
  { typeId: 38, name: "Nocxium", category: "mineral" },
  { typeId: 39, name: "Zydrine", category: "mineral" },
  { typeId: 40, name: "Megacyte", category: "mineral" },
  { typeId: 11399, name: "Morphite", category: "mineral" },

  // Base ores
  { typeId: 1230, name: "Veldspar", category: "ore" },
  { typeId: 1228, name: "Scordite", category: "ore" },
  { typeId: 1224, name: "Pyroxeres", category: "ore" },
  { typeId: 18, name: "Plagioclase", category: "ore" },
  { typeId: 1227, name: "Omber", category: "ore" },
  { typeId: 20, name: "Kernite", category: "ore" },
  { typeId: 1226, name: "Jaspet", category: "ore" },
  { typeId: 1231, name: "Hemorphite", category: "ore" },
  { typeId: 21, name: "Hedbergite", category: "ore" },
  { typeId: 1229, name: "Gneiss", category: "ore" },
  { typeId: 1232, name: "Dark Ochre", category: "ore" },
  { typeId: 1225, name: "Crokite", category: "ore" },
  { typeId: 1223, name: "Bistot", category: "ore" },
  { typeId: 22, name: "Arkonor", category: "ore" },
  { typeId: 11396, name: "Mercoxit", category: "ore" },

  // Compressed ore variants (verified inventory_types)
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

  // Harvestable gases (Fullerite)
  { typeId: 30375, name: "Fullerite-C28", category: "gas" },
  { typeId: 30376, name: "Fullerite-C32", category: "gas" },
  { typeId: 30370, name: "Fullerite-C50", category: "gas" },
  { typeId: 30371, name: "Fullerite-C60", category: "gas" },
  { typeId: 30372, name: "Fullerite-C70", category: "gas" },
  { typeId: 30373, name: "Fullerite-C72", category: "gas" },
  { typeId: 30374, name: "Fullerite-C84", category: "gas" },
  { typeId: 30377, name: "Fullerite-C320", category: "gas" },
  { typeId: 30378, name: "Fullerite-C540", category: "gas" },
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

export function searchResources(query: string): MarketResource[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) {
    return BASE_RESOURCES
  }

  return MARKET_RESOURCES.filter((resource) =>
    resource.name.toLowerCase().includes(normalized)
  )
}
