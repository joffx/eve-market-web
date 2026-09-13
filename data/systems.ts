/**
 * Common systems for origin/destination autocomplete.
 * Names/IDs verified via ESI /universe/systems/{id}/ and /universe/ids/.
 */
export type NamedSystem = {
  systemId: number
  name: string
  region?: string
}

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
  // Low-sec mining picks
  { systemId: 30002813, name: "Tama", region: "The Citadel" },
  { systemId: 30003787, name: "Agoze", region: "Placid" },
  { systemId: 30003799, name: "Uphallant", region: "Placid" },
  { systemId: 30002537, name: "Amamake", region: "Heimatar" },
  { systemId: 30002718, name: "Rancer", region: "Sinq Laison" },
  { systemId: 30003067, name: "Huola", region: "The Bleak Lands" },
]

export function filterSystems(query: string, limit = 12): NamedSystem[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) {
    return POPULAR_SYSTEMS.slice(0, limit)
  }

  const startsWith: NamedSystem[] = []
  const includes: NamedSystem[] = []

  for (const system of POPULAR_SYSTEMS) {
    const name = system.name.toLowerCase()
    if (name.startsWith(normalized)) {
      startsWith.push(system)
    } else if (name.includes(normalized)) {
      includes.push(system)
    }
  }

  return [...startsWith, ...includes].slice(0, limit)
}
