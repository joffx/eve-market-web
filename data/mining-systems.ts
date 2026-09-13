import type { SecurityClass } from "@/lib/eve/route"

/**
 * Mining location candidates by security band.
 * System IDs verified via ESI /universe/ids/ + /universe/systems/{id}/.
 * Filtered at runtime by the resource's typicalSecurity (ore/gas spawn band).
 */
export type MiningSystemCandidate = {
  systemId: number
  name: string
  /** Nearest major trade hub system */
  hubSystemId: number
  hubName: string
  /** Expected security class for this candidate */
  securityClass: SecurityClass
}

export const MINING_SYSTEM_CANDIDATES: MiningSystemCandidate[] = [
  // High-sec — The Forge / Jita
  { systemId: 30000142, name: "Jita", hubSystemId: 30000142, hubName: "Jita", securityClass: "high" },
  { systemId: 30000144, name: "Perimeter", hubSystemId: 30000142, hubName: "Jita", securityClass: "high" },
  { systemId: 30000139, name: "Urlen", hubSystemId: 30000142, hubName: "Jita", securityClass: "high" },
  { systemId: 30000138, name: "Ikuchi", hubSystemId: 30000142, hubName: "Jita", securityClass: "high" },
  { systemId: 30000132, name: "Ansila", hubSystemId: 30000142, hubName: "Jita", securityClass: "high" },
  { systemId: 30000134, name: "Hykkota", hubSystemId: 30000142, hubName: "Jita", securityClass: "high" },
  // High-sec — Domain / Amarr
  { systemId: 30002187, name: "Amarr", hubSystemId: 30002187, hubName: "Amarr", securityClass: "high" },
  { systemId: 30002282, name: "Bhizheba", hubSystemId: 30002187, hubName: "Amarr", securityClass: "high" },
  // High-sec — other hubs
  { systemId: 30002659, name: "Dodixie", hubSystemId: 30002659, hubName: "Dodixie", securityClass: "high" },
  { systemId: 30002510, name: "Rens", hubSystemId: 30002510, hubName: "Rens", securityClass: "high" },
  { systemId: 30002053, name: "Hek", hubSystemId: 30002053, hubName: "Hek", securityClass: "high" },

  // Low-sec — near Jita / Black Rise / Placid (~0.2–0.4; Hedbergite/Jaspet belts)
  { systemId: 30002813, name: "Tama", hubSystemId: 30000142, hubName: "Jita", securityClass: "low" },
  { systemId: 30002718, name: "Rancer", hubSystemId: 30000142, hubName: "Jita", securityClass: "low" },
  { systemId: 30002756, name: "Ishomilken", hubSystemId: 30000142, hubName: "Jita", securityClass: "low" },
  { systemId: 30002809, name: "Sujarento", hubSystemId: 30000142, hubName: "Jita", securityClass: "low" },
  { systemId: 30003787, name: "Agoze", hubSystemId: 30000142, hubName: "Jita", securityClass: "low" },
  { systemId: 30003799, name: "Uphallant", hubSystemId: 30000142, hubName: "Jita", securityClass: "low" },
  // Low-sec — near Amarr / Rens / Hek
  { systemId: 30002537, name: "Amamake", hubSystemId: 30002510, hubName: "Rens", securityClass: "low" },
  { systemId: 30002693, name: "Egghelende", hubSystemId: 30002659, hubName: "Dodixie", securityClass: "low" },
  { systemId: 30005000, name: "Old Man Star", hubSystemId: 30002659, hubName: "Dodixie", securityClass: "low" },
  { systemId: 30003067, name: "Huola", hubSystemId: 30002187, hubName: "Amarr", securityClass: "low" },
  { systemId: 30003086, name: "Sahtogas", hubSystemId: 30002187, hubName: "Amarr", securityClass: "low" },
  { systemId: 30002059, name: "Auner", hubSystemId: 30002053, hubName: "Hek", securityClass: "low" },
  { systemId: 30000205, name: "Obe", hubSystemId: 30000142, hubName: "Jita", securityClass: "low" },
  { systemId: 30000075, name: "Assah", hubSystemId: 30002187, hubName: "Amarr", securityClass: "low" },

  // Null-sec — rare ores / gases (candidates near empire edges)
  { systemId: 30002440, name: "BWF-ZZ", hubSystemId: 30002510, hubName: "Rens", securityClass: "null" },
  { systemId: 30002423, name: "FDZ4-A", hubSystemId: 30002510, hubName: "Rens", securityClass: "null" },
  { systemId: 30001198, name: "GE-8JV", hubSystemId: 30002187, hubName: "Amarr", securityClass: "null" },
  { systemId: 30003707, name: "9UY4-H", hubSystemId: 30002187, hubName: "Amarr", securityClass: "null" },
  { systemId: 30000772, name: "C-J6MT", hubSystemId: 30000142, hubName: "Jita", securityClass: "null" },
  { systemId: 30004626, name: "D4KU-5", hubSystemId: 30002053, hubName: "Hek", securityClass: "null" },
  { systemId: 30001984, name: "EC-P8R", hubSystemId: 30002659, hubName: "Dodixie", securityClass: "null" },
  { systemId: 30002904, name: "VFK-IV", hubSystemId: 30000142, hubName: "Jita", securityClass: "null" },
]

/** Major hub regions for buy-order scans (keeps ESI load bounded). */
export const STRATEGY_HUB_REGION_IDS = [
  10000002, // The Forge
  10000043, // Domain
  10000032, // Sinq Laison
  10000030, // Heimatar
  10000042, // Metropolis
] as const
