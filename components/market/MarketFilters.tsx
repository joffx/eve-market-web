"use client"

import { MARKET_REGIONS } from "@/data/regions"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useT } from "@/stores/locale-store"
import type { OrderType } from "@/types/market"

export type MarketFilterState = {
  region: number | "all"
  orderType: OrderType
  minPrice: string
  maxPrice: string
  sortBy: "price" | "quantity" | "region"
}

type MarketFiltersProps = {
  filters: MarketFilterState
  onChange: (next: MarketFilterState) => void
  showOrderType?: boolean
}

const selectClassName =
  "h-9 w-full rounded-md border border-input bg-transparent px-2.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"

export function MarketFilters({
  filters,
  onChange,
  showOrderType = false,
}: MarketFiltersProps) {
  const t = useT()

  return (
    <div
      className={
        showOrderType
          ? "grid gap-3 sm:grid-cols-2 lg:grid-cols-5"
          : "grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
      }
    >
      <div className="space-y-1.5">
        <Label htmlFor="region">{t("market.filter.region")}</Label>
        <select
          id="region"
          className={selectClassName}
          value={filters.region === "all" ? "all" : String(filters.region)}
          onChange={(event) => {
            const value = event.target.value
            onChange({
              ...filters,
              region: value === "all" ? "all" : Number(value),
            })
          }}
        >
          <option value="all">{t("market.filter.allRegions")}</option>
          {MARKET_REGIONS.map((region) => (
            <option key={region.regionId} value={region.regionId}>
              {region.name}
              {region.mainHub ? ` (${region.mainHub})` : ""}
            </option>
          ))}
        </select>
      </div>

      {showOrderType ? (
        <div className="space-y-1.5">
          <Label htmlFor="orderType">{t("market.filter.orderType")}</Label>
          <select
            id="orderType"
            className={selectClassName}
            value={filters.orderType}
            onChange={(event) =>
              onChange({
                ...filters,
                orderType: event.target.value as OrderType,
              })
            }
          >
            <option value="all">{t("market.filter.all")}</option>
            <option value="sell">{t("nav.sellers")}</option>
            <option value="buy">{t("nav.buyers")}</option>
          </select>
        </div>
      ) : null}

      <div className="space-y-1.5">
        <Label htmlFor="minPrice">{t("market.filter.minPrice")}</Label>
        <Input
          id="minPrice"
          inputMode="decimal"
          placeholder="0"
          value={filters.minPrice}
          onChange={(event) => onChange({ ...filters, minPrice: event.target.value })}
          className="font-mono"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="maxPrice">{t("market.filter.maxPrice")}</Label>
        <Input
          id="maxPrice"
          inputMode="decimal"
          placeholder="∞"
          value={filters.maxPrice}
          onChange={(event) => onChange({ ...filters, maxPrice: event.target.value })}
          className="font-mono"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="sortBy">{t("market.filter.sortBy")}</Label>
        <select
          id="sortBy"
          className={selectClassName}
          value={filters.sortBy}
          onChange={(event) =>
            onChange({
              ...filters,
              sortBy: event.target.value as MarketFilterState["sortBy"],
            })
          }
        >
          <option value="price">{t("market.filter.sort.price")}</option>
          <option value="quantity">{t("market.filter.sort.quantity")}</option>
          <option value="region">{t("market.filter.sort.region")}</option>
        </select>
      </div>
    </div>
  )
}
