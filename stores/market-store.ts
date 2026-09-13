import { create } from "zustand"

import type { MarketFilterState } from "@/components/market/MarketFilters"
import { getResourceById } from "@/data/resources"

const DEFAULT_TYPE_ID = 20

type MarketStore = {
  selectedTypeId: number
  filters: MarketFilterState
  setSelectedTypeId: (typeId: number) => void
  setFilters: (filters: MarketFilterState) => void
  patchFilters: (patch: Partial<MarketFilterState>) => void
}

export const useMarketStore = create<MarketStore>((set) => ({
  selectedTypeId: getResourceById(DEFAULT_TYPE_ID)?.typeId ?? DEFAULT_TYPE_ID,
  filters: {
    region: "all",
    orderType: "all",
    minPrice: "",
    maxPrice: "",
    sortBy: "price",
    sortDir: "desc",
  },
  setSelectedTypeId: (typeId) => set({ selectedTypeId: typeId }),
  setFilters: (filters) => set({ filters }),
  patchFilters: (patch) =>
    set((state) => ({
      filters: { ...state.filters, ...patch },
    })),
}))
