"use client"

import { useMemo, useState } from "react"
import Link from "next/link"

import { SystemSearch, type SystemOption } from "@/components/map/SystemSearch"
import { ResourceSecurityBadge } from "@/components/market/ResourceSecurityBadge"
import { SecurityBadge } from "@/components/market/SecurityBadge"
import { TypeIcon } from "@/components/market/TypeIcon"
import { buttonVariants } from "@/components/ui/button"
import { Button } from "@/components/ui/button"
import {
  useStrategyBuyersQuery,
  useStrategyMinesQuery,
  useTopsQuery,
} from "@/lib/hooks/queries"
import { fetchRoute } from "@/lib/api/client"
import {
  buildPlanAdvice,
  estimateSessionEarnings,
  type SessionMinutes,
} from "@/lib/eve/earnings"
import { formatIsk, formatQuantity } from "@/lib/format"
import type { StrategyBuyHub, StrategyMineSite } from "@/lib/api/client"
import {
  BASE_RESOURCES,
  getResourceSecurity,
  type MarketResource,
} from "@/data/resources"
import { useMarketStore } from "@/stores/market-store"
import { useLocaleStore, useT } from "@/stores/locale-store"
import { cn } from "@/lib/utils"
import type { MessageKey } from "@/lib/i18n/messages"

type WizardStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8

type ExtractCategory = "ore" | "gas" | "ice" | "moon"

const TOTAL_STEPS = 8

const STEP_TITLE: Record<WizardStep, MessageKey> = {
  1: "strategy.step.category",
  2: "strategy.step.resource",
  3: "strategy.step.prices",
  4: "strategy.step.sell",
  5: "strategy.step.mines",
  6: "strategy.step.location",
  7: "strategy.step.session",
  8: "strategy.step.plan",
}

const CATEGORIES: Array<{
  id: ExtractCategory
  labelKey: MessageKey
  enabled: boolean
}> = [
  { id: "ore", labelKey: "strategy.cat.ore", enabled: true },
  { id: "gas", labelKey: "strategy.cat.gas", enabled: true },
  { id: "ice", labelKey: "strategy.cat.ice", enabled: false },
  { id: "moon", labelKey: "strategy.cat.moon", enabled: false },
]

const SESSION_OPTIONS: Array<{ minutes: SessionMinutes; labelKey: MessageKey }> = [
  { minutes: 30, labelKey: "strategy.session.30" },
  { minutes: 60, labelKey: "strategy.session.60" },
  { minutes: 120, labelKey: "strategy.session.120" },
  { minutes: 240, labelKey: "strategy.session.240" },
]

const ADVICE_KEY: Record<string, MessageKey> = {
  ok: "strategy.advice.ok",
  far: "strategy.advice.far",
  lowYield: "strategy.advice.lowYield",
  shortSession: "strategy.advice.shortSession",
}

export function StrategyView() {
  const t = useT()
  const locale = useLocaleStore((state) => state.locale)
  const setSelectedTypeId = useMarketStore((state) => state.setSelectedTypeId)

  const [step, setStep] = useState<WizardStep>(1)
  const [category, setCategory] = useState<ExtractCategory | null>(null)
  const [resource, setResource] = useState<MarketResource | null>(null)
  const [sellHub, setSellHub] = useState<StrategyBuyHub | null>(null)
  const [mineSite, setMineSite] = useState<StrategyMineSite | null>(null)
  const [locationText, setLocationText] = useState("Amarr")
  const [origin, setOrigin] = useState<SystemOption | null>({
    systemId: 30002187,
    name: "Amarr",
    region: "Domain",
  })
  const [sessionMinutes, setSessionMinutes] = useState<SessionMinutes | null>(null)
  const [mineSearchText, setMineSearchText] = useState("")
  const [manualMineLoading, setManualMineLoading] = useState(false)
  const [manualMineError, setManualMineError] = useState<string | null>(null)
  const [manualSecWarning, setManualSecWarning] = useState(false)

  const topsQuery = useTopsQuery()
  const buyersQuery = useStrategyBuyersQuery({
    typeId: resource?.typeId ?? null,
    enabled: step >= 3 && resource !== null,
  })

  // Step 5: sites near sell hub (no origin yet)
  const minesNearSellQuery = useStrategyMinesQuery({
    typeId: resource?.typeId ?? null,
    sellSystemId: sellHub?.systemId ?? null,
    originId: null,
    enabled: step >= 5 && resource !== null && sellHub !== null,
  })

  // After location: re-score with origin for accurate jumps on the chosen site
  const minesWithOriginQuery = useStrategyMinesQuery({
    typeId: resource?.typeId ?? null,
    sellSystemId: sellHub?.systemId ?? null,
    originId: origin?.systemId ?? null,
    enabled:
      step >= 6 && resource !== null && sellHub !== null && origin !== null,
  })

  const priceByType = useMemo(() => {
    const map = new Map<number, number>()
    const snapshot = topsQuery.data
    if (!snapshot) return map
    if (snapshot.resourcePrices?.length) {
      for (const item of snapshot.resourcePrices) {
        map.set(item.typeId, item.averagePrice)
      }
      return map
    }
    for (const list of [snapshot.ores, snapshot.gases, snapshot.minerals]) {
      for (const item of list) {
        map.set(item.typeId, item.averagePrice)
      }
    }
    return map
  }, [topsQuery.data])

  const resources = useMemo(() => {
    if (category !== "ore" && category !== "gas") return []
    return BASE_RESOURCES.filter((item) => item.category === category).sort((a, b) => {
      const priceA = priceByType.get(a.typeId) ?? -1
      const priceB = priceByType.get(b.typeId) ?? -1
      if (priceB !== priceA) {
        return priceB - priceA
      }
      return a.name.localeCompare(b.name)
    })
  }, [category, priceByType])

  const resolvedMine = useMemo(() => {
    if (!mineSite) return null
    const fromOrigin = minesWithOriginQuery.data?.sites.find(
      (site) => site.systemId === mineSite.systemId
    )
    return fromOrigin ?? mineSite
  }, [mineSite, minesWithOriginQuery.data])

  const jumpsFromYou = resolvedMine?.jumpsFromOrigin ?? 0
  const jumpsToMarket = resolvedMine?.jumpsToMarket ?? 0

  const earnings = useMemo(() => {
    if (!resource || !sellHub || !sessionMinutes || !resolvedMine) return null
    return estimateSessionEarnings({
      typeId: resource.typeId,
      pricePerUnit: sellHub.bestPrice,
      sessionMinutes,
      jumpsFromOrigin: jumpsFromYou,
      jumpsToMarket,
    })
  }, [resource, sellHub, sessionMinutes, resolvedMine, jumpsFromYou, jumpsToMarket])

  const advice = useMemo(() => {
    if (!earnings) return []
    return buildPlanAdvice({
      jumpsFromOrigin: jumpsFromYou,
      jumpsToMarket,
      iskPerHour: earnings.iskPerHour,
      miningMinutes: earnings.miningMinutes,
    })
  }, [earnings, jumpsFromYou, jumpsToMarket])

  function goBack() {
    if (step <= 1) return
    const prev = (step - 1) as WizardStep
    setStep(prev)
    if (prev < 8) {
      /* keep plan inputs until earlier resets */
    }
    if (prev < 7) setSessionMinutes(null)
    if (prev < 5) setMineSite(null)
    if (prev < 4) setSellHub(null)
    if (prev < 2) {
      setResource(null)
      setCategory(null)
    }
  }

  function resetFromStep(next: WizardStep) {
    if (next <= 1) {
      setCategory(null)
      setResource(null)
      setSellHub(null)
      setMineSite(null)
      setSessionMinutes(null)
    } else if (next <= 2) {
      setResource(null)
      setSellHub(null)
      setMineSite(null)
      setSessionMinutes(null)
    } else if (next <= 3) {
      setSellHub(null)
      setMineSite(null)
      setSessionMinutes(null)
    } else if (next <= 4) {
      setMineSite(null)
      setSessionMinutes(null)
    } else if (next <= 5) {
      setSessionMinutes(null)
    }
  }

  function restart() {
    setStep(1)
    resetFromStep(1)
  }

  function tryOtherResource() {
    setResource(null)
    setSellHub(null)
    setMineSite(null)
    setSessionMinutes(null)
    setMineSearchText("")
    setManualMineError(null)
    setManualSecWarning(false)
    setStep(2)
  }

  async function selectManualMine(system: SystemOption) {
    if (!sellHub || !resource) return
    setManualMineLoading(true)
    setManualMineError(null)
    setManualSecWarning(false)
    try {
      const required = getResourceSecurity(resource.typeId)
      const preference = required === "high" ? "secure" : "shorter"
      const route = await fetchRoute({
        originId: system.systemId,
        destinationId: sellHub.systemId,
        preference,
        locale,
      })

      if (required && route.origin.securityClass !== required) {
        setManualSecWarning(true)
      }

      setMineSite({
        rank: 0,
        systemId: route.origin.systemId,
        name: route.origin.name,
        securityStatus: route.origin.securityStatus,
        securityClass: route.origin.securityClass,
        jumpsFromOrigin: null,
        jumpsToMarket: route.jumps,
        totalJumps: route.jumps,
      })
      setMineSearchText(route.origin.name)
      setStep(6)
    } catch (error) {
      setManualMineError(
        error instanceof Error ? error.message : t("strategy.api.failed")
      )
    } finally {
      setManualMineLoading(false)
    }
  }

  const buyersError =
    buyersQuery.error instanceof Error ? buyersQuery.error.message : null
  const minesError =
    minesNearSellQuery.error instanceof Error
      ? minesNearSellQuery.error.message
      : null

  return (
    <div className="mx-auto flex w-full max-w-[720px] flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="space-y-2 border-b border-border pb-4">
        <h1 className="text-3xl font-semibold tracking-tight">{t("strategy.title")}</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">{t("strategy.description")}</p>
        <p className="text-sm text-foreground/80">{t("strategy.flowHint")}</p>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs tracking-wide text-muted-foreground uppercase">
          {t("strategy.stepOf", { n: step, total: TOTAL_STEPS })}
        </p>
        {step > 1 ? (
          <Button type="button" variant="ghost" size="sm" onClick={goBack}>
            {t("strategy.back")}
          </Button>
        ) : null}
      </div>

      <nav aria-label="Progress" className="flex gap-1">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => {
          const n = (i + 1) as WizardStep
          return (
            <span
              key={n}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors",
                n <= step ? "bg-primary" : "bg-border"
              )}
            />
          )
        })}
      </nav>

      <h2 className="text-xl font-semibold tracking-tight">{t(STEP_TITLE[step])}</h2>

      {step === 1 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {CATEGORIES.map((item) => (
            <button
              key={item.id}
              type="button"
              disabled={!item.enabled}
              onClick={() => {
                setCategory(item.id)
                resetFromStep(2)
                setStep(2)
              }}
              className={cn(
                "rounded-xl border px-4 py-6 text-left transition-colors",
                item.enabled
                  ? "border-border bg-card hover:border-primary/40 hover:bg-card-elevated"
                  : "cursor-not-allowed border-border/60 bg-muted/30 opacity-60"
              )}
            >
              <span className="text-lg font-semibold">{t(item.labelKey)}</span>
              {!item.enabled ? (
                <span className="mt-1 block text-xs text-muted-foreground">
                  {t("strategy.cat.comingSoon")}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      ) : null}

      {step === 2 && category ? (
        <div className="space-y-2">
          {resources.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("strategy.resource.empty")}</p>
          ) : (
            <ul className="divide-y divide-border rounded-xl border border-border bg-card">
              {resources.map((item) => {
                const avg = priceByType.get(item.typeId)
                return (
                  <li key={item.typeId}>
                    <button
                      type="button"
                      className="flex w-full items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-accent/50"
                      onClick={() => {
                        setResource(item)
                        resetFromStep(3)
                        setStep(3)
                      }}
                    >
                      <TypeIcon typeId={item.typeId} name={item.name} size={32} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {t("strategy.resource.type")}:{" "}
                          {t(category === "ore" ? "strategy.cat.ore" : "strategy.cat.gas")}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-[11px] text-muted-foreground">
                          {t("strategy.resource.price")}
                        </p>
                        <p className="font-mono text-sm tabular-nums text-buy">
                          {avg != null ? formatIsk(avg) : "—"}
                        </p>
                        <div className="mt-1 flex justify-end">
                          <ResourceSecurityBadge typeId={item.typeId} />
                        </div>
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      ) : null}

      {step === 3 && resource ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <TypeIcon typeId={resource.typeId} name={resource.name} size={40} />
            <div>
              <h3 className="text-2xl font-semibold tracking-tight uppercase">
                {resource.name}
              </h3>
              <div className="mt-1">
                <ResourceSecurityBadge typeId={resource.typeId} showLabel />
              </div>
            </div>
          </div>

          {buyersQuery.isFetching ? (
            <p className="text-sm text-muted-foreground">{t("strategy.loadingBuyers")}</p>
          ) : null}
          {buyersError ? (
            <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {buyersError}
            </p>
          ) : null}

          {buyersQuery.data?.best ? (
            <>
              <div className="rounded-xl border border-primary/30 bg-card-elevated p-4">
                <p className="text-xs tracking-wide text-muted-foreground uppercase">
                  {t("strategy.bestBuyPrice")}
                </p>
                <p className="mt-1 font-mono text-2xl tabular-nums text-buy">
                  {formatIsk(buyersQuery.data.best.bestPrice)}
                  <span className="ml-1 text-sm text-muted-foreground">
                    {t("strategy.perUnit")}
                  </span>
                </p>
                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-muted-foreground">{t("strategy.buyQuantity")}</dt>
                    <dd className="font-mono tabular-nums">
                      {formatQuantity(buyersQuery.data.best.buyVolume)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">{t("strategy.marketStation")}</dt>
                    <dd className="font-medium" title={buyersQuery.data.best.locationName}>
                      {buyersQuery.data.best.locationName}
                    </dd>
                  </div>
                </dl>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium">{t("strategy.otherHubs")}</p>
                <ol className="space-y-2">
                  {buyersQuery.data.hubs.map((hub) => (
                    <li
                      key={hub.regionId}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2 text-sm"
                    >
                      <span>
                        <span className="text-muted-foreground">{hub.rank}. </span>
                        {hub.hubName}
                        {hub.recommended ? (
                          <span className="ml-2 text-xs text-primary">
                            {t("strategy.recommended")}
                          </span>
                        ) : null}
                      </span>
                      <span className="font-mono tabular-nums text-buy">
                        {formatIsk(hub.bestPrice)}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>

              <Button type="button" onClick={() => setStep(4)} className="w-full sm:w-auto">
                {t("strategy.continue")}
              </Button>
            </>
          ) : null}

          {buyersQuery.isSuccess && !buyersQuery.data.best ? (
            <p className="text-sm text-muted-foreground">{t("strategy.emptyBuyers")}</p>
          ) : null}
        </div>
      ) : null}

      {step === 4 && buyersQuery.data ? (
        <div className="space-y-3">
          <ul className="space-y-2">
            {buyersQuery.data.hubs.map((hub) => (
              <li key={hub.regionId}>
                <button
                  type="button"
                  onClick={() => {
                    setSellHub(hub)
                    resetFromStep(5)
                    setStep(5)
                  }}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-4 text-left transition-colors",
                    sellHub?.regionId === hub.regionId
                      ? "border-primary/50 bg-primary/10"
                      : "border-border bg-card hover:border-primary/30"
                  )}
                >
                  <div>
                    {hub.recommended ? (
                      <p className="text-xs font-medium text-primary">
                        {t("strategy.recommended")}
                      </p>
                    ) : null}
                    <p className="text-lg font-semibold">{hub.hubName}</p>
                    <p className="max-w-[240px] truncate text-xs text-muted-foreground">
                      {hub.locationName}
                    </p>
                  </div>
                  <p className="font-mono text-lg tabular-nums text-buy">
                    {formatIsk(hub.bestPrice)}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {step === 5 && resource && sellHub ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card-elevated px-4 py-3 text-sm">
            <p>
              <span className="text-muted-foreground">{t("strategy.wantMine")}: </span>
              <span className="font-medium">{resource.name}</span>
            </p>
            <p>
              <span className="text-muted-foreground">{t("strategy.wantSell")}: </span>
              <span className="font-medium">{sellHub.hubName}</span>
            </p>
            <div className="mt-2">
              <ResourceSecurityBadge typeId={resource.typeId} showLabel />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold tracking-[0.14em] text-primary uppercase">
              {t("strategy.mineOptions", { ore: resource.name })}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">{t("strategy.mineHint")}</p>
          </div>

          {minesNearSellQuery.isFetching ? (
            <p className="text-sm text-muted-foreground">{t("strategy.loadingMines")}</p>
          ) : null}
          {minesError ? (
            <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {minesError}
            </p>
          ) : null}

          {minesNearSellQuery.data?.sites.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("strategy.emptyMines")}</p>
          ) : null}

          <ol className="space-y-2">
            {minesNearSellQuery.data?.sites.map((site) => (
              <li key={site.systemId}>
                <button
                  type="button"
                  onClick={() => {
                    setMineSite(site)
                    setManualSecWarning(false)
                    setStep(6)
                  }}
                  className="flex w-full flex-col gap-1 rounded-xl border border-border bg-card px-4 py-3 text-left transition-colors hover:border-primary/40"
                >
                  <p className="font-semibold">
                    <span className="text-muted-foreground">{site.rank}. </span>
                    {site.name}
                    {site.rank === 1 ? (
                      <span className="ml-2 text-xs text-primary">
                        {t("strategy.recommended")}
                      </span>
                    ) : null}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("strategy.toMarketJumps", { n: site.jumpsToMarket })}
                  </p>
                  <p className="text-sm">
                    {t("strategy.security")}:{" "}
                    <SecurityBadge value={site.securityStatus} />
                  </p>
                </button>
              </li>
            ))}
          </ol>

          <div className="space-y-3 rounded-xl border border-border bg-card p-4">
            <SystemSearch
              id="strategy-mine-manual"
              label={t("strategy.mineManual")}
              value={mineSearchText}
              selectedSystemId={mineSite?.systemId ?? null}
              placeholder={t("strategy.mineManualPlaceholder")}
              onValueChange={(value) => {
                setMineSearchText(value)
                setManualMineError(null)
              }}
              onSelect={(system) => {
                void selectManualMine(system)
              }}
            />
            {manualMineLoading ? (
              <p className="text-sm text-muted-foreground">
                {t("strategy.mineManualLoading")}
              </p>
            ) : null}
            {manualMineError ? (
              <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {manualMineError}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      {step === 6 && resource && sellHub && mineSite ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card-elevated px-4 py-3 text-sm">
            <p className="mb-2 text-xs tracking-wide text-muted-foreground uppercase">
              {t("strategy.triangleTitle")}
            </p>
            <p>
              <span className="text-muted-foreground">{t("strategy.wantSell")}: </span>
              <span className="font-medium">{sellHub.hubName}</span>
            </p>
            <p>
              <span className="text-muted-foreground">{t("strategy.plan.mineIn")}: </span>
              <span className="font-medium">{mineSite.name}</span>
            </p>
            <p>
              <span className="text-muted-foreground">{t("strategy.wantMine")}: </span>
              <span className="font-medium">{resource.name}</span>
            </p>
          </div>

          {manualSecWarning && resource ? (
            <p className="rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-warning">
              {t("strategy.mineSecMismatch", {
                sec: t(
                  getResourceSecurity(resource.typeId) === "high"
                    ? "resource.sec.high"
                    : getResourceSecurity(resource.typeId) === "low"
                      ? "resource.sec.low"
                      : "resource.sec.null"
                ),
              })}
            </p>
          ) : null}

          <div className="space-y-4 rounded-xl border border-border bg-card p-4">
            <SystemSearch
              id="strategy-origin"
              label={t("strategy.yourLocation")}
              value={locationText}
              selectedSystemId={origin?.systemId ?? null}
              placeholder={t("strategy.locationPlaceholder")}
              onValueChange={(value) => {
                setLocationText(value)
                setOrigin(null)
              }}
              onSelect={(system) => {
                setOrigin(system)
                setLocationText(system.name)
              }}
            />
            <Button
              type="button"
              disabled={!origin}
              onClick={() => setStep(7)}
              className="w-full sm:w-auto"
            >
              {t("strategy.confirmLocation")}
            </Button>
          </div>
        </div>
      ) : null}

      {step === 7 ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{t("strategy.session.hint")}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {SESSION_OPTIONS.map((option) => (
              <button
                key={option.minutes}
                type="button"
                onClick={() => {
                  setSessionMinutes(option.minutes)
                  setStep(8)
                }}
                className={cn(
                  "rounded-xl border px-4 py-5 text-left transition-colors",
                  sessionMinutes === option.minutes
                    ? "border-primary/50 bg-primary/10"
                    : "border-border bg-card hover:border-primary/30"
                )}
              >
                <span className="text-lg font-semibold">{t(option.labelKey)}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {step === 8 && resource && sellHub && origin && resolvedMine && sessionMinutes ? (
        <div className="space-y-5">
          <div className="rounded-xl border border-primary/30 bg-card p-5">
            <h3 className="text-sm font-semibold tracking-[0.14em] text-primary uppercase">
              {t("strategy.planTitle")}
            </h3>

            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div className="flex items-center gap-3 sm:col-span-2">
                <TypeIcon typeId={resource.typeId} name={resource.name} size={40} />
                <div>
                  <dt className="text-muted-foreground">{t("strategy.plan.resource")}</dt>
                  <dd className="flex flex-wrap items-center gap-2 text-xl font-semibold">
                    {resource.name}
                    <ResourceSecurityBadge typeId={resource.typeId} />
                  </dd>
                </div>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("strategy.plan.price")}</dt>
                <dd className="font-mono tabular-nums text-buy">
                  {formatIsk(sellHub.bestPrice)} {t("strategy.perUnit")}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("strategy.plan.demand")}</dt>
                <dd className="font-mono tabular-nums">
                  {formatQuantity(sellHub.buyVolume)}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("strategy.plan.mineIn")}</dt>
                <dd className="font-medium">{resolvedMine.name}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("strategy.plan.fromYou")}</dt>
                <dd className="font-mono tabular-nums">
                  {t("strategy.jumps", { n: jumpsFromYou })}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("strategy.security")}</dt>
                <dd>
                  <SecurityBadge value={resolvedMine.securityStatus} />
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("strategy.plan.sellIn")}</dt>
                <dd className="font-medium" title={sellHub.locationName}>
                  {sellHub.locationName}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("strategy.plan.fromMine")}</dt>
                <dd className="font-mono tabular-nums">
                  {t("strategy.jumps", { n: jumpsToMarket })}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("strategy.youAreIn")}</dt>
                <dd className="font-medium">{origin.name}</dd>
              </div>
            </dl>

            <p className="mt-4 rounded-md border border-border/60 bg-background-secondary px-3 py-2 text-sm text-muted-foreground">
              {t("strategy.summaryLine", {
                here: origin.name,
                ore: resource.name,
                mine: resolvedMine.name,
                sell: sellHub.hubName,
              })}
            </p>
          </div>

          {earnings ? (
            <div className="rounded-xl border border-border bg-card-elevated p-5">
              <h3 className="text-sm font-semibold tracking-[0.14em] text-primary uppercase">
                {t("strategy.earn.title")}
              </h3>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-muted-foreground">{t("strategy.earn.session")}</dt>
                  <dd className="font-medium">
                    {t(`strategy.session.${sessionMinutes}` as MessageKey)}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">{t("strategy.earn.travel")}</dt>
                  <dd className="font-mono tabular-nums">
                    {t("strategy.earn.minutes", {
                      n: Math.round(earnings.travelMinutes),
                    })}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">{t("strategy.earn.mining")}</dt>
                  <dd className="font-mono tabular-nums">
                    {t("strategy.earn.minutes", {
                      n: Math.round(earnings.miningMinutes),
                    })}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">{t("strategy.earn.units")}</dt>
                  <dd className="font-mono tabular-nums">
                    {formatQuantity(earnings.units)}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">{t("strategy.earn.total")}</dt>
                  <dd className="font-mono text-lg tabular-nums text-buy">
                    {formatIsk(earnings.isk)}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">{t("strategy.earn.perHour")}</dt>
                  <dd className="font-mono tabular-nums text-buy">
                    {formatIsk(earnings.iskPerHour)}
                  </dd>
                </div>
              </dl>
            </div>
          ) : null}

          {advice.length > 0 ? (
            <ul className="space-y-2">
              {advice.map((item) => (
                <li
                  key={item.kind}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-sm",
                    item.severity === "warn"
                      ? "border-warning/40 bg-warning/10 text-warning"
                      : "border-success/30 bg-success/10 text-success"
                  )}
                >
                  {t(ADVICE_KEY[item.kind])}
                </li>
              ))}
            </ul>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Link
              href="/sellers"
              onClick={() => setSelectedTypeId(resource.typeId)}
              className={cn(buttonVariants({ variant: "secondary" }))}
            >
              {t("strategy.openMarket")}
            </Link>
            <Button type="button" variant="outline" onClick={tryOtherResource}>
              {t("strategy.plan.tryOther")}
            </Button>
            <Button type="button" variant="ghost" onClick={restart}>
              {t("strategy.plan.restart")}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
