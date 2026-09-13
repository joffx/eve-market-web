"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatIsk, formatQuantity } from "@/lib/format"
import { useT } from "@/stores/locale-store"
import type { MarketSummary } from "@/types/market"

type MarketMode = "sellers" | "buyers"

type MarketSummaryProps = {
  name: string
  summary: MarketSummary
  mode: MarketMode
  orderCount: number
}

function Stat({
  label,
  value,
  valueClassName,
}: {
  label: string
  value: string
  valueClassName?: string
}) {
  return (
    <div className="min-w-0">
      <div className="text-[11px] tracking-wide text-muted-foreground uppercase">
        {label}
      </div>
      <div className={`mt-1 font-mono text-sm tabular-nums ${valueClassName ?? ""}`}>
        {value}
      </div>
    </div>
  )
}

export function MarketSummaryCards({
  name,
  summary,
  mode,
  orderCount,
}: MarketSummaryProps) {
  const t = useT()

  return (
    <Card size="sm" className="border-border/60 bg-card/60">
      <CardHeader className="border-b border-border/50">
        <CardTitle className="text-lg">{name}</CardTitle>
      </CardHeader>
      <CardContent>
        {mode === "sellers" ? (
          <div className="grid gap-4 sm:grid-cols-3">
            <Stat
              label={t("market.bestSell")}
              value={summary.bestSell === null ? "—" : formatIsk(summary.bestSell)}
            />
            <Stat label={t("market.sellVolume")} value={formatQuantity(summary.sellVolume)} />
            <Stat label={t("market.orders")} value={formatQuantity(orderCount)} />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            <Stat
              label={t("market.bestBuy")}
              value={summary.bestBuy === null ? "—" : formatIsk(summary.bestBuy)}
              valueClassName="text-emerald-400"
            />
            <Stat
              label={t("market.buyVolume")}
              value={formatQuantity(summary.buyVolume)}
              valueClassName="text-emerald-400"
            />
            <Stat label={t("market.orders")} value={formatQuantity(orderCount)} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
