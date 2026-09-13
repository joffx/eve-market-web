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

export function formatRange(range: string): string {
  if (range === "station") return "Estación"
  if (range === "solarsystem") return "Sistema"
  if (range === "region") return "Región"
  return range
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) {
    return "—"
  }
  return date.toLocaleString("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }) + " UTC"
}

/** Relative time in Spanish, e.g. "hace 5 min", "hace 2 horas". */
export function formatRelativeTime(iso: string, now = Date.now()): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) {
    return "—"
  }

  const diffMs = now - date.getTime()
  const past = diffMs >= 0
  const seconds = Math.floor(Math.abs(diffMs) / 1000)

  if (seconds < 10) {
    return past ? "hace un momento" : "en un momento"
  }
  if (seconds < 60) {
    return past ? `hace ${seconds} s` : `en ${seconds} s`
  }

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) {
    const label = minutes === 1 ? "min" : "min"
    return past ? `hace ${minutes} ${label}` : `en ${minutes} ${label}`
  }

  const hours = Math.floor(minutes / 60)
  if (hours < 24) {
    const label = hours === 1 ? "hora" : "horas"
    return past ? `hace ${hours} ${label}` : `en ${hours} ${label}`
  }

  const days = Math.floor(hours / 24)
  const label = days === 1 ? "día" : "días"
  return past ? `hace ${days} ${label}` : `en ${days} ${label}`
}

export function formatLastUpdate(iso: string, now = Date.now()): string {
  return `última actualización ${formatRelativeTime(iso, now)}`
}

export function formatPercent(value: number | null): string {
  if (value === null) {
    return "—"
  }
  return `${value.toFixed(2)}%`
}
