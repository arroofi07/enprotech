"use client";

import { IconSearch } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useQueryFilters } from "@/hooks/use-query-filters";

type ModuleAssessmentHubFiltersProps = {
  search?: string;
};

export function ModuleAssessmentHubFilters({
  search,
}: ModuleAssessmentHubFiltersProps) {
  const { isPending, onFilterSubmit } = useQueryFilters();

  return (
    <form
      onSubmit={onFilterSubmit}
      className="flex flex-col gap-4 sm:flex-row sm:items-end"
    >
      <div className="flex-1 space-y-2">
        <Label htmlFor="search" className="text-sm font-medium">
          Cari Modul
        </Label>
        <div className="relative">
          <IconSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="search"
            name="search"
            placeholder="Cari nama training atau modul..."
            defaultValue={search ?? ""}
            className="h-10 pl-9"
          />
        </div>
      </div>

      <Button type="submit" className="h-10" disabled={isPending}>
        {isPending ? <Spinner className="size-4" /> : null}
        Terapkan Filter
      </Button>
    </form>
  );
}
