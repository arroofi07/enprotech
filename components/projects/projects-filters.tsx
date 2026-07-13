"use client";

import { IconSearch } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useQueryFilters } from "@/hooks/use-query-filters";
import type { ReportFilterOption } from "@/lib/infrastructure/db/repositories/report-repository";

type ProjectsFiltersProps = {
  search?: string;
  trainingId?: string;
  trainings: ReportFilterOption[];
};

const selectClassName =
  "flex h-10 w-full min-w-36 rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30";

export function ProjectsFilters({
  search,
  trainingId,
  trainings,
}: ProjectsFiltersProps) {
  const { isPending, onFilterSubmit } = useQueryFilters();

  return (
    <form
      onSubmit={onFilterSubmit}
      className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
    >
      <div className="space-y-2 xl:col-span-2">
        <Label htmlFor="search" className="text-sm font-medium">
          Cari Peserta
        </Label>
        <div className="relative">
          <IconSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="search"
            name="search"
            placeholder="Cari nama atau email peserta..."
            defaultValue={search ?? ""}
            className="h-10 pl-9"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="trainingId" className="text-sm font-medium">
          Training
        </Label>
        <select
          id="trainingId"
          name="trainingId"
          defaultValue={trainingId ?? ""}
          className={selectClassName}
        >
          <option value="">Semua Training</option>
          {trainings.map((training) => (
            <option key={training.id} value={training.id}>
              {training.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-end md:col-span-2 xl:col-span-3">
        <Button type="submit" className="h-10" disabled={isPending}>
          {isPending ? <Spinner className="size-4" /> : null}
          Terapkan Filter
        </Button>
      </div>
    </form>
  );
}
