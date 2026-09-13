"use client"

import { useEffect, useId, useMemo, useRef, useState } from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { filterSystems, type NamedSystem } from "@/data/systems"
import { useSystemsQuery } from "@/lib/hooks/queries"
import { useT } from "@/stores/locale-store"
import { cn } from "@/lib/utils"

export type SystemOption = NamedSystem

type SystemSearchProps = {
  id?: string
  label: string
  value: string
  selectedSystemId: number | null
  placeholder?: string
  onValueChange: (value: string) => void
  onSelect: (system: SystemOption) => void
}

export function SystemSearch({
  id,
  label,
  value,
  selectedSystemId,
  placeholder,
  onValueChange,
  onSelect,
}: SystemSearchProps) {
  const t = useT()
  const generatedId = useId()
  const inputId = id ?? generatedId
  const [open, setOpen] = useState(false)
  const blurTimer = useRef<number | null>(null)

  const localResults = useMemo(() => filterSystems(value, 12), [value])
  const systemsQuery = useSystemsQuery(value, open)

  const results = useMemo(() => {
    const remote = value.trim().length < 2 ? [] : (systemsQuery.data ?? [])
    const byId = new Map<number, SystemOption>()
    for (const system of [...remote, ...localResults]) {
      if (!byId.has(system.systemId)) {
        byId.set(system.systemId, system)
      }
    }
    return [...byId.values()].slice(0, 15)
  }, [localResults, systemsQuery.data, value])

  useEffect(() => {
    return () => {
      if (blurTimer.current !== null) {
        window.clearTimeout(blurTimer.current)
      }
    }
  }, [])

  return (
    <div className="relative space-y-1.5">
      <Label htmlFor={inputId}>{label}</Label>
      <Input
        id={inputId}
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        className="font-mono"
        onChange={(event) => {
          onValueChange(event.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          blurTimer.current = window.setTimeout(() => setOpen(false), 150)
        }}
      />

      {open ? (
        <ul className="absolute z-40 mt-1 max-h-72 w-full overflow-auto rounded-md border border-border bg-popover shadow-lg">
          {systemsQuery.isFetching && results.length === 0 ? (
            <li className="px-3 py-2 text-sm text-muted-foreground">{t("map.searching")}</li>
          ) : null}

          {!systemsQuery.isFetching && results.length === 0 ? (
            <li className="px-3 py-2 text-sm text-muted-foreground">
              {t("map.noLocations", { query: value || "…" })}
            </li>
          ) : null}

          {results.map((system) => (
            <li key={system.systemId}>
              <button
                type="button"
                className={cn(
                  "flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-accent",
                  selectedSystemId === system.systemId && "bg-accent/60"
                )}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onSelect(system)
                  setOpen(false)
                }}
              >
                <span className="font-medium">{system.name}</span>
                <span className="shrink-0 font-mono text-xs text-muted-foreground">
                  {system.region ?? `ID ${system.systemId}`}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
