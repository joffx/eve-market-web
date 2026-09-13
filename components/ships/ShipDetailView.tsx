"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { IconArrowLeft } from "@tabler/icons-react"
import { useState } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchShipDetail, type ShipDetail } from "@/lib/api/client"
import { localTypeRenderUrl } from "@/lib/eve/images"
import { formatQuantity } from "@/lib/format"
import { queryKeys } from "@/lib/hooks/queries"
import { useLocaleStore, useT } from "@/stores/locale-store"

function formatStatValue(value: number): string {
  if (Number.isInteger(value)) {
    return formatQuantity(value)
  }
  return value.toLocaleString("en-US", { maximumFractionDigits: 2 })
}

function ShipRender({ typeId, name }: { typeId: number; name: string }) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-xl border border-border bg-card-elevated text-muted-foreground">
        ?
      </div>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- local immutable proxy
    <img
      src={localTypeRenderUrl(typeId)}
      alt={name}
      width={512}
      height={512}
      className="aspect-square w-full rounded-xl border border-border bg-card-elevated object-contain p-4"
      onError={() => setFailed(true)}
    />
  )
}

function ShipDetailBody({ ship }: { ship: ShipDetail }) {
  const t = useT()

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,360px)_1fr]">
      <ShipRender typeId={ship.typeId} name={ship.name} />

      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{ship.groupName}</p>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">{ship.name}</h1>
          <p className="font-mono text-xs text-muted-foreground">
            {t("ships.typeId")}: {ship.typeId}
          </p>
        </div>

        {ship.description ? (
          <Card size="sm">
            <CardHeader>
              <CardTitle>{t("ships.detail.description")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {ship.description}
              </p>
            </CardContent>
          </Card>
        ) : null}

        <Card size="sm">
          <CardHeader>
            <CardTitle>{t("ships.detail.basics")}</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-xs text-muted-foreground">{t("ships.detail.mass")}</dt>
                <dd className="font-mono tabular-nums">{formatQuantity(ship.mass)} kg</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">{t("ships.detail.volume")}</dt>
                <dd className="font-mono tabular-nums">{formatQuantity(ship.volume)} m³</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">{t("ships.detail.capacity")}</dt>
                <dd className="font-mono tabular-nums">{formatQuantity(ship.capacity)} m³</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">{t("ships.detail.packaged")}</dt>
                <dd className="font-mono tabular-nums">
                  {formatQuantity(ship.packagedVolume)} m³
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {ship.stats.length > 0 ? (
          <Card size="sm">
            <CardHeader>
              <CardTitle>{t("ships.detail.stats")}</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                {ship.stats.map((stat) => (
                  <div key={stat.id}>
                    <dt className="text-xs text-muted-foreground">{stat.name}</dt>
                    <dd className="font-mono tabular-nums">{formatStatValue(stat.value)}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  )
}

export function ShipDetailView({ typeId }: { typeId: number }) {
  const t = useT()
  const locale = useLocaleStore((state) => state.locale)

  const query = useQuery({
    queryKey: queryKeys.shipDetail(typeId, locale),
    queryFn: () => fetchShipDetail({ typeId, locale }),
  })

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/ships"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <IconArrowLeft className="size-4" />
        {t("ships.back")}
      </Link>

      {query.isLoading ? (
        <p className="text-sm text-muted-foreground">{t("ships.detail.loading")}</p>
      ) : null}

      {query.isError ? (
        <p className="text-sm text-destructive">
          {query.error instanceof Error ? query.error.message : t("ships.detailFailed")}
        </p>
      ) : null}

      {query.data ? <ShipDetailBody ship={query.data} /> : null}
    </div>
  )
}
