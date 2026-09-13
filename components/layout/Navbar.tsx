"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { IconMenu2, IconX } from "@tabler/icons-react"

import { BrandLogo } from "@/components/layout/BrandLogo"
import { useT } from "@/stores/locale-store"
import { cn } from "@/lib/utils"

const NAV_HREFS = [
  { href: "/", labelKey: "nav.home" as const },
  { href: "/tops", labelKey: "nav.tops" as const },
  { href: "/vendedores", labelKey: "nav.sellers" as const },
  { href: "/compradores", labelKey: "nav.buyers" as const },
  { href: "/estrategia-minera", labelKey: "nav.strategy" as const },
  { href: "/map", labelKey: "nav.map" as const },
]

export function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const t = useT()

  useEffect(() => {
    if (!open) {
      return
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false)
      }
    }
    document.addEventListener("keydown", onKeyDown)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKeyDown)
      document.body.style.overflow = ""
    }
  }, [open])

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <BrandLogo priority onClick={() => setOpen(false)} />

        <nav className="hidden items-center gap-1 md:flex" aria-label={t("nav.main")}>
          {NAV_HREFS.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(`${item.href}/`)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm transition-colors",
                  active
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                )}
              >
                {t(item.labelKey)}
              </Link>
            )
          })}
          <span
            className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground/60"
            title={t("nav.comingSoon")}
            aria-disabled="true"
          >
            {t("nav.loginEve")}
            <span className="text-[10px] tracking-wide text-muted-foreground/50 uppercase">
              {t("nav.comingSoon")}
            </span>
          </span>
        </nav>

        <button
          type="button"
          className="inline-flex size-9 items-center justify-center rounded-md text-foreground transition-colors hover:bg-accent md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? t("nav.closeMenu") : t("nav.openMenu")}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <IconX className="size-5" /> : <IconMenu2 className="size-5" />}
        </button>
      </div>

      <div
        id="mobile-nav"
        className={cn(
          "border-t border-border/60 bg-background md:hidden",
          open ? "block" : "hidden"
        )}
      >
        <nav
          className="mx-auto flex max-w-[1600px] flex-col gap-1 px-4 py-3 sm:px-6"
          aria-label={t("nav.mobile")}
        >
          {NAV_HREFS.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(`${item.href}/`)

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-md px-3 py-2.5 text-sm transition-colors",
                  active
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                )}
              >
                {t(item.labelKey)}
              </Link>
            )
          })}
          <span
            className="inline-flex cursor-not-allowed items-center gap-2 rounded-md px-3 py-2.5 text-sm text-muted-foreground/60"
            aria-disabled="true"
          >
            {t("nav.loginEve")}
            <span className="text-[10px] tracking-wide text-muted-foreground/50 uppercase">
              {t("nav.comingSoon")}
            </span>
          </span>
        </nav>
      </div>
    </header>
  )
}
