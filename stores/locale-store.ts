"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  isLocale,
  type Locale,
} from "@/lib/i18n/locale"
import { translate, type MessageKey } from "@/lib/i18n/messages"

type LocaleStore = {
  locale: Locale
  hydrated: boolean
  setLocale: (locale: Locale) => void
  setHydrated: (value: boolean) => void
  t: (key: MessageKey, vars?: Record<string, string | number>) => string
}

export const useLocaleStore = create<LocaleStore>()(
  persist(
    (set, get) => ({
      locale: DEFAULT_LOCALE,
      hydrated: false,
      setLocale: (locale) => {
        set({ locale })
        if (typeof document !== "undefined") {
          document.documentElement.lang = locale
        }
      },
      setHydrated: (value) => set({ hydrated: value }),
      t: (key, vars) => translate(get().locale, key, vars),
    }),
    {
      name: LOCALE_STORAGE_KEY,
      partialize: (state) => ({ locale: state.locale }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          if (!isLocale(state.locale)) {
            state.locale = DEFAULT_LOCALE
          }
          state.hydrated = true
          if (typeof document !== "undefined") {
            document.documentElement.lang = state.locale
          }
        }
      },
    }
  )
)

export function useT() {
  const locale = useLocaleStore((state) => state.locale)
  return (key: MessageKey, vars?: Record<string, string | number>) =>
    translate(locale, key, vars)
}
