"use client";

import { IconSearch } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useQueryFilters } from "@/hooks/use-query-filters";

type TrainingsFiltersProps = {
  search?: string;
  status?: string;
};

export function TrainingsFilters({ search, status }: TrainingsFiltersProps) {
  const { isPending, onFilterSubmit } = useQueryFilters();

  return (
    <form
      onSubmit={onFilterSubmit}
      className="flex flex-col gap-4 sm:flex-row sm:items-end"
    >
      <div className="flex-1 space-y-2">
        <Label htmlFor="search" className="text-sm font-medium">
          Cari Training
        </Label>
        <div className="relative">
          <IconSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="search"
            name="search"
            placeholder="Cari judul training..."
            defaultValue={search ?? ""}
            className="h-10 pl-9"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="status" className="text-sm font-medium">
          Status
        </Label>
        <select
          id="status"
          name="status"
          defaultValue={status ?? ""}
          className="flex h-10 w-full min-w-36 rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
        >
          <option value="">Semua Status</option>
          <option value="draft">Draft</option>
          <option value="active">Aktif</option>
          <option value="completed">Selesai</option>
          <option value="archived">Arsip</option>
        </select>
      </div>

      <Button type="submit" className="h-10" disabled={isPending}>
        {isPending ? <Spinner className="size-4" /> : null}
        Terapkan Filter
      </Button>
    </form>
  );
}
