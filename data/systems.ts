/**
 * System autocomplete for map / strategy.
 * Full catalog: data/solar-systems.json (ESI /universe/systems + /universe/names).
 * Includes high/low/null-sec (0 and negative security systems).
 */
import solarSystems from "@/data/solar-systems.json"

export type NamedSystem = {
  systemId: number
  name: string
  region?: string
}

type SolarSystemRow = {
  systemId: number
  name: string
}

const ALL_SYSTEMS = solarSystems as SolarSystemRow[]

export const POPULAR_SYSTEMS: NamedSystem[] = [
  { systemId: 30000142, name: "Jita", region: "The Forge" },
  { systemId: 30000144, name: "Perimeter", region: "The Forge" },
  { systemId: 30002187, name: "Amarr", region: "Domain" },
  { systemId: 30002659, name: "Dodixie", region: "Sinq Laison" },
  { systemId: 30002510, name: "Rens", region: "Heimatar" },
  { systemId: 30002053, name: "Hek", region: "Metropolis" },
  { systemId: 30000138, name: "Ikuchi", region: "The Forge" },
  { systemId: 30000139, name: "Urlen", region: "The Forge" },
  { systemId: 30000132, name: "Ansila", region: "The Forge" },
  { systemId: 30000134, name: "Hykkota", region: "The Forge" },
  { systemId: 30002282, name: "Bhizheba", region: "Domain" },
  { systemId: 30002813, name: "Tama", region: "The Citadel" },
  { systemId: 30003787, name: "Agoze", region: "Placid" },
  { systemId: 30003799, name: "Uphallant", region: "Placid" },
  { systemId: 30002537, name: "Amamake", region: "Heimatar" },
  { systemId: 30002718, name: "Rancer", region: "Sinq Laison" },
  { systemId: 30003067, name: "Huola", region: "The Bleak Lands" },
  // Null-sec examples
  { systemId: 30002440, name: "BWF-ZZ" },
  { systemId: 30004759, name: "1DQ1-A" },
]

/** Normalize user input: trim, drop trailing * wildcards, lowercase. */
export function normalizeSystemQuery(query: string): string {
  return query.trim().replace(/\*+$/g, "").toLowerCase()
}

/**
 * Prefix / contains search across all solar systems (high, low, and null-sec).
 */
export function filterSystems(query: string, limit = 15): NamedSystem[] {
  const normalized = normalizeSystemQuery(query)
  if (!normalized) {
    return POPULAR_SYSTEMS.slice(0, limit)
  }

  const startsWith: NamedSystem[] = []
  const includes: NamedSystem[] = []

  for (const system of ALL_SYSTEMS) {
    const name = system.name.toLowerCase()
    if (name.startsWith(normalized)) {
      startsWith.push(system)
      if (startsWith.length >= limit) {
        break
      }
    } else if (name.includes(normalized) && includes.length < limit) {
      includes.push(system)
    }
  }

  if (startsWith.length >= limit) {
    return startsWith.slice(0, limit)
  }

  const byId = new Set(startsWith.map((s) => s.systemId))
  for (const system of includes) {
    if (byId.has(system.systemId)) continue
    startsWith.push(system)
    if (startsWith.length >= limit) break
  }

  return startsWith
}

export function getSystemById(systemId: number): NamedSystem | undefined {
  return ALL_SYSTEMS.find((system) => system.systemId === systemId)
}

export function getSystemByName(name: string): NamedSystem | undefined {
  const normalized = normalizeSystemQuery(name)
  return ALL_SYSTEMS.find((system) => system.name.toLowerCase() === normalized)
}
