import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/locale"
import { translate } from "@/lib/i18n/messages"

const ESI_BASE_URL = "https://esi.evetech.net"
const ESI_USER_AGENT = "eve-market-web/1.0 (EVE Mining Market)"
/** Pin API behavior; market routes remain offset-paginated (X-Pages). */
const ESI_COMPATIBILITY_DATE = "2025-09-30"
const ESI_REVALIDATE_SECONDS = 300
const STRUCTURE_ID_THRESHOLD = 1_000_000_000_000

export class EsiError extends Error {
  readonly status: number
  readonly retryAfterSeconds: number | null

  constructor(message: string, status: number, retryAfterSeconds: number | null = null) {
    super(message)
    this.name = "EsiError"
    this.status = status
    this.retryAfterSeconds = retryAfterSeconds
  }
}

export type EsiFetchResult<T> = {
  data: T
  pages: number
  etag: string | null
  expires: string | null
  lastModified: string | null
}

function buildHeaders(extra?: HeadersInit): Headers {
  const headers = new Headers(extra)
  headers.set("Accept", "application/json")
  headers.set("User-Agent", ESI_USER_AGENT)
  headers.set("X-Compatibility-Date", ESI_COMPATIBILITY_DATE)
  return headers
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function isStructureLocation(locationId: number): boolean {
  return locationId >= STRUCTURE_ID_THRESHOLD
}

export async function esiFetch<T>(
  path: string,
  init?: RequestInit & {
    searchParams?: Record<string, string | number | undefined>
    revalidate?: number
    locale?: Locale
  }
): Promise<EsiFetchResult<T>> {
  const locale = init?.locale ?? DEFAULT_LOCALE
  const url = new URL(path.startsWith("http") ? path : `${ESI_BASE_URL}${path}`)

  if (init?.searchParams) {
    for (const [key, value] of Object.entries(init.searchParams)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value))
      }
    }
  }

  const revalidate = init?.revalidate ?? ESI_REVALIDATE_SECONDS
  const maxAttempts = 3
  let lastError: unknown

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        method: init?.method ?? "GET",
        headers: buildHeaders(init?.headers),
        body: init?.body,
        next: { revalidate },
      })

      if (response.status === 420 || response.status === 429) {
        const retryAfterHeader = response.headers.get("Retry-After")
        const retryAfterSeconds = retryAfterHeader ? Number(retryAfterHeader) : 1
        if (attempt < maxAttempts) {
          await sleep(Math.max(retryAfterSeconds, 1) * 1000)
          continue
        }
        throw new EsiError(translate(locale, "api.esiRateLimit"), response.status, retryAfterSeconds)
      }

      if (response.status === 404) {
        throw new EsiError(translate(locale, "api.esiNotFound"), 404)
      }

      if (!response.ok) {
        const body = await response.text()
        throw new EsiError(
          body
            ? translate(locale, "api.esiErrorWithBody", { status: response.status, body })
            : translate(locale, "api.esiRequestFailed", { status: response.status }),
          response.status
        )
      }

      const pagesHeader = response.headers.get("X-Pages")
      const pages = pagesHeader ? Number(pagesHeader) : 1

      return {
        data: (await response.json()) as T,
        pages: Number.isFinite(pages) && pages > 0 ? pages : 1,
        etag: response.headers.get("ETag"),
        expires: response.headers.get("Expires"),
        lastModified: response.headers.get("Last-Modified"),
      }
    } catch (error) {
      lastError = error
      if (error instanceof EsiError && error.status !== 420 && error.status !== 429) {
        throw error
      }
      if (attempt < maxAttempts) {
        await sleep(250 * attempt)
        continue
      }
    }
  }

  if (lastError instanceof Error) {
    throw lastError
  }
  throw new EsiError(translate(locale, "api.esiUnknown"), 500)
}

export async function esiPost<T>(
  path: string,
  body: unknown,
  locale: Locale = DEFAULT_LOCALE
): Promise<T> {
  const result = await esiFetch<T>(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    revalidate: 3600,
    locale,
  })
  return result.data
}

export { ESI_REVALIDATE_SECONDS }
