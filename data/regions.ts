export type MarketRegion = {
  name: string
  regionId: number
  mainHub: string
  mainStation: string
  mainStationId: number
}

/**
 * Region IDs verified via ESI POST /universe/ids/ (2026-09-12).
 * Main stations verified via GET /universe/stations/{station_id}/.
 */
export const MARKET_REGIONS: MarketRegion[] = [
  {
    name: "The Forge",
    regionId: 10000002,
    mainHub: "Jita",
    mainStation: "Jita IV - Moon 4 - Caldari Navy Assembly Plant",
    mainStationId: 60003760,
  },
  {
    name: "Domain",
    regionId: 10000043,
    mainHub: "Amarr",
    mainStation: "Amarr VIII (Oris) - Emperor Family Academy",
    mainStationId: 60008494,
  },
  {
    name: "Sinq Laison",
    regionId: 10000032,
    mainHub: "Dodixie",
    mainStation: "Dodixie IX - Moon 20 - Federation Navy Assembly Plant",
    mainStationId: 60011866,
  },
  {
    name: "Heimatar",
    regionId: 10000030,
    mainHub: "Rens",
    mainStation: "Rens VI - Moon 8 - Brutor Tribe Treasury",
    mainStationId: 60004588,
  },
  {
    name: "Metropolis",
    regionId: 10000042,
    mainHub: "Hek",
    mainStation: "Hek VIII - Moon 12 - Boundless Creation Factory",
    mainStationId: 60005686,
  },
  {
    name: "Kor-Azor",
    regionId: 10000065,
    mainHub: "Kor-Azor",
    mainStation: "Kor-Azor Prime",
    mainStationId: 0,
  },
  {
    name: "Tash-Murkon",
    regionId: 10000020,
    mainHub: "Tash-Murkon",
    mainStation: "Tash-Murkon Prime",
    mainStationId: 0,
  },
  {
    name: "Khanid",
    regionId: 10000049,
    mainHub: "Khanid",
    mainStation: "Khanid Prime",
    mainStationId: 0,
  },
  {
    name: "The Citadel",
    regionId: 10000033,
    mainHub: "The Citadel",
    mainStation: "Perimeter",
    mainStationId: 0,
  },
]

export const REGION_BY_ID = new Map(
  MARKET_REGIONS.map((region) => [region.regionId, region])
)

export function getRegionById(regionId: number): MarketRegion | undefined {
  return REGION_BY_ID.get(regionId)
}

export function parseRegionId(value: string | null | undefined): number | "all" {
  if (!value || value === "all") {
    return "all"
  }

  const parsed = Number(value)
  if (!Number.isFinite(parsed) || !REGION_BY_ID.has(parsed)) {
    return "all"
  }

  return parsed
}
