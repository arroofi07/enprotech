import { IconClock } from "@tabler/icons-react";

import { AssessmentTimeLimitRowForm } from "@/components/assessments/assessment-time-limit-row-form";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import type { TrainingTimeLimitRow } from "@/lib/application/assessments/list-training-time-limits";

type TrainingTimeLimitPanelProps = {
  trainingId: string;
  rows: TrainingTimeLimitRow[];
};

export function TrainingTimeLimitPanel({
  trainingId,
  rows,
}: TrainingTimeLimitPanelProps) {
  return (
    <DataTable
      data={rows}
      getRowKey={(row) => row.assessmentId}
      emptyState={{
        message: "Belum ada assessment pada training ini.",
        icon: IconClock,
      }}
      columns={[
        {
          id: "label",
          header: "Assessment",
          cell: (row) => <span className="font-medium">{row.label}</span>,
        },
        {
          id: "questions",
          header: "Jumlah Soal",
          cell: (row) =>
            row.questionCount > 0 ? (
              <Badge variant="secondary">{row.questionCount} soal</Badge>
            ) : (
              <Badge variant="outline">Belum ada soal</Badge>
            ),
        },
        {
          id: "timeLimit",
          header: "Batas Waktu (menit)",
          cell: (row) => (
            <AssessmentTimeLimitRowForm
              assessmentId={row.assessmentId}
              trainingId={trainingId}
              moduleId={row.moduleId}
              type={row.type}
              timeLimit={row.timeLimit}
            />
          ),
        },
      ]}
    />
  );
}
