"use client"

import Image from "next/image"
import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { useT } from "@/stores/locale-store"
import { cn } from "@/lib/utils"

export function LandingHero() {
  const t = useT()

  return (
    <section className="relative isolate min-h-[calc(100svh-3.5rem)] overflow-hidden">
      <Image
        src="/hero-mining.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-[center_35%]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,oklch(0.12_0.02_240_/_0.88)_0%,oklch(0.12_0.02_240_/_0.62)_42%,oklch(0.12_0.02_240_/_0.28)_72%,oklch(0.12_0.02_240_/_0.45)_100%),linear-gradient(180deg,oklch(0.12_0.02_240_/_0.35)_0%,transparent_28%,oklch(0.12_0.02_240_/_0.55)_100%)]"
      />

      <div className="relative mx-auto flex min-h-[calc(100svh-3.5rem)] w-full max-w-[1600px] flex-col justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="landing-fade-up max-w-3xl space-y-6">
          <p className="landing-fade-up-delay-1 text-4xl font-semibold tracking-tight text-white drop-shadow-[0_2px_24px_oklch(0_0_0_/_0.45)] sm:text-5xl md:text-6xl lg:text-7xl">
            EVE Mining Market
          </p>
          <h1 className="landing-fade-up-delay-2 max-w-2xl text-xl font-medium tracking-tight text-[oklch(0.88_0.05_200)] drop-shadow-[0_1px_12px_oklch(0_0_0_/_0.4)] sm:text-2xl md:text-3xl">
            {t("landing.headline")}
          </h1>
          <p className="landing-fade-up-delay-3 max-w-xl text-base text-white/80 sm:text-lg">
            {t("landing.subhead")}
          </p>
          <div className="landing-fade-up-delay-4 flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
            <Link
              href="/vendedores"
              className={cn(buttonVariants({ size: "lg" }), "h-11 px-5 text-sm sm:text-base")}
            >
              {t("landing.ctaSellers")}
            </Link>
            <Link
              href="/tops"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-11 border-white/25 bg-black/25 px-5 text-sm text-white backdrop-blur-sm hover:bg-black/40 hover:text-white sm:text-base"
              )}
            >
              {t("landing.ctaTops")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
