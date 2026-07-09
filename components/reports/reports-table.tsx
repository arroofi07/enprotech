"use client";

import { IconFileSpreadsheet, IconFileTypePdf } from "@tabler/icons-react";

import { StudentReportDetailDialog } from "@/components/reports/student-report-detail-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { cn } from "@/lib/utils";
import {
  formatEnrollmentStatus,
  formatModuleStatus,
  formatScore,
} from "@/lib/domain/reports/format-labels";
import type { TrainingReportRow } from "@/lib/domain/reports/types";

type ReportsTableProps = {
  rows: TrainingReportRow[];
};

function StatusBadge({ label }: { label: string }) {
  return (
    <Badge variant="secondary" className="font-normal">
      {label}
    </Badge>
  );
}

export function ReportsTable({ rows }: ReportsTableProps) {
  return (
    <DataTable
      data={rows}
      getRowKey={(row) => row.rowKey}
      emptyState={{
        message: "Tidak ada data rekap yang cocok dengan filter.",
      }}
      columns={[
        {
          id: "studentName",
          header: "Student",
          cell: (row) => (
            <div>
              <p className="font-medium">{row.studentName}</p>
              <p className="text-xs text-muted-foreground">{row.studentEmail}</p>
            </div>
          ),
        },
        {
          id: "trainingTitle",
          header: "Training",
          cell: (row) => row.trainingTitle,
        },
        {
          id: "moduleTitle",
          header: "Modul",
          cell: (row) => row.moduleTitle,
        },
        {
          id: "quizScore",
          header: "Quiz",
          cell: (row) => formatScore(row.quizScore),
        },
        {
          id: "latihanScore",
          header: "Latihan",
          cell: (row) => formatScore(row.latihanScore),
        },
        {
          id: "moduleStatus",
          header: "Status",
          cell: (row) => (
            <StatusBadge label={formatModuleStatus(row.moduleStatus)} />
          ),
        },
        {
          id: "enrollmentStatus",
          header: "Enrollment",
          cell: (row) => (
            <StatusBadge label={formatEnrollmentStatus(row.enrollmentStatus)} />
          ),
        },
        {
          id: "actions",
          header: "Detail",
          headerClassName: "text-right",
          className: "text-right",
          cell: (row) => (
            <StudentReportDetailDialog
              studentId={row.studentId}
              trainingId={row.trainingId}
            />
          ),
        },
      ]}
    />
  );
}

export function ReportExportButtons({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  function buildExportHref(format: "xlsx" | "pdf") {
    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(searchParams)) {
      if (value && key !== "page") {
        params.set(key, value);
      }
    }

    params.set("format", format);
    return `/api/reports/training/export?${params.toString()}`;
  }

  return (
    <div className="flex flex-wrap gap-2">
      <a
        href={buildExportHref("xlsx")}
        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
      >
        <IconFileSpreadsheet className="size-4" />
        Export Excel
      </a>
      <a
        href={buildExportHref("pdf")}
        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
      >
        <IconFileTypePdf className="size-4" />
        Export PDF
      </a>
    </div>
  );
}
