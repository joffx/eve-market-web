import { useQuery, useQueryClient } from "@tanstack/react-query"

import {
  fetchMarketSnapshot,
  fetchRoute,
  fetchSystems,
  fetchTopsSnapshot,
  type RoutePreference,
} from "@/lib/api/client"
import type { OrderType } from "@/types/market"

export const queryKeys = {
  market: (typeId: number, region: number | "all", orderType: OrderType) =>
    ["market", typeId, region, orderType] as const,
  tops: ["tops"] as const,
  systems: (query: string) => ["systems", query] as const,
  route: (input: {
    originId?: number | null
    destinationId?: number | null
    originName?: string
    destinationName?: string
    preference: RoutePreference
  }) => ["route", input] as const,
}

export function useMarketQuery(options: {
  typeId: number | null
  region: number | "all"
  orderType: OrderType
  enabled?: boolean
}) {
  return useQuery({
    queryKey: queryKeys.market(
      options.typeId ?? 0,
      options.region,
      options.orderType
    ),
    queryFn: () =>
      fetchMarketSnapshot({
        typeId: options.typeId!,
        region: options.region,
        orderType: options.orderType,
      }),
    enabled: Boolean(options.typeId) && (options.enabled ?? true),
  })
}

export function useTopsQuery() {
  return useQuery({
    queryKey: queryKeys.tops,
    queryFn: fetchTopsSnapshot,
  })
}

export function useSystemsQuery(query: string, enabled: boolean) {
  const normalized = query.trim()
  return useQuery({
    queryKey: queryKeys.systems(normalized),
    queryFn: () => fetchSystems(normalized),
    enabled: enabled && normalized.length >= 2,
  })
}

export function useRouteQuery(
  input: {
    originId?: number | null
    destinationId?: number | null
    originName?: string
    destinationName?: string
    preference: RoutePreference
  },
  enabled: boolean
) {
  return useQuery({
    queryKey: queryKeys.route(input),
    queryFn: () => fetchRoute(input),
    enabled,
  })
}

export function usePrefetchMarket() {
  const queryClient = useQueryClient()
  return (typeId: number, region: number | "all", orderType: OrderType) =>
    queryClient.prefetchQuery({
      queryKey: queryKeys.market(typeId, region, orderType),
      queryFn: () => fetchMarketSnapshot({ typeId, region, orderType }),
    })
}
