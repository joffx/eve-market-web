import { getResourceVolumeM3 } from "@/data/resources"

/** Conservative mid-tier barge yield (~Retriever), m³ mined per hour. */
export const DEFAULT_M3_PER_HOUR = 54_000

/** Minutes reserved per jump for travel (to mine + to market). */
export const MINUTES_PER_JUMP = 1.5

export type SessionMinutes = 30 | 60 | 120 | 240

export type EarningsEstimate = {
  sessionMinutes: number
  travelMinutes: number
  miningMinutes: number
  m3PerHour: number
  volumeM3: number
  units: number
  isk: number
  iskPerHour: number
}

export type PlanAdviceKind = "ok" | "far" | "lowYield" | "shortSession"

export type PlanAdvice = {
  kind: PlanAdviceKind
  severity: "info" | "warn"
}

export function estimateSessionEarnings(input: {
  typeId: number
  pricePerUnit: number
  sessionMinutes: number
  jumpsFromOrigin: number
  jumpsToMarket: number
  m3PerHour?: number
}): EarningsEstimate | null {
  const volumeM3 = getResourceVolumeM3(input.typeId)
  if (!volumeM3 || volumeM3 <= 0 || input.pricePerUnit <= 0) {
    return null
  }

  const m3PerHour = input.m3PerHour ?? DEFAULT_M3_PER_HOUR
  const travelMinutes = Math.max(
    0,
    (input.jumpsFromOrigin + input.jumpsToMarket) * MINUTES_PER_JUMP
  )
  const miningMinutes = Math.max(0, input.sessionMinutes - travelMinutes)
  const m3Mined = (m3PerHour * miningMinutes) / 60
  const units = Math.floor(m3Mined / volumeM3)
  const isk = units * input.pricePerUnit
  const iskPerHour =
    miningMinutes > 0 ? (isk / miningMinutes) * 60 : 0

  return {
    sessionMinutes: input.sessionMinutes,
    travelMinutes,
    miningMinutes,
    m3PerHour,
    volumeM3,
    units,
    isk,
    iskPerHour,
  }
}

export function buildPlanAdvice(input: {
  jumpsFromOrigin: number
  jumpsToMarket: number
  iskPerHour: number
  miningMinutes: number
}): PlanAdvice[] {
  const advice: PlanAdvice[] = []
  const totalJumps = input.jumpsFromOrigin + input.jumpsToMarket

  if (input.jumpsFromOrigin >= 12 || totalJumps >= 20) {
    advice.push({ kind: "far", severity: "warn" })
  }

  // Below ~8M ISK/h with this conservative barge model → weak for the effort
  if (input.iskPerHour > 0 && input.iskPerHour < 8_000_000) {
    advice.push({ kind: "lowYield", severity: "warn" })
  }

  if (input.miningMinutes < 15) {
    advice.push({ kind: "shortSession", severity: "warn" })
  }

  if (advice.length === 0) {
    advice.push({ kind: "ok", severity: "info" })
  }

  return advice
}
