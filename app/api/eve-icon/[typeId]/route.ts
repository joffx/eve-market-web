import { NextResponse } from "next/server"

import { eveTypeIconUrl, EVE_TYPE_ICON_CACHE_SIZE } from "@/lib/eve/images"

export const runtime = "nodejs"

/** Browser + CDN: icons never change — cache for 1 year. */
const CACHE_CONTROL =
  "public, max-age=31536000, s-maxage=31536000, immutable, stale-while-revalidate=86400"

type Params = { params: Promise<{ typeId: string }> }

/**
 * Proxies EVE type icons with immutable long-lived cache headers.
 * Next fetch cache keeps one copy on the server so CCP is not hit again.
 */
export async function GET(_request: Request, { params }: Params) {
  const { typeId: raw } = await params
  const typeId = Number(raw)

  if (!Number.isInteger(typeId) || typeId <= 0) {
    return NextResponse.json({ error: "Invalid typeId" }, { status: 400 })
  }

  const upstream = await fetch(eveTypeIconUrl(typeId, EVE_TYPE_ICON_CACHE_SIZE), {
    // Cache forever on the server (icons are immutable).
    cache: "force-cache",
    next: { revalidate: false },
    headers: {
      Accept: "image/png,image/*",
      "User-Agent": "eve-market-web/1.0",
    },
  })

  if (!upstream.ok) {
    return new NextResponse(null, { status: upstream.status === 404 ? 404 : 502 })
  }

  const buffer = await upstream.arrayBuffer()
  const contentType = upstream.headers.get("content-type") ?? "image/png"

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": CACHE_CONTROL,
      "CDN-Cache-Control": CACHE_CONTROL,
      "Vercel-CDN-Cache-Control": CACHE_CONTROL,
    },
  })
}
