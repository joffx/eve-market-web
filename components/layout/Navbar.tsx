"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { href: "/tops", label: "Tops 10" },
  { href: "/vendedores", label: "Vendedores" },
  { href: "/compradores", label: "Compradores" },
  { href: "/map", label: "Mapa" },
] as const

export function Navbar() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/vendedores" className="shrink-0">
          <span className="text-sm font-semibold tracking-tight">EVE Mining Market</span>
        </Link>

        <nav className="flex items-center gap-1" aria-label="Principal">
          {NAV_ITEMS.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`)

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
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
