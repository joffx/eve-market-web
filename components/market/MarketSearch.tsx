"use client"

import { useMemo, useState } from "react"

import { MARKET_RESOURCES, type MarketResource } from "@/data/resources"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type MarketSearchProps = {
  selectedTypeId: number | null
  onSelect: (resource: MarketResource) => void
}

export function MarketSearch({ selectedTypeId, onSelect }: MarketSearchProps) {
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    const pool = MARKET_RESOURCES
    if (!normalized) {
      return pool.filter((r) => !r.parentTypeId).slice(0, 12)
    }
    return pool
      .filter((resource) => resource.name.toLowerCase().includes(normalized))
      .slice(0, 20)
  }, [query])

  const selected = MARKET_RESOURCES.find((r) => r.typeId === selectedTypeId)

  return (
    <div className="relative w-full max-w-xl">
      <label className="mb-1.5 block text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Buscar mineral o mena
      </label>
      <Input
        value={open ? query : (selected?.name ?? query)}
        onChange={(event) => {
          setQuery(event.target.value)
          setOpen(true)
        }}
        onFocus={() => {
          setOpen(true)
          setQuery(selected?.name ?? query)
        }}
        onBlur={() => {
          // Delay so option click registers
          window.setTimeout(() => setOpen(false), 150)
        }}
        placeholder="Ejemplo: Kernite"
        autoComplete="off"
        className="font-mono"
      />
      {open && results.length > 0 ? (
        <ul className="absolute z-40 mt-1 max-h-72 w-full overflow-auto rounded-md border border-border bg-popover shadow-lg">
          {results.map((resource) => (
            <li key={resource.typeId}>
              <button
                type="button"
                className={cn(
                  "flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-accent",
                  selectedTypeId === resource.typeId && "bg-accent/60"
                )}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onSelect(resource)
                  setQuery(resource.name)
                  setOpen(false)
                }}
              >
                <span>{resource.name}</span>
                <span className="font-mono text-xs text-muted-foreground">
                  {resource.category === "mineral"
                    ? "Mineral"
                    : resource.category === "gas"
                      ? "Gas"
                      : "Mena"}
                  {resource.parentTypeId ? " · variante" : ""}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
