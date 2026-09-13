"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import {
  IconChartBar,
  IconMapRoute,
  IconShoppingCart,
  IconTruckDelivery,
} from "@tabler/icons-react"

import { buttonVariants } from "@/components/ui/button"
import { useTopsQuery } from "@/lib/hooks/queries"
import { formatIsk, formatLastUpdate } from "@/lib/format"
import type { TopItem } from "@/lib/eve/tops"
import type { MessageKey } from "@/lib/i18n/messages"
import { useLocaleStore, useT } from "@/stores/locale-store"
import { useMarketStore } from "@/stores/market-store"
import { cn } from "@/lib/utils"

function PriorityCard({
  label,
  item,
  onSelect,
}: {
  label: string
  item: TopItem | undefined
  onSelect: (typeId: number) => void
}) {
  const t = useT()

  if (!item) {
    return (
      <div className="rounded-md border border-border/60 bg-card/40 p-4">
        <p className="text-xs tracking-wide text-muted-foreground uppercase">{label}</p>
        <p className="mt-3 text-sm text-muted-foreground">{t("strategy.empty")}</p>
      </div>
    )
  }

  return (
    <Link
      href="/vendedores"
      onClick={() => onSelect(item.typeId)}
      className="block rounded-md border border-border/60 bg-card/40 p-4 transition-colors hover:bg-accent/30"
    >
      <p className="text-xs tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className="mt-2 text-lg font-medium tracking-tight">{item.name}</p>
      <p className="mt-1 font-mono text-sm tabular-nums text-emerald-400">
        {formatIsk(item.averagePrice)}
      </p>
      <p className="mt-1 text-[11px] text-muted-foreground">{t("strategy.avgPrice")}</p>
    </Link>
  )
}

export function StrategyView() {
  const t = useT()
  const locale = useLocaleStore((state) => state.locale)
  const setSelectedTypeId = useMarketStore((state) => state.setSelectedTypeId)
  const topsQuery = useTopsQuery()
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 30_000)
    return () => window.clearInterval(id)
  }, [])

  const snapshot = topsQuery.data
  const error = topsQuery.error instanceof Error ? topsQuery.error.message : null

  const steps: Array<{
    titleKey: MessageKey
    descKey: MessageKey
    icon: typeof IconChartBar
    actions: Array<{ href: string; labelKey: MessageKey; variant?: "default" | "outline" }>
  }> = [
    {
      titleKey: "strategy.step1.title",
      descKey: "strategy.step1.desc",
      icon: IconChartBar,
      actions: [{ href: "/tops", labelKey: "strategy.step1.cta" }],
    },
    {
      titleKey: "strategy.step2.title",
      descKey: "strategy.step2.desc",
      icon: IconShoppingCart,
      actions: [
        { href: "/vendedores", labelKey: "strategy.step2.ctaSell" },
        { href: "/compradores", labelKey: "strategy.step2.ctaBuy", variant: "outline" },
      ],
    },
    {
      titleKey: "strategy.step3.title",
      descKey: "strategy.step3.desc",
      icon: IconMapRoute,
      actions: [{ href: "/map", labelKey: "strategy.step3.cta", variant: "outline" }],
    },
  ]

  const tips: Array<{ titleKey: MessageKey; descKey: MessageKey }> = [
    { titleKey: "strategy.tip1.title", descKey: "strategy.tip1.desc" },
    { titleKey: "strategy.tip2.title", descKey: "strategy.tip2.desc" },
    { titleKey: "strategy.tip3.title", descKey: "strategy.tip3.desc" },
    { titleKey: "strategy.tip4.title", descKey: "strategy.tip4.desc" },
  ]

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-10 px-4 py-8 sm:px-6 lg:px-8">
      <header className="space-y-1 border-b border-border/50 pb-4">
        <h1 className="text-3xl font-semibold tracking-tight">{t("strategy.title")}</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">{t("strategy.description")}</p>
        {snapshot ? (
          <p className="text-xs text-muted-foreground">
            {formatLastUpdate(snapshot.updatedAt, now, locale)}
          </p>
        ) : null}
      </header>

      {topsQuery.isFetching ? (
        <p className="text-sm text-muted-foreground">
          {topsQuery.isLoading ? t("strategy.loading") : t("strategy.updating")}
        </p>
      ) : null}

      {error ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">{t("strategy.flowTitle")}</h2>
        <ol className="grid gap-4 lg:grid-cols-3">
          {steps.map((step) => {
            const Icon = step.icon
            return (
              <li
                key={step.titleKey}
                className="flex flex-col gap-4 border-t border-border/50 pt-4"
              >
                <div className="flex items-start gap-3">
                  <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-md border border-border/60 bg-[oklch(0.2_0.02_220)] text-[oklch(0.78_0.08_200)]">
                    <Icon className="size-4" stroke={1.75} />
                  </span>
                  <div>
                    <h3 className="font-medium tracking-tight">{t(step.titleKey)}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{t(step.descKey)}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {step.actions.map((action) => (
                    <Link
                      key={action.href + action.labelKey}
                      href={action.href}
                      className={cn(
                        buttonVariants({
                          size: "sm",
                          variant: action.variant ?? "default",
                        })
                      )}
                    >
                      {t(action.labelKey)}
                    </Link>
                  ))}
                </div>
              </li>
            )
          })}
        </ol>
      </section>

      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight">{t("strategy.picksTitle")}</h2>
          <p className="text-sm text-muted-foreground">{t("strategy.picksSubtitle")}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <PriorityCard
            label={t("strategy.pick.ore")}
            item={snapshot?.ores[0]}
            onSelect={setSelectedTypeId}
          />
          <PriorityCard
            label={t("strategy.pick.mineral")}
            item={snapshot?.minerals[0]}
            onSelect={setSelectedTypeId}
          />
          <PriorityCard
            label={t("strategy.pick.gas")}
            item={snapshot?.gases[0]}
            onSelect={setSelectedTypeId}
          />
        </div>
        <div>
          <Link
            href="/tops"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}
          >
            <IconTruckDelivery className="size-4" />
            {t("strategy.step1.cta")}
          </Link>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">{t("strategy.tipsTitle")}</h2>
        <ul className="divide-y divide-border/50 border-y border-border/50">
          {tips.map((tip) => (
            <li key={tip.titleKey} className="py-4">
              <h3 className="font-medium tracking-tight">{t(tip.titleKey)}</h3>
              <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{t(tip.descKey)}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
