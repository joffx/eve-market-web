"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTopsQuery } from "@/lib/hooks/queries"
import { formatIsk, formatLastUpdate } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { TopItem } from "@/lib/eve/tops"
import { useMarketStore } from "@/stores/market-store"

function TopCardInner({ item }: { item: TopItem }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "inline-flex size-6 items-center justify-center rounded-md text-xs font-semibold",
              item.rank <= 3
                ? "bg-amber-500/20 text-amber-300"
                : "bg-muted text-muted-foreground"
            )}
          >
            {item.rank}
          </span>
          <span className="truncate font-medium">{item.name}</span>
        </div>
        <p className="mt-1 font-mono text-xs text-muted-foreground">
          type_id {item.typeId}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <div className="font-mono text-sm tabular-nums text-emerald-400">
          {formatIsk(item.averagePrice)}
        </div>
        <div className="text-[11px] text-muted-foreground">precio medio</div>
      </div>
    </div>
  )
}

function TopSection({
  title,
  subtitle,
  items,
  onSelect,
}: {
  title: string
  subtitle: string
  items: TopItem[]
  onSelect: (typeId: number) => void
}) {
  return (
    <Card size="sm" className="border-border/60 bg-card/40">
      <CardHeader className="border-b border-border/50">
        <CardTitle className="text-lg">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </CardHeader>
      <CardContent className="gap-2">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin datos de precios.</p>
        ) : (
          items.map((item) => (
            <Link
              key={item.typeId}
              href="/vendedores"
              onClick={() => onSelect(item.typeId)}
              className="block rounded-lg border border-border/60 bg-card/50 p-3 transition-colors hover:bg-accent/40"
            >
              <TopCardInner item={item} />
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  )
}

export function TopsView() {
  const topsQuery = useTopsQuery()
  const setSelectedTypeId = useMarketStore((state) => state.setSelectedTypeId)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 30_000)
    return () => window.clearInterval(id)
  }, [])

  const snapshot = topsQuery.data
  const error = topsQuery.error instanceof Error ? topsQuery.error.message : null

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="space-y-1 border-b border-border/50 pb-4">
        <h1 className="text-3xl font-semibold tracking-tight">Tops 10</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Los recursos más caros para ganar ISK: minerales, menas y gases. Precios medios
          oficiales de ESI.
        </p>
        {snapshot ? (
          <p className="text-xs text-muted-foreground">
            {formatLastUpdate(snapshot.updatedAt, now)}
          </p>
        ) : null}
      </header>

      {topsQuery.isFetching ? (
        <p className="text-sm text-muted-foreground">
          {topsQuery.isLoading ? "Cargando tops desde ESI…" : "Actualizando…"}
        </p>
      ) : null}

      {error ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {snapshot ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <TopSection
            title="Top minerales"
            subtitle="Los minerales más caros del mercado"
            items={snapshot.minerals}
            onSelect={setSelectedTypeId}
          />
          <TopSection
            title="Top menas"
            subtitle="Las ores base más caras para minar"
            items={snapshot.ores}
            onSelect={setSelectedTypeId}
          />
          <TopSection
            title="Top gases"
            subtitle="Fullerites más caros para harvesting"
            items={snapshot.gases}
            onSelect={setSelectedTypeId}
          />
        </div>
      ) : null}
    </div>
  )
}
