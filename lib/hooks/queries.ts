import { useQuery, useQueryClient } from "@tanstack/react-query"

import {
  fetchMarketSnapshot,
  fetchRoute,
  fetchStrategyBuyers,
  fetchStrategyMines,
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
  strategyBuyers: (typeId: number, locale: string) =>
    ["strategy", "buyers", typeId, locale] as const,
  strategyMines: (
    typeId: number,
    sellSystemId: number,
    originId: number | "none",
    locale: string
  ) => ["strategy", "mines", typeId, sellSystemId, originId, locale] as const,
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

export function useStrategyBuyersQuery(options: {
  typeId: number | null
  enabled?: boolean
}) {
  const locale = useLocaleStore((state) => state.locale)

  return useQuery({
    queryKey: queryKeys.strategyBuyers(options.typeId ?? 0, locale),
    queryFn: () =>
      fetchStrategyBuyers({
        typeId: options.typeId!,
        locale,
      }),
    enabled: Boolean(options.typeId) && (options.enabled ?? true),
  })
}

export function useStrategyMinesQuery(options: {
  typeId: number | null
  sellSystemId: number | null
  originId?: number | null
  enabled?: boolean
}) {
  const locale = useLocaleStore((state) => state.locale)
  const originKey = options.originId ?? "none"

  return useQuery({
    queryKey: queryKeys.strategyMines(
      options.typeId ?? 0,
      options.sellSystemId ?? 0,
      originKey,
      locale
    ),
    queryFn: () =>
      fetchStrategyMines({
        typeId: options.typeId!,
        sellSystemId: options.sellSystemId!,
        originId: options.originId ?? null,
        locale,
      }),
    enabled:
      Boolean(options.typeId && options.sellSystemId) && (options.enabled ?? true),
  })
}
