"use client"

import Image from "next/image"
import Link from "next/link"
import {
  IconChartBar,
  IconMapRoute,
  IconPick,
} from "@tabler/icons-react"

import { buttonVariants } from "@/components/ui/button"
import { useT } from "@/stores/locale-store"
import { cn } from "@/lib/utils"

export function LandingHero() {
  const t = useT()

  return (
    <section className="relative isolate min-h-[min(72svh,40rem)] overflow-hidden md:min-h-[min(78svh,46rem)]">
      <Image
        src="/hero-mining.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(105deg,rgb(3_9_13_/_0.92)_0%,rgb(3_9_13_/_0.72)_38%,rgb(3_9_13_/_0.35)_68%,rgb(3_9_13_/_0.55)_100%),linear-gradient(180deg,rgb(3_9_13_/_0.45)_0%,transparent_35%,rgb(3_9_13_/_0.7)_100%)]"
      />

      <div className="relative mx-auto flex min-h-[min(72svh,40rem)] w-full max-w-[1600px] flex-col justify-center px-4 py-14 sm:px-6 md:min-h-[min(78svh,46rem)] lg:px-8">
        <div className="max-w-2xl space-y-5">
          <p className="text-[11px] font-medium tracking-[0.18em] text-muted-foreground uppercase">
            {t("landing.eyebrow")}
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            {t("landing.titleLine1")}
            <br />
            <span className="text-primary">{t("landing.titleLine2")}</span>
          </h1>
          <p className="max-w-lg text-base text-muted-foreground sm:text-lg">
            {t("landing.subhead")}
          </p>
          <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center">
            <Link
              href="/tops"
              className={cn(buttonVariants({ size: "lg" }), "h-11 px-5 text-sm sm:text-base")}
            >
              {t("landing.ctaPrimary")}
            </Link>
            <Link
              href="/strategy"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-11 px-5 text-sm sm:text-base"
              )}
            >
              {t("landing.ctaSecondary")}
            </Link>
          </div>
          <ul className="flex flex-wrap gap-x-5 gap-y-2 pt-3 text-xs text-muted-foreground sm:text-sm">
            <li className="inline-flex items-center gap-1.5">
              <IconChartBar className="size-3.5 text-primary" stroke={1.75} />
              {t("landing.feature1")}
            </li>
            <li className="inline-flex items-center gap-1.5">
              <IconMapRoute className="size-3.5 text-primary" stroke={1.75} />
              {t("landing.feature2")}
            </li>
            <li className="inline-flex items-center gap-1.5">
              <IconPick className="size-3.5 text-primary" stroke={1.75} />
              {t("landing.feature3")}
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
}
