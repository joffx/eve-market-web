import { esiFetch } from "@/lib/eve/esi"

export type SecurityClass = "high" | "low" | "null"

export type SystemDetails = {
  systemId: number
  name: string
  securityStatus: number
  securityClass: SecurityClass
}

export function classifySecurity(securityStatus: number): SecurityClass {
  // In-game rounded security: >= 0.5 high, > 0.0 low, else null
  const rounded = Math.round(securityStatus * 10) / 10
  if (rounded >= 0.5) return "high"
  if (rounded > 0) return "low"
  return "null"
}

export async function getSystemDetails(systemId: number): Promise<SystemDetails> {
  const { data } = await esiFetch<{
    system_id: number
    name: string
    security_status: number
  }>(`/universe/systems/${systemId}/`, {
    revalidate: 86400,
  })

  return {
    systemId: data.system_id,
    name: data.name,
    securityStatus: data.security_status,
    securityClass: classifySecurity(data.security_status),
  }
}
