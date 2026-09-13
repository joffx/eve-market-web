import shipsCatalog from "@/data/ships-catalog.json"

export type ShipCatalogEntry = {
  typeId: number
  name: string
  groupId: number
  groupName: string
}

const ALL_SHIPS = shipsCatalog as ShipCatalogEntry[]

export function getAllShips(): ShipCatalogEntry[] {
  return ALL_SHIPS
}

export function getShipById(typeId: number): ShipCatalogEntry | undefined {
  return ALL_SHIPS.find((ship) => ship.typeId === typeId)
}

export function getShipGroups(): string[] {
  return [...new Set(ALL_SHIPS.map((ship) => ship.groupName))].sort((a, b) =>
    a.localeCompare(b, "en")
  )
}

export function filterShips(
  query: string,
  groupName: string | null,
  limit = 500
): ShipCatalogEntry[] {
  const normalized = query.trim().toLowerCase()
  const results: ShipCatalogEntry[] = []

  for (const ship of ALL_SHIPS) {
    if (groupName && ship.groupName !== groupName) continue
    if (normalized) {
      const hay = `${ship.name} ${ship.groupName}`.toLowerCase()
      if (!hay.includes(normalized)) continue
    }
    results.push(ship)
    if (results.length >= limit) break
  }

  return results
}
