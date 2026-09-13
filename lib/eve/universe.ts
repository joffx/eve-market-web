import { esiFetch, isStructureLocation } from "@/lib/eve/esi"

export type EsiStation = {
  station_id: number
  name: string
  system_id: number
}

export type EsiSolarSystem = {
  system_id: number
  name: string
  security_status: number
}

export type LocationInfo = {
  locationId: number
  name: string
  systemId: number | null
  systemName: string | null
  securityStatus: number | null
  isStructure: boolean
}

const UNKNOWN_STRUCTURE = "Estructura de jugador desconocida"

async function getStation(stationId: number): Promise<EsiStation | null> {
  try {
    const { data } = await esiFetch<EsiStation>(`/universe/stations/${stationId}/`, {
      revalidate: 86400,
    })
    return data
  } catch {
    return null
  }
}

async function getSystem(systemId: number): Promise<EsiSolarSystem | null> {
  try {
    const { data } = await esiFetch<EsiSolarSystem>(`/universe/systems/${systemId}/`, {
      revalidate: 86400,
    })
    return data
  } catch {
    return null
  }
}

function unknownStructure(locationId: number): LocationInfo {
  return {
    locationId,
    name: UNKNOWN_STRUCTURE,
    systemId: null,
    systemName: null,
    securityStatus: null,
    isStructure: true,
  }
}

export async function resolveLocations(
  locationIds: number[],
  systemIds: number[]
): Promise<Map<number, LocationInfo>> {
  const uniqueLocations = [...new Set(locationIds)]
  const uniqueSystems = [...new Set(systemIds)]

  const systemEntries = await Promise.all(
    uniqueSystems.map(async (systemId) => {
      const system = await getSystem(systemId)
      return [systemId, system] as const
    })
  )
  const systems = new Map(systemEntries)

  const result = new Map<number, LocationInfo>()

  await Promise.all(
    uniqueLocations.map(async (locationId) => {
      if (isStructureLocation(locationId)) {
        result.set(locationId, unknownStructure(locationId))
        return
      }

      const station = await getStation(locationId)
      if (!station) {
        result.set(locationId, unknownStructure(locationId))
        return
      }

      const system = systems.get(station.system_id) ?? (await getSystem(station.system_id))

      result.set(locationId, {
        locationId,
        name: station.name,
        systemId: station.system_id,
        systemName: system?.name ?? null,
        securityStatus: system?.security_status ?? null,
        isStructure: false,
      })
    })
  )

  return result
}
