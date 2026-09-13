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
import type { MarketOrderRow } from "@/types/market"

type BuyersTableProps = {
  rows: MarketOrderRow[]
  now?: number
}

export function BuyersTable({ rows, now }: BuyersTableProps) {
  const { page, setPage, totalPages, pageSize, totalItems, pagedRows } =
    usePagedRows(rows)

  return (
    <section className="space-y-2">
      <h2 className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
        Compradores
      </h2>
      <div className="rounded-md border border-border/60 bg-card/40">
        <Table className="text-xs">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Región</TableHead>
              <TableHead className="text-right">Cantidad</TableHead>
              <TableHead className="text-right">Precio</TableHead>
              <TableHead>Ubicación</TableHead>
              <TableHead className="text-right">Seguridad</TableHead>
              <TableHead>Alcance</TableHead>
              <TableHead className="text-right">Vol. mínimo</TableHead>
              <TableHead>Actualizado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagedRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                  No hay órdenes de compra.
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
                  <TableCell>{formatRange(row.range)}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {formatQuantity(row.minVolume)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {formatRelativeTime(row.updatedAt, now)}
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
