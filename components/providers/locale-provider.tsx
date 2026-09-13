"use client"

import { useEffect, type ReactNode } from "react"

import { useLocaleStore } from "@/stores/locale-store"

export function LocaleProvider({ children }: { children: ReactNode }) {
  const locale = useLocaleStore((state) => state.locale)
  const setHydrated = useLocaleStore((state) => state.setHydrated)

  useEffect(() => {
    setHydrated(true)
    document.documentElement.lang = locale
  }, [locale, setHydrated])

  return children
}
