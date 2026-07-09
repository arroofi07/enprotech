import { TrainingStatusBadge } from "@/components/trainings/training-status-badge";
import { ButtonLink } from "@/components/ui/button-link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatTrainingDeadline } from "@/lib/domain/trainings/format-deadline";
import type { TrainingRecord } from "@/lib/infrastructure/db/repositories/training-repository";

type TrainingsTableProps = {
  trainings: TrainingRecord[];
};

export function TrainingsTable({ trainings }: TrainingsTableProps) {
  if (trainings.length === 0) {
    return (
      <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        Tidak ada training yang cocok dengan filter.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Judul</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Passing Grade</TableHead>
          <TableHead>Deadline</TableHead>
          <TableHead className="text-right">Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {trainings.map((training) => (
          <TableRow key={training.id}>
            <TableCell className="font-medium">{training.title}</TableCell>
            <TableCell>
              <TrainingStatusBadge status={training.status} />
            </TableCell>
            <TableCell>{training.passingGrade}%</TableCell>
            <TableCell>
              {formatTrainingDeadline(training.deadline) ?? "—"}
            </TableCell>
            <TableCell className="text-right">
              <ButtonLink
                variant="outline"
                size="xs"
                href={`/trainer/trainings/${training.id}/edit`}
              >
                Kelola
              </ButtonLink>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
