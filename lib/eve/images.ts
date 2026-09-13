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
