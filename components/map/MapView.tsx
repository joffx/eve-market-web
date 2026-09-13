"use client"

import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"

import { SystemSearch } from "@/components/map/SystemSearch"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { fetchRoute, type RouteResult } from "@/lib/api/client"
import { queryKeys } from "@/lib/hooks/queries"
import { formatSecurity } from "@/lib/format"
import { cn } from "@/lib/utils"
import { useLocaleStore, useT } from "@/stores/locale-store"
import { useMapStore } from "@/stores/map-store"

const selectClassName =
  "h-9 w-full rounded-md border border-input bg-transparent px-2.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"

function securityTone(securityClass: RouteResult["systems"][number]["securityClass"]) {
  if (securityClass === "high") return "text-emerald-400"
  if (securityClass === "low") return "text-amber-400"
  return "text-red-400"
}

export function MapView() {
  const t = useT()
  const locale = useLocaleStore((state) => state.locale)
  const originText = useMapStore((state) => state.originText)
  const destinationText = useMapStore((state) => state.destinationText)
  const originSystem = useMapStore((state) => state.originSystem)
  const destinationSystem = useMapStore((state) => state.destinationSystem)
  const preference = useMapStore((state) => state.preference)
  const setOriginText = useMapStore((state) => state.setOriginText)
  const setDestinationText = useMapStore((state) => state.setDestinationText)
  const setOriginSystem = useMapStore((state) => state.setOriginSystem)
  const setDestinationSystem = useMapStore((state) => state.setDestinationSystem)
  const setPreference = useMapStore((state) => state.setPreference)

  const routeInput = useMemo(
    () => ({
      originId: originSystem?.systemId ?? null,
      destinationId: destinationSystem?.systemId ?? null,
      originName: originText.trim(),
      destinationName: destinationText.trim(),
      preference,
      locale,
    }),
    [originSystem, destinationSystem, originText, destinationText, preference, locale]
  )

  const canCalculate =
    (originSystem !== null || originText.trim().length > 0) &&
    (destinationSystem !== null || destinationText.trim().length > 0)

  const routeQuery = useQuery({
    queryKey: queryKeys.route(routeInput),
    queryFn: () => fetchRoute(routeInput),
    enabled: false,
  })

  const result = routeQuery.data ?? null
  const error = routeQuery.error instanceof Error ? routeQuery.error.message : null

  const summary = useMemo(() => {
    if (!result) return null
    if (result.isFullyHighSec) {
      return { label: t("map.route.safe"), tone: "text-emerald-400" }
    }
    if (result.hasNullSec) {
      return { label: t("map.route.dangerous"), tone: "text-red-400" }
    }
    return { label: t("map.route.mixed"), tone: "text-amber-400" }
  }, [result, t])

  function securityLabel(securityClass: RouteResult["systems"][number]["securityClass"]) {
    if (securityClass === "high") return t("map.sec.high")
    if (securityClass === "low") return t("map.sec.low")
    return t("map.sec.null")
  }

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="space-y-1 border-b border-border/50 pb-4">
        <h1 className="text-3xl font-semibold tracking-tight">{t("map.title")}</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">{t("map.description")}</p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr_auto] lg:items-end">
        <SystemSearch
          id="origin"
          label={t("map.origin")}
          value={originText}
          selectedSystemId={originSystem?.systemId ?? null}
          placeholder={t("map.originPlaceholder")}
          onValueChange={setOriginText}
          onSelect={setOriginSystem}
        />

        <div className="hidden items-center justify-center pb-2 text-muted-foreground lg:flex">
          →
        </div>

        <SystemSearch
          id="destination"
          label={t("map.destination")}
          value={destinationText}
          selectedSystemId={destinationSystem?.systemId ?? null}
          placeholder={t("map.destinationPlaceholder")}
          onValueChange={setDestinationText}
          onSelect={setDestinationSystem}
        />

        <div className="space-y-1.5">
          <Label htmlFor="preference">{t("map.preference")}</Label>
          <select
            id="preference"
            className={selectClassName}
            value={preference}
            onChange={(event) => setPreference(event.target.value as typeof preference)}
          >
            <option value="secure">{t("map.pref.secure")}</option>
            <option value="shorter">{t("map.pref.shorter")}</option>
            <option value="insecure">{t("map.pref.insecure")}</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        {originSystem ? (
          <span>
            {t("map.originSelected")}{" "}
            <span className="text-foreground">{originSystem.name}</span>
          </span>
        ) : null}
        {destinationSystem ? (
          <span>
            {t("map.destinationSelected")}{" "}
            <span className="text-foreground">{destinationSystem.name}</span>
          </span>
        ) : null}
      </div>

      <div>
        <Button
          type="button"
          disabled={!canCalculate || routeQuery.isFetching}
          onClick={() => void routeQuery.refetch()}
        >
          {routeQuery.isFetching ? t("map.calculating") : t("map.calculate")}
        </Button>
      </div>

      {error ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {result && summary ? (
        <section className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-md border border-border/60 bg-card/40 p-3">
              <div className="text-[11px] tracking-wide text-muted-foreground uppercase">
                {t("map.result.origin")}
              </div>
              <div className="mt-1 font-medium">{result.origin.name}</div>
              <div className={cn("font-mono text-xs", securityTone(result.origin.securityClass))}>
                {formatSecurity(result.origin.securityStatus)} ·{" "}
                {securityLabel(result.origin.securityClass)}
              </div>
            </div>
            <div className="rounded-md border border-border/60 bg-card/40 p-3">
              <div className="text-[11px] tracking-wide text-muted-foreground uppercase">
                {t("map.result.destination")}
              </div>
              <div className="mt-1 font-medium">{result.destination.name}</div>
              <div
                className={cn(
                  "font-mono text-xs",
                  securityTone(result.destination.securityClass)
                )}
              >
                {formatSecurity(result.destination.securityStatus)} ·{" "}
                {securityLabel(result.destination.securityClass)}
              </div>
            </div>
            <div className="rounded-md border border-border/60 bg-card/40 p-3">
              <div className="text-[11px] tracking-wide text-muted-foreground uppercase">
                {t("map.result.jumps")}
              </div>
              <div className="mt-1 font-mono text-xl tabular-nums">{result.jumps}</div>
            </div>
            <div className="rounded-md border border-border/60 bg-card/40 p-3">
              <div className="text-[11px] tracking-wide text-muted-foreground uppercase">
                {t("market.col.security")}
              </div>
              <div className={cn("mt-1 text-sm font-medium", summary.tone)}>
                {summary.label}
              </div>
            </div>
          </div>

          <div className="rounded-md border border-border/60 bg-card/40">
            <div className="border-b border-border/50 px-3 py-2 text-sm font-medium">
              {t("map.result.systems")} ({result.systems.length})
            </div>
            <ol className="divide-y divide-border/40">
              {result.systems.map((system, index) => (
                <li
                  key={`${system.systemId}-${index}`}
                  className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="w-8 font-mono text-xs text-muted-foreground tabular-nums">
                      {index + 1}
                    </span>
                    <span className="truncate font-medium">{system.name}</span>
                  </div>
                  <div
                    className={cn(
                      "shrink-0 font-mono text-xs tabular-nums",
                      securityTone(system.securityClass)
                    )}
                  >
                    {formatSecurity(system.securityStatus)} ·{" "}
                    {securityLabel(system.securityClass)}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      ) : null}
    </div>
  )
}
