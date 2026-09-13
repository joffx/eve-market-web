"use client"

import Link from "next/link"
import { useMemo, useState } from "react"

import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { filterShips, getShipGroups, type ShipCatalogEntry } from "@/data/ships"
import { localTypeRenderUrl } from "@/lib/eve/images"
import { useT } from "@/stores/locale-store"
import { cn } from "@/lib/utils"

const selectClassName =
  "h-9 w-full rounded-md border border-input bg-transparent px-2.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"

function ShipCard({ ship }: { ship: ShipCatalogEntry }) {
  const [failed, setFailed] = useState(false)
  const t = useT()

  return (
    <Link href={`/ships/${ship.typeId}`} className="block h-full focus-visible:outline-none">
      <Card
        size="sm"
        className="h-full gap-0 p-0 transition-colors duration-150 hover:border-primary/40"
      >
        <div className="flex aspect-square items-center justify-center bg-card-elevated p-3">
          {failed ? (
            <span className="text-sm text-muted-foreground">?</span>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element -- local immutable proxy
            <img
              src={localTypeRenderUrl(ship.typeId)}
              alt={ship.name}
              width={256}
              height={256}
              loading="lazy"
              decoding="async"
              className="size-full object-contain"
              onError={() => setFailed(true)}
            />
          )}
        </div>
        <CardContent className="space-y-1 border-t border-border py-3">
          <CardTitle className="line-clamp-2 text-center leading-snug">{ship.name}</CardTitle>
          <p className="text-center text-xs text-muted-foreground">{ship.groupName}</p>
          <p className="text-center font-mono text-[10px] text-muted-foreground/80">
            {t("ships.typeId")}: {ship.typeId}
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}

export function ShipsView() {
  const t = useT()
  const groups = useMemo(() => getShipGroups(), [])
  const [query, setQuery] = useState("")
  const [group, setGroup] = useState("")

  const ships = useMemo(
    () => filterShips(query, group || null),
    [query, group]
  )

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6 space-y-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
          {t("ships.title")}
        </h1>
        <p className="text-sm text-muted-foreground">{t("ships.description")}</p>
      </header>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex min-w-0 flex-1 flex-col gap-1.5">
          <span className="text-xs text-muted-foreground">{t("ships.search")}</span>
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("ships.searchPlaceholder")}
            aria-label={t("ships.search")}
          />
        </label>
        <label className="flex w-full flex-col gap-1.5 sm:w-64">
          <span className="text-xs text-muted-foreground">{t("ships.group")}</span>
          <select
            className={selectClassName}
            value={group}
            onChange={(event) => setGroup(event.target.value)}
            aria-label={t("ships.group")}
          >
            <option value="">{t("ships.allGroups")}</option>
            {groups.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="mb-4 text-xs text-muted-foreground">
        {t("ships.count", { count: ships.length })}
      </p>

      {ships.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("ships.empty")}</p>
      ) : (
        <ul
          className={cn(
            "grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
          )}
        >
          {ships.map((ship) => (
            <li key={ship.typeId}>
              <ShipCard ship={ship} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
