"use client"

import { MARKET_REGIONS } from "@/data/regions"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  return (
    <div
      className={
        showOrderType
          ? "grid gap-3 sm:grid-cols-2 lg:grid-cols-5"
          : "grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
      }
    >
      <div className="space-y-1.5">
        <Label htmlFor="region">Región</Label>
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
          <option value="all">Todas las regiones</option>
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
          <Label htmlFor="orderType">Tipo de órdenes</Label>
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
            <option value="all">Todos</option>
            <option value="sell">Vendedores</option>
            <option value="buy">Compradores</option>
          </select>
        </div>
      ) : null}

      <div className="space-y-1.5">
        <Label htmlFor="minPrice">Precio mínimo</Label>
        <Input
          id="minPrice"
          inputMode="decimal"
          placeholder="0"
          value={filters.minPrice}
          onChange={(event) =>
            onChange({ ...filters, minPrice: event.target.value })
          }
          className="font-mono"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="maxPrice">Precio máximo</Label>
        <Input
          id="maxPrice"
          inputMode="decimal"
          placeholder="∞"
          value={filters.maxPrice}
          onChange={(event) =>
            onChange({ ...filters, maxPrice: event.target.value })
          }
          className="font-mono"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="sortBy">Ordenar por</Label>
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
          <option value="price">Precio</option>
          <option value="quantity">Cantidad</option>
          <option value="region">Región</option>
        </select>
      </div>
    </div>
  )
}
