"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TypeIcon } from "@/components/market/TypeIcon"
import { ResourceSecurityBadge } from "@/components/market/ResourceSecurityBadge"
import { useTopsQuery } from "@/lib/hooks/queries"
import { formatIsk, formatLastUpdate } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { TopItem } from "@/lib/eve/tops"
import { useLocaleStore, useT } from "@/stores/locale-store"
import { useMarketStore } from "@/stores/market-store"

function TopCardInner({ item }: { item: TopItem }) {
  const t = useT()

  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <TypeIcon typeId={item.typeId} name={item.name} size={32} />
          <span
            className={cn(
              "inline-flex size-6 items-center justify-center rounded-md text-xs font-semibold",
              item.rank <= 3
                ? "bg-primary/15 text-primary"
                : "bg-muted text-muted-foreground"
            )}
          >
            {item.rank}
          </span>
          <span className="truncate font-medium">{item.name}</span>
        </div>
      </div>
      <div className="shrink-0 text-right">
        <div className="font-mono text-sm tabular-nums text-buy">
          {formatIsk(item.averagePrice)}
        </div>
        <div className="text-[11px] text-muted-foreground">{t("tops.avgPrice")}</div>
        <div className="mt-1 flex justify-end">
          <ResourceSecurityBadge typeId={item.typeId} />
        </div>
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
  const t = useT()

  return (
    <Card size="sm" className="border-border/60 bg-card/40">
      <CardHeader className="border-b border-border/50">
        <CardTitle className="text-lg">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </CardHeader>
      <CardContent className="gap-2">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("tops.empty")}</p>
        ) : (
          items.map((item) => (
            <Link
              key={item.typeId}
              href="/sellers"
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
  const t = useT()
  const locale = useLocaleStore((state) => state.locale)
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
        <h1 className="text-3xl font-semibold tracking-tight">{t("tops.title")}</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">{t("tops.description")}</p>
        {snapshot ? (
          <p className="text-xs text-muted-foreground">
            {formatLastUpdate(snapshot.updatedAt, now, locale)}
          </p>
        ) : null}
      </header>

      {topsQuery.isFetching ? (
        <p className="text-sm text-muted-foreground">
          {topsQuery.isLoading ? t("tops.loading") : t("tops.updating")}
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
            title={t("tops.minerals.title")}
            subtitle={t("tops.minerals.subtitle")}
            items={snapshot.minerals}
            onSelect={setSelectedTypeId}
          />
          <TopSection
            title={t("tops.ores.title")}
            subtitle={t("tops.ores.subtitle")}
            items={snapshot.ores}
            onSelect={setSelectedTypeId}
          />
          <TopSection
            title={t("tops.gases.title")}
            subtitle={t("tops.gases.subtitle")}
            items={snapshot.gases}
            onSelect={setSelectedTypeId}
          />
        </div>
      ) : null}
    </div>
  )
}
