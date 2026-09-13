"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  TablePagination,
  usePagedRows,
} from "@/components/market/TablePagination"
import {
  formatIsk,
  formatQuantity,
  formatRange,
  formatRelativeTime,
  formatSecurity,
} from "@/lib/format"
import { useLocaleStore, useT } from "@/stores/locale-store"
import type { MarketOrderRow } from "@/types/market"

type BuyersTableProps = {
  rows: MarketOrderRow[]
  now?: number
}

export function BuyersTable({ rows, now }: BuyersTableProps) {
  const t = useT()
  const locale = useLocaleStore((state) => state.locale)
  const { page, setPage, totalPages, pageSize, totalItems, pagedRows } =
    usePagedRows(rows)

  return (
    <section className="space-y-2">
      <h2 className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
        {t("market.buyers.title")}
      </h2>
      <div className="rounded-md border border-border/60 bg-card/40">
        <Table className="text-xs">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>{t("market.col.region")}</TableHead>
              <TableHead className="text-right">{t("market.col.quantity")}</TableHead>
              <TableHead className="text-right">{t("market.col.price")}</TableHead>
              <TableHead>{t("market.col.location")}</TableHead>
              <TableHead className="text-right">{t("market.col.security")}</TableHead>
              <TableHead>{t("market.col.range")}</TableHead>
              <TableHead className="text-right">{t("market.col.minVolume")}</TableHead>
              <TableHead>{t("market.col.updated")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagedRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                  {t("market.noBuyOrders")}
                </TableCell>
              </TableRow>
            ) : (
              pagedRows.map((row) => (
                <TableRow key={row.orderId}>
                  <TableCell>{row.regionName}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {formatQuantity(row.quantity)}
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums text-emerald-400">
                    {formatIsk(row.price)}
                  </TableCell>
                  <TableCell className="max-w-[28rem] truncate" title={row.locationName}>
                    {row.locationName}
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {formatSecurity(row.securityStatus)}
                  </TableCell>
                  <TableCell>{formatRange(row.range, locale)}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {formatQuantity(row.minVolume)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {formatRelativeTime(row.issued, now, locale)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <TablePagination
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={setPage}
      />
    </section>
  )
}
