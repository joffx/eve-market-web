"use client"

import { useEffect, useMemo, useState } from "react"

import { BuyersTable } from "@/components/market/BuyersTable"
import { MarketFilters } from "@/components/market/MarketFilters"
import { MarketSearch } from "@/components/market/MarketSearch"
import { MarketSummaryCards } from "@/components/market/MarketSummary"
import { SellersTable } from "@/components/market/SellersTable"
import { getResourceById } from "@/data/resources"
import { useMarketQuery } from "@/lib/hooks/queries"
import { formatLastUpdate } from "@/lib/format"
import { useLocaleStore, useT } from "@/stores/locale-store"
import { useMarketStore } from "@/stores/market-store"
import type { MarketOrderRow, MarketSummary } from "@/types/market"
import type { MarketFilterState } from "@/components/market/MarketFilters"

export type MarketMode = "sellers" | "buyers"

function parseOptionalNumber(value: string): number | null {
  const trimmed = value.trim()
  if (!trimmed) {
    return null
  }
  const parsed = Number(trimmed)
  return Number.isFinite(parsed) ? parsed : null
}

function sortOrders(
  rows: MarketOrderRow[],
  sortBy: MarketFilterState["sortBy"],
  direction: "asc" | "desc"
): MarketOrderRow[] {
  const sorted = [...rows]
  sorted.sort((a, b) => {
    let comparison = 0
    if (sortBy === "price") {
      comparison = a.price - b.price
    } else if (sortBy === "quantity") {
      comparison = a.quantity - b.quantity
    } else {
      comparison = a.regionName.localeCompare(b.regionName)
    }
    return direction === "asc" ? comparison : -comparison
  })
  return sorted
}

function applyPriceFilter(
  rows: MarketOrderRow[],
  minPrice: number | null,
  maxPrice: number | null
): MarketOrderRow[] {
  return rows.filter((row) => {
    if (minPrice !== null && row.price < minPrice) {
      return false
    }
    if (maxPrice !== null && row.price > maxPrice) {
      return false
    }
    return true
  })
}

type MarketViewProps = {
  mode: MarketMode
}

export function MarketView({ mode }: MarketViewProps) {
  const t = useT()
  const locale = useLocaleStore((state) => state.locale)
  const selectedTypeId = useMarketStore((state) => state.selectedTypeId)
  const filters = useMarketStore((state) => state.filters)
  const setSelectedTypeId = useMarketStore((state) => state.setSelectedTypeId)
  const setFilters = useMarketStore((state) => state.setFilters)

  const [now, setNow] = useState(() => Date.now())
  const selected = getResourceById(selectedTypeId) ?? null
  const orderType = mode === "sellers" ? "sell" : "buy"
  const title = mode === "sellers" ? t("market.sellers.title") : t("market.buyers.title")
  const description =
    mode === "sellers" ? t("market.sellers.description") : t("market.buyers.description")

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 30_000)
    return () => window.clearInterval(id)
  }, [])

  const marketQuery = useMarketQuery({
    typeId: selected?.typeId ?? null,
    region: filters.region,
    orderType,
  })

  const snapshot = marketQuery.data ?? null
  const minPrice = parseOptionalNumber(filters.minPrice)
  const maxPrice = parseOptionalNumber(filters.maxPrice)

  const sellers = useMemo(() => {
    if (!snapshot) {
      return []
    }
    return sortOrders(
      applyPriceFilter(snapshot.sellers, minPrice, maxPrice),
      filters.sortBy,
      "asc"
    )
  }, [snapshot, minPrice, maxPrice, filters.sortBy])

  const buyers = useMemo(() => {
    if (!snapshot) {
      return []
    }
    return sortOrders(
      applyPriceFilter(snapshot.buyers, minPrice, maxPrice),
      filters.sortBy,
      "desc"
    )
  }, [snapshot, minPrice, maxPrice, filters.sortBy])

  const summary = useMemo((): MarketSummary | null => {
    if (!snapshot || !selected) {
      return null
    }

    return {
      typeId: selected.typeId,
      typeName: selected.name,
      bestSell: sellers.length > 0 ? Math.min(...sellers.map((o) => o.price)) : null,
      bestBuy: buyers.length > 0 ? Math.max(...buyers.map((o) => o.price)) : null,
      spread: null,
      spreadPercent: null,
      sellVolume: sellers.reduce((sum, order) => sum + order.quantity, 0),
      buyVolume: buyers.reduce((sum, order) => sum + order.quantity, 0),
      updatedAt: snapshot.updatedAt,
    }
  }, [snapshot, selected, sellers, buyers])

  const rows = mode === "sellers" ? sellers : buyers
  const error = marketQuery.error instanceof Error ? marketQuery.error.message : null

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="space-y-1 border-b border-border/50 pb-4">
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
      </header>

      <MarketSearch
        selectedTypeId={selected?.typeId ?? null}
        onSelect={(resource) => setSelectedTypeId(resource.typeId)}
      />

      <MarketFilters filters={filters} onChange={setFilters} />

      {marketQuery.isFetching ? (
        <p className="text-sm text-muted-foreground">
          {marketQuery.isLoading ? t("market.loading") : t("market.updating")}
        </p>
      ) : null}

      {error ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {selected && snapshot && summary && !error ? (
        <>
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-xl font-medium">{selected.name}</h2>
              <p className="text-xs text-muted-foreground">
                type_id {selected.typeId} ·{" "}
                {formatLastUpdate(snapshot.updatedAt, now, locale)}
              </p>
            </div>
          </div>

          <MarketSummaryCards
            name={selected.name}
            summary={summary}
            mode={mode}
            orderCount={rows.length}
          />

          {mode === "sellers" ? (
            <SellersTable rows={sellers} now={now} />
          ) : (
            <BuyersTable rows={buyers} now={now} />
          )}
        </>
      ) : null}

      {!selected ? (
        <p className="text-sm text-muted-foreground">{t("market.selectResource")}</p>
      ) : null}
    </div>
  )
}
