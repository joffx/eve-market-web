import { useQuery, useQueryClient } from "@tanstack/react-query"

import {
  fetchMarketSnapshot,
  fetchRoute,
  fetchSystems,
  fetchTopsSnapshot,
  type RoutePreference,
} from "@/lib/api/client"
import type { OrderType } from "@/types/market"
import { useLocaleStore } from "@/stores/locale-store"

export const queryKeys = {
  market: (typeId: number, region: number | "all", orderType: OrderType, locale: string) =>
    ["market", typeId, region, orderType, locale] as const,
  tops: (locale: string) => ["tops", locale] as const,
  systems: (query: string, locale: string) => ["systems", query, locale] as const,
  route: (input: {
    originId?: number | null
    destinationId?: number | null
    originName?: string
    destinationName?: string
    preference: RoutePreference
    locale: string
  }) => ["route", input] as const,
}

export function useMarketQuery(options: {
  typeId: number | null
  region: number | "all"
  orderType: OrderType
  enabled?: boolean
}) {
  const locale = useLocaleStore((state) => state.locale)

  return useQuery({
    queryKey: queryKeys.market(
      options.typeId ?? 0,
      options.region,
      options.orderType,
      locale
    ),
    queryFn: () =>
      fetchMarketSnapshot({
        typeId: options.typeId!,
        region: options.region,
        orderType: options.orderType,
        locale,
      }),
    enabled: Boolean(options.typeId) && (options.enabled ?? true),
  })
}

export function useTopsQuery() {
  const locale = useLocaleStore((state) => state.locale)

  return useQuery({
    queryKey: queryKeys.tops(locale),
    queryFn: () => fetchTopsSnapshot(locale),
  })
}

export function useSystemsQuery(query: string, enabled: boolean) {
  const locale = useLocaleStore((state) => state.locale)
  const normalized = query.trim()
  return useQuery({
    queryKey: queryKeys.systems(normalized, locale),
    queryFn: () => fetchSystems(normalized, locale),
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
  const locale = useLocaleStore((state) => state.locale)
  const withLocale = { ...input, locale }

  return useQuery({
    queryKey: queryKeys.route(withLocale),
    queryFn: () => fetchRoute({ ...input, locale }),
    enabled,
  })
}

export function usePrefetchMarket() {
  const queryClient = useQueryClient()
  const locale = useLocaleStore((state) => state.locale)

  return (typeId: number, region: number | "all", orderType: OrderType) =>
    queryClient.prefetchQuery({
      queryKey: queryKeys.market(typeId, region, orderType, locale),
      queryFn: () => fetchMarketSnapshot({ typeId, region, orderType, locale }),
    })
}
