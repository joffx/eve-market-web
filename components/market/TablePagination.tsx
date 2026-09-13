"use client"

import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { useT } from "@/stores/locale-store"

export const MARKET_PAGE_SIZE = 25

export function usePagedRows<T>(rows: T[], pageSize = MARKET_PAGE_SIZE) {
  const resetKey = `${rows.length}:${String((rows[0] as { orderId?: number } | undefined)?.orderId ?? "")}`
  const [page, setPage] = useState(1)
  const [trackedKey, setTrackedKey] = useState(resetKey)

  if (trackedKey !== resetKey) {
    setTrackedKey(resetKey)
    setPage(1)
  }

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize))
  const safePage = Math.min(page, totalPages)

  const pagedRows = useMemo(() => {
    const start = (safePage - 1) * pageSize
    return rows.slice(start, start + pageSize)
  }, [rows, safePage, pageSize])

  return {
    page: safePage,
    setPage,
    totalPages,
    pageSize,
    totalItems: rows.length,
    pagedRows,
  }
}

type TablePaginationProps = {
  page: number
  totalPages: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
}

export function TablePagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: TablePaginationProps) {
  const t = useT()

  if (totalItems === 0) {
    return null
  }

  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, totalItems)

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-1 pt-2 text-xs text-muted-foreground">
      <p>{t("pagination.showing", { from, to, total: totalItems, pageSize })}</p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          {t("pagination.prev")}
        </Button>
        <span className="font-mono tabular-nums">
          {page} / {totalPages}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          {t("pagination.next")}
        </Button>
      </div>
    </div>
  )
}
