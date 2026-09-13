"use client"

import Link from "next/link"

import { BrandLogo } from "@/components/layout/BrandLogo"
import { LOCALES, type Locale } from "@/lib/i18n/locale"
import { useLocaleStore, useT } from "@/stores/locale-store"
import { cn } from "@/lib/utils"

const FOOTER_LINKS = [
  { href: "/tops", labelKey: "nav.tops" as const },
  { href: "/vendedores", labelKey: "nav.sellers" as const },
  { href: "/compradores", labelKey: "nav.buyers" as const },
  { href: "/estrategia-minera", labelKey: "nav.strategy" as const },
  { href: "/map", labelKey: "nav.map" as const },
]

export function Footer() {
  const t = useT()
  const locale = useLocaleStore((state) => state.locale)
  const setLocale = useLocaleStore((state) => state.setLocale)

  return (
    <footer className="mt-auto border-t border-border/60 bg-[oklch(0.13_0.015_240)]">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-sm space-y-3">
            <BrandLogo />
            <p className="text-sm text-muted-foreground">{t("footer.tagline")}</p>
          </div>

          <div className="flex flex-col gap-6 sm:flex-row sm:gap-10">
            <nav aria-label={t("footer.nav")} className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
              {FOOTER_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t(item.labelKey)}
                </Link>
              ))}
            </nav>

            <div className="space-y-2">
              <p className="text-xs tracking-wide text-muted-foreground uppercase">
                {t("footer.language")}
              </p>
              <div className="flex gap-2" role="group" aria-label={t("footer.language")}>
                {LOCALES.map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setLocale(code)}
                    className={cn(
                      "rounded-md border px-3 py-1.5 text-sm transition-colors",
                      locale === code
                        ? "border-border bg-accent text-accent-foreground"
                        : "border-border/50 text-muted-foreground hover:bg-accent/40 hover:text-foreground"
                    )}
                    aria-pressed={locale === code}
                  >
                    {t(`footer.lang.${code}` as `footer.lang.${Locale}`)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-border/40 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>{t("footer.legal")}</p>
          <p>{t("footer.madeBy")}</p>
        </div>
      </div>
    </footer>
  )
}
