import { NextResponse } from "next/server"

import { eveTypeRenderUrl } from "@/lib/eve/images"

export const runtime = "nodejs"

const CACHE_CONTROL =
  "public, max-age=31536000, s-maxage=31536000, immutable, stale-while-revalidate=86400"

const RENDER_SIZE = 256 as const

type Params = { params: Promise<{ typeId: string }> }

/** Proxies EVE type renders with immutable long-lived cache headers. */
export async function GET(_request: Request, { params }: Params) {
  const { typeId: raw } = await params
  const typeId = Number(raw)

  if (!Number.isInteger(typeId) || typeId <= 0) {
    return NextResponse.json({ error: "Invalid typeId" }, { status: 400 })
  }

  const upstream = await fetch(eveTypeRenderUrl(typeId, RENDER_SIZE), {
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
