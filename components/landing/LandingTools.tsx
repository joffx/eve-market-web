"use client"

import Link from "next/link"
import {
  IconChartBar,
  IconMapRoute,
  IconPick,
  IconShoppingCart,
  IconTruckDelivery,
} from "@tabler/icons-react"

import { useT } from "@/stores/locale-store"
import type { MessageKey } from "@/lib/i18n/messages"

const TOOLS: Array<{
  href: string
  titleKey: MessageKey
  descKey: MessageKey
  icon: typeof IconTruckDelivery
}> = [
  {
    href: "/vendedores",
    titleKey: "landing.tool.sellers.title",
    descKey: "landing.tool.sellers.desc",
    icon: IconTruckDelivery,
  },
  {
    href: "/compradores",
    titleKey: "landing.tool.buyers.title",
    descKey: "landing.tool.buyers.desc",
    icon: IconShoppingCart,
  },
  {
    href: "/tops",
    titleKey: "landing.tool.tops.title",
    descKey: "landing.tool.tops.desc",
    icon: IconChartBar,
  },
  {
    href: "/map",
    titleKey: "landing.tool.map.title",
    descKey: "landing.tool.map.desc",
    icon: IconMapRoute,
  },
  {
    href: "/estrategia-minera",
    titleKey: "landing.tool.strategy.title",
    descKey: "landing.tool.strategy.desc",
    icon: IconPick,
  },
]

export function LandingTools() {
  const t = useT()

  return (
    <section className="border-t border-border/50 bg-background">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="max-w-2xl space-y-3">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {t("landing.toolsTitle")}
          </h2>
          <p className="text-sm text-muted-foreground sm:text-base">
            {t("landing.toolsSubtitle")}
          </p>
        </div>

        <ul className="mt-10 divide-y divide-border/50 border-y border-border/50">
          {TOOLS.map((tool) => {
            const Icon = tool.icon
            return (
              <li key={tool.href}>
                <Link
                  href={tool.href}
                  className="group flex flex-col gap-2 py-5 transition-colors sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:py-6"
                >
                  <div className="flex items-start gap-3 sm:items-center sm:gap-4">
                    <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-md border border-border/60 bg-[oklch(0.2_0.02_220)] text-[oklch(0.78_0.08_200)] transition-colors group-hover:border-[oklch(0.55_0.08_200_/_0.5)] group-hover:text-[oklch(0.88_0.08_200)] sm:mt-0">
                      <Icon className="size-4" stroke={1.75} />
                    </span>
                    <div>
                      <p className="font-medium tracking-tight group-hover:text-[oklch(0.9_0.04_200)]">
                        {t(tool.titleKey)}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">{t(tool.descKey)}</p>
                    </div>
                  </div>
                  <span className="pl-12 text-sm text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground sm:pl-0">
                    {t("landing.open")}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
