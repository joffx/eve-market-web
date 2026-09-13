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
  formatRelativeTime,
  formatSecurity,
} from "@/lib/format"
import type { MarketOrderRow } from "@/types/market"

type SellersTableProps = {
  rows: MarketOrderRow[]
  now?: number
}

export function SellersTable({ rows, now }: SellersTableProps) {
  const { page, setPage, totalPages, pageSize, totalItems, pagedRows } =
    usePagedRows(rows)

  return (
    <section className="space-y-2">
      <h2 className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
        Vendedores
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
              <TableHead>Actualizado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagedRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  No hay órdenes de venta.
                </TableCell>
              </TableRow>
            ) : (
              pagedRows.map((row) => (
                <TableRow key={row.orderId}>
                  <TableCell>{row.regionName}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {formatQuantity(row.quantity)}
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {formatIsk(row.price)}
                  </TableCell>
                  <TableCell className="max-w-[28rem] truncate" title={row.locationName}>
                    {row.locationName}
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {formatSecurity(row.securityStatus)}
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
