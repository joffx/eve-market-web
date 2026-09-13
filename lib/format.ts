import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/locale"
import { translate } from "@/lib/i18n/messages"

const quantityFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
})

const iskFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const iskWholeFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
})

export function formatQuantity(value: number): string {
  return quantityFormatter.format(value)
}

export function formatIsk(value: number): string {
  if (Number.isInteger(value)) {
    return `${iskWholeFormatter.format(value)} ISK`
  }
  return `${iskFormatter.format(value)} ISK`
}

export function formatSecurity(value: number | null): string {
  if (value === null) {
    return "—"
  }
  return value.toFixed(1)
}

export function formatRange(range: string, locale: Locale = DEFAULT_LOCALE): string {
  if (range === "station") return translate(locale, "format.range.station")
  if (range === "solarsystem") return translate(locale, "format.range.solarsystem")
  if (range === "region") return translate(locale, "format.range.region")
  return range
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) {
    return "—"
  }
  return (
    date.toLocaleString("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "UTC",
    }) + " UTC"
  )
}

export function formatRelativeTime(
  iso: string,
  now = Date.now(),
  locale: Locale = DEFAULT_LOCALE
): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) {
    return "—"
  }

  const diffMs = now - date.getTime()
  const past = diffMs >= 0
  const seconds = Math.floor(Math.abs(diffMs) / 1000)

  if (seconds < 10) {
    return translate(locale, past ? "format.relative.momentPast" : "format.relative.momentFuture")
  }
  if (seconds < 60) {
    return translate(locale, past ? "format.relative.secondsPast" : "format.relative.secondsFuture", {
      n: seconds,
    })
  }

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) {
    return translate(locale, past ? "format.relative.minutesPast" : "format.relative.minutesFuture", {
      n: minutes,
    })
  }

  const hours = Math.floor(minutes / 60)
  if (hours < 24) {
    const key =
      hours === 1
        ? past
          ? "format.relative.hourPast"
          : "format.relative.hourFuture"
        : past
          ? "format.relative.hoursPast"
          : "format.relative.hoursFuture"
    return translate(locale, key, { n: hours })
  }

  const days = Math.floor(hours / 24)
  const key =
    days === 1
      ? past
        ? "format.relative.dayPast"
        : "format.relative.dayFuture"
      : past
        ? "format.relative.daysPast"
        : "format.relative.daysFuture"
  return translate(locale, key, { n: days })
}

export function formatLastUpdate(
  iso: string,
  now = Date.now(),
  locale: Locale = DEFAULT_LOCALE
): string {
  return translate(locale, "format.lastUpdate", {
    relative: formatRelativeTime(iso, now, locale),
  })
}

export function formatPercent(value: number | null): string {
  if (value === null) {
    return "—"
  }
  return `${value.toFixed(2)}%`
}
