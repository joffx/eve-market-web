export type OrderType = "buy" | "sell" | "all"

export type EsiMarketOrder = {
  duration: number
  is_buy_order: boolean
  issued: string
  location_id: number
  min_volume: number
  order_id: number
  price: number
  range: string
  system_id: number
  type_id: number
  volume_remain: number
  volume_total: number
}

export type ResolvedLocation = {
  locationId: number
  name: string
  systemId: number | null
  systemName: string | null
  securityStatus: number | null
  isStructure: boolean
}

export type MarketOrderRow = {
  orderId: number
  regionId: number
  regionName: string
  quantity: number
  price: number
  locationId: number
  locationName: string
  systemName: string | null
  securityStatus: number | null
  range: string
  minVolume: number
  issued: string
  duration: number
  expiresAt: string
  isBuyOrder: boolean
  updatedAt: string
}

export type MarketSummary = {
  typeId: number
  typeName: string
  bestSell: number | null
  bestBuy: number | null
  spread: number | null
  spreadPercent: number | null
  sellVolume: number
  buyVolume: number
  updatedAt: string
}

export type MarketSnapshot = {
  typeId: number
  typeName: string
  orderType: OrderType
  regionId: number | "all"
  summary: MarketSummary
  sellers: MarketOrderRow[]
  buyers: MarketOrderRow[]
  updatedAt: string
}

export type MarketApiError = {
  error: string
  details?: string
}
