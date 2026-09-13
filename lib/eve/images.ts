/** Official EVE Image Service (types icons). */
export const EVE_IMAGE_BASE = "https://images.evetech.net"

/** Always request 64px from CCP so server cache keys stay stable. */
export const EVE_TYPE_ICON_CACHE_SIZE = 64 as const

export type EveTypeImageSize = 32 | 64 | 128 | 256

export function eveTypeIconUrl(
  typeId: number,
  size: EveTypeImageSize = EVE_TYPE_ICON_CACHE_SIZE
): string {
  return `${EVE_IMAGE_BASE}/types/${typeId}/icon?size=${size}`
}

/** Same-origin proxy with 1y immutable Cache-Control (see /api/eve-icon). */
export function localTypeIconUrl(typeId: number): string {
  return `/api/eve-icon/${typeId}`
}

/** Official EVE type render (ships look best at 256–512). */
export function eveTypeRenderUrl(
  typeId: number,
  size: EveTypeImageSize = 256
): string {
  return `${EVE_IMAGE_BASE}/types/${typeId}/render?size=${size}`
}

/** Same-origin proxy for ship renders (see /api/eve-render). */
export function localTypeRenderUrl(typeId: number): string {
  return `/api/eve-render/${typeId}`
}
