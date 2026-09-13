export type Locale = "es" | "en"

export const LOCALES: Locale[] = ["es", "en"]
export const DEFAULT_LOCALE: Locale = "es"
export const LOCALE_STORAGE_KEY = "eve-market-locale"

export function isLocale(value: string | null | undefined): value is Locale {
  return value === "es" || value === "en"
}

export function resolveLocaleFromRequest(request: Request): Locale {
  const { searchParams } = new URL(request.url)
  const fromQuery = searchParams.get("lang")
  if (isLocale(fromQuery)) {
    return fromQuery
  }

  const accept = request.headers.get("accept-language")?.toLowerCase() ?? ""
  if (accept.startsWith("en")) {
    return "en"
  }
  return DEFAULT_LOCALE
}
