import { getShipById } from "@/data/ships"
import { EsiError, esiFetch } from "@/lib/eve/esi"
import type { Locale } from "@/lib/i18n/locale"

export type ShipStat = {
  id: number
  name: string
  value: number
}

export type ShipDetail = {
  typeId: number
  name: string
  description: string
  groupId: number
  groupName: string
  mass: number
  volume: number
  capacity: number
  packagedVolume: number
  radius: number
  stats: ShipStat[]
}

/** Dogma attribute IDs commonly useful for ships. */
const SHIP_DOGMA_ATTRS: Record<number, string> = {
  37: "Max Velocity",
  9: "Capacitor Capacity",
  55: "Capacitor Recharge Time",
  11: "Powergrid Output",
  48: "CPU Output",
  12: "High Slots",
  13: "Medium Slots",
  14: "Low Slots",
  1154: "Turret Hardpoints",
  1155: "Launcher Hardpoints",
  263: "Armor Hitpoints",
  265: "Structure Hitpoints",
  564: "Shield Capacity",
  552: "Signature Radius",
}

type EsiType = {
  type_id: number
  name: string
  description: string
  group_id: number
  published: boolean
  mass: number
  volume: number
  capacity: number
  packaged_volume: number
  radius: number
  dogma_attributes?: Array<{ attribute_id: number; value: number }>
}

type EsiGroup = {
  group_id: number
  name: string
}

/** Strip ESI showinfo HTML from type descriptions. */
export function stripEveDescriptionHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

export async function fetchShipDetail(
  typeId: number,
  locale: Locale
): Promise<ShipDetail | null> {
  const catalog = getShipById(typeId)
  const language = locale === "es" ? "es" : "en"

  try {
    const { data: type } = await esiFetch<EsiType>(`/universe/types/${typeId}/`, {
      locale,
      revalidate: 86400,
      searchParams: { language },
    })

    if (!type.published) {
      return null
    }

    let groupName = catalog?.groupName ?? ""
    let groupId = catalog?.groupId ?? type.group_id

    if (!groupName) {
      const { data: group } = await esiFetch<EsiGroup>(`/universe/groups/${type.group_id}/`, {
        locale,
        revalidate: 86400,
        searchParams: { language },
      })
      groupName = group.name
      groupId = group.group_id
    }

    const stats: ShipStat[] = []
    for (const attr of type.dogma_attributes ?? []) {
      const name = SHIP_DOGMA_ATTRS[attr.attribute_id]
      if (!name) continue
      stats.push({ id: attr.attribute_id, name, value: attr.value })
    }
    stats.sort((a, b) => a.name.localeCompare(b.name, "en"))

    return {
      typeId: type.type_id,
      name: type.name,
      description: stripEveDescriptionHtml(type.description ?? ""),
      groupId,
      groupName,
      mass: type.mass,
      volume: type.volume,
      capacity: type.capacity,
      packagedVolume: type.packaged_volume,
      radius: type.radius,
      stats,
    }
  } catch (error) {
    if (error instanceof EsiError && error.status === 404) {
      return null
    }
    throw error
  }
}
