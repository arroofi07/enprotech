import type { ComponentType, ReactNode } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type DataTableColumn<T> = {
  id: string;
  header: ReactNode;
  cell: (item: T) => ReactNode;
  className?: string;
  headerClassName?: string;
};

export type DataTableEmptyState = {
  message: string;
  icon?: ComponentType<{ className?: string }>;
};

export type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  data: T[];
  getRowKey: (item: T) => string;
  emptyState?: DataTableEmptyState;
  className?: string;
};

const DEFAULT_EMPTY_MESSAGE = "Tidak ada data yang ditampilkan.";

export function DataTable<T>({
  columns,
  data,
  getRowKey,
  emptyState,
  className,
}: DataTableProps<T>) {
  if (data.length === 0) {
    const message = emptyState?.message ?? DEFAULT_EMPTY_MESSAGE;
    const Icon = emptyState?.icon;

    if (Icon) {
      return (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-16">
          <div className="rounded-full bg-muted p-4">
            <Icon className="size-8 text-muted-foreground" />
          </div>
          <p className="mt-4 text-sm font-medium text-muted-foreground">
            {message}
          </p>
        </div>
      );
    }

    return (
      <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        {message}
      </p>
    );
  }

  return (
    <div className={cn("overflow-hidden rounded-lg border", className)}>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            {columns.map((column) => (
              <TableHead
                key={column.id}
                className={column.headerClassName}
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={getRowKey(item)} className="align-middle">
              {columns.map((column) => (
                <TableCell key={column.id} className={column.className}>
                  {column.cell(item)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
