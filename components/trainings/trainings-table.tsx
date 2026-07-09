import { TrainingStatusBadge } from "@/components/trainings/training-status-badge";
import { ButtonLink } from "@/components/ui/button-link";
import { DataTable } from "@/components/ui/data-table";
import { formatTrainingDeadline } from "@/lib/domain/trainings/format-deadline";
import type { TrainingRecord } from "@/lib/infrastructure/db/repositories/training-repository";

type TrainingsTableProps = {
  trainings: TrainingRecord[];
};

export function TrainingsTable({ trainings }: TrainingsTableProps) {
  return (
    <DataTable
      data={trainings}
      getRowKey={(training) => training.id}
      emptyState={{
        message: "Tidak ada training yang cocok dengan filter.",
      }}
      columns={[
        {
          id: "title",
          header: "Judul",
          cell: (training) => (
            <span className="font-medium">{training.title}</span>
          ),
        },
        {
          id: "status",
          header: "Status",
          cell: (training) => <TrainingStatusBadge status={training.status} />,
        },
        {
          id: "passingGrade",
          header: "Passing Grade",
          cell: (training) => `${training.passingGrade}%`,
        },
        {
          id: "deadline",
          header: "Deadline",
          cell: (training) => formatTrainingDeadline(training.deadline) ?? "—",
        },
        {
          id: "actions",
          header: "Aksi",
          headerClassName: "text-right",
          className: "text-right",
          cell: (training) => (
            <ButtonLink
              variant="outline"
              size="xs"
              href={`/trainer/trainings/${training.id}/edit`}
            >
              Kelola
            </ButtonLink>
          ),
        },
      ]}
    />
  );
}
