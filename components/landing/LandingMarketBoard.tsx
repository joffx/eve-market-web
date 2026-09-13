"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  IconBook2,
  IconChartBar,
  IconMapPin,
  IconPick,
  IconSparkles,
} from "@tabler/icons-react"

import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TypeIcon } from "@/components/market/TypeIcon"
import { ResourceSecurityBadge } from "@/components/market/ResourceSecurityBadge"
import { useTopsQuery } from "@/lib/hooks/queries"
import { formatIsk } from "@/lib/format"
import { BASE_RESOURCES, MARKET_RESOURCES } from "@/data/resources"
import { useT } from "@/stores/locale-store"
import { useMarketStore } from "@/stores/market-store"
import { cn } from "@/lib/utils"

export function LandingStats() {
  const t = useT()
  const mineralCount = MARKET_RESOURCES.length
  const baseCount = BASE_RESOURCES.length

  const stats = [
    {
      label: t("landing.stat.resources"),
      value: String(mineralCount),
      icon: IconPick,
    },
    {
      label: t("landing.stat.base"),
      value: String(baseCount),
      icon: IconSparkles,
    },
    {
      label: t("landing.stat.prices"),
      value: t("landing.stat.pricesValue"),
      icon: IconChartBar,
    },
    {
      label: t("landing.stat.guides"),
      value: t("landing.stat.guidesValue"),
      icon: IconBook2,
    },
  ]

  return (
    <section className="border-b border-border bg-background-secondary">
      <div className="mx-auto grid w-full max-w-[1600px] gap-3 px-4 py-6 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-colors duration-200 hover:border-primary/30"
            >
              <span className="inline-flex size-9 items-center justify-center rounded-md border border-border bg-card-elevated text-primary">
                <Icon className="size-4" stroke={1.75} />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] tracking-wide text-muted-foreground uppercase">
                  {stat.label}
                </p>
                <p className="truncate font-mono text-sm font-medium tabular-nums text-foreground">
                  {stat.value}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export function LandingMarketBoard() {
  const t = useT()
  const router = useRouter()
  const topsQuery = useTopsQuery()
  const setSelectedTypeId = useMarketStore((state) => state.setSelectedTypeId)
  const ores = topsQuery.data?.ores.slice(0, 6) ?? []

  return (
    <section className="bg-background">
      <div className="mx-auto grid w-full max-w-[1600px] gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[1.6fr_0.9fr] lg:px-8 lg:py-12">
        <Card size="sm" className="border-border bg-card">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-base font-semibold tracking-tight sm:text-lg">
              {t("landing.board.title")}
            </CardTitle>
            <p className="text-sm text-muted-foreground">{t("landing.board.subtitle")}</p>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            {topsQuery.isLoading ? (
              <p className="px-(--card-spacing) py-8 text-sm text-muted-foreground">
                {t("landing.board.loading")}
              </p>
            ) : ores.length === 0 ? (
              <p className="px-(--card-spacing) py-8 text-sm text-muted-foreground">
                {t("landing.board.empty")}
              </p>
            ) : (
              <Table className="text-xs">
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="pl-4">#</TableHead>
                    <TableHead>{t("landing.board.col.mineral")}</TableHead>
                    <TableHead className="text-right">{t("landing.board.col.price")}</TableHead>
                    <TableHead className="hidden text-right sm:table-cell">
                      {t("landing.board.col.security")}
                    </TableHead>
                    <TableHead className="pr-4 text-right">{t("landing.board.col.action")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ores.map((item) => (
                    <TableRow key={item.typeId}>
                      <TableCell className="pl-4 font-mono tabular-nums">
                        <span
                          className={cn(
                            item.rank === 1 ? "font-semibold text-primary" : "text-muted-foreground"
                          )}
                        >
                          {item.rank}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <TypeIcon typeId={item.typeId} name={item.name} size={32} />
                          <div className="min-w-0">
                            <div className="truncate font-medium text-foreground">
                              {item.name}
                            </div>
                            <div className="text-[11px] text-muted-foreground">
                              {t("market.category.ore")}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums text-buy">
                        {formatIsk(item.averagePrice)}
                      </TableCell>
                      <TableCell className="hidden text-right sm:table-cell">
                        <div className="flex justify-end">
                          <ResourceSecurityBadge typeId={item.typeId} />
                        </div>
                      </TableCell>
                      <TableCell className="pr-4 text-right">
                        <Link
                          href="/sellers"
                          onClick={() => setSelectedTypeId(item.typeId)}
                          className={cn(
                            buttonVariants({ size: "xs", variant: "secondary" }),
                            "border-primary/20 text-primary hover:border-primary/40"
                          )}
                        >
                          {t("landing.board.view")}
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card size="sm" className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base">{t("landing.spot.title")}</CardTitle>
              <p className="text-sm text-muted-foreground">{t("landing.spot.subtitle")}</p>
            </CardHeader>
            <CardContent className="gap-3">
              <div className="relative">
                <IconMapPin className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  readOnly
                  value=""
                  placeholder={t("landing.spot.placeholder")}
                  className="cursor-pointer pl-8"
                  onClick={() => {
                    router.push("/map")
                  }}
                />
              </div>
              <Link
                href="/map"
                className={cn(buttonVariants({ size: "lg" }), "h-10 w-full justify-center")}
              >
                {t("landing.spot.cta")}
              </Link>
            </CardContent>
          </Card>

          <Card size="sm" className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base">{t("landing.toolsCard.title")}</CardTitle>
            </CardHeader>
            <CardContent className="gap-1">
              <Link
                href="/strategy"
                className="flex items-center justify-between rounded-md px-2 py-2.5 text-sm transition-colors hover:bg-muted"
              >
                <span className="inline-flex items-center gap-2">
                  <IconPick className="size-4 text-primary" stroke={1.75} />
                  {t("landing.toolsCard.strategy")}
                </span>
                <span className="text-muted-foreground">→</span>
              </Link>
              <Link
                href="/map"
                className="flex items-center justify-between rounded-md px-2 py-2.5 text-sm transition-colors hover:bg-muted"
              >
                <span className="inline-flex items-center gap-2">
                  <IconMapPin className="size-4 text-primary" stroke={1.75} />
                  {t("landing.toolsCard.routes")}
                </span>
                <span className="text-muted-foreground">→</span>
              </Link>
              <Link
                href="/buyers"
                className="flex items-center justify-between rounded-md px-2 py-2.5 text-sm transition-colors hover:bg-muted"
              >
                <span className="inline-flex items-center gap-2">
                  <IconChartBar className="size-4 text-primary" stroke={1.75} />
                  {t("landing.toolsCard.buyers")}
                </span>
                <span className="text-muted-foreground">→</span>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
