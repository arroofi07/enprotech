"use client";

import { DataTable } from "@/components/ui/data-table";
import type { AssessmentAttemptRecord } from "@/lib/infrastructure/db/repositories/assessment-repository";

type AssessmentAttemptHistoryProps = {
  attempts: AssessmentAttemptRecord[];
  passingGrade: number;
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function AssessmentAttemptHistory({
  attempts,
  passingGrade,
}: AssessmentAttemptHistoryProps) {
  return (
    <DataTable
      data={attempts}
      getRowKey={(attempt) => attempt.id}
      emptyState={{ message: "Belum ada riwayat attempt." }}
      columns={[
        {
          id: "submittedAt",
          header: "Waktu Submit",
          cell: (attempt) => (
            <span className="text-sm">
              {attempt.submittedAt ? formatDate(attempt.submittedAt) : "—"}
            </span>
          ),
        },
        {
          id: "score",
          header: "Nilai",
          cell: (attempt) => (
            <span className="font-medium">{attempt.score}%</span>
          ),
        },
        {
          id: "status",
          header: "Status",
          cell: (attempt) => (
            <span
              className={
                attempt.score >= passingGrade
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-destructive"
              }
            >
              {attempt.score >= passingGrade ? "Lulus" : "Belum Lulus"}
            </span>
          ),
        },
      ]}
    />
  );
}
