import { IconSearch } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ReportFilterOption } from "@/lib/infrastructure/db/repositories/report-repository";

type CertificateFiltersProps = {
  search?: string;
  studentId?: string;
  trainingId?: string;
  students: ReportFilterOption[];
  trainings: ReportFilterOption[];
  basePath?: string;
};

const selectClassName =
  "flex h-10 w-full min-w-36 rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30";

export function CertificateFilters({
  search,
  studentId,
  trainingId,
  students,
  trainings,
  basePath = "/trainer/certificates",
}: CertificateFiltersProps) {
  return (
    <form action={basePath} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <div className="space-y-2 xl:col-span-2">
        <Label htmlFor="search" className="text-sm font-medium">
          Cari
        </Label>
        <div className="relative">
          <IconSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="search"
            name="search"
            placeholder="Cari nama, email, atau nomor sertifikat..."
            defaultValue={search ?? ""}
            className="h-10 pl-9"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="studentId" className="text-sm font-medium">
          Student
        </Label>
        <select
          id="studentId"
          name="studentId"
          defaultValue={studentId ?? ""}
          className={selectClassName}
        >
          <option value="">Semua Student</option>
          {students.map((student) => (
            <option key={student.id} value={student.id}>
              {student.label}
            </option>
          ))}
        </select>
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
        <Button type="submit" className="h-10">
          Terapkan Filter
        </Button>
      </div>
    </form>
  );
}
