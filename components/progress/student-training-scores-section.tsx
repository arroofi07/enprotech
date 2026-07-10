import Link from "next/link";

import {
  AssessmentProgressBadge,
} from "@/components/progress/assessment-progress-badge";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  AssessmentProgressItem,
  StudentTrainingProgress,
} from "@/lib/domain/trainings/progress-types";
import { formatTrainingDeadline } from "@/lib/domain/trainings/format-deadline";

type StudentTrainingScoresSectionProps = {
  progress: StudentTrainingProgress;
};

function formatScoreCell(item: AssessmentProgressItem): string {
  if (item.status === "locked") {
    return "—";
  }

  if (item.bestScore === null) {
    return "—";
  }

  return `${item.bestScore}%`;
}

export function StudentTrainingScoresSection({
  progress,
}: StudentTrainingScoresSectionProps) {
  const deadlineLabel = formatTrainingDeadline(progress.deadline, "long");
  const trainingHref = `/student/trainings/${progress.trainingId}`;

  return (
    <Card>
      <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <CardTitle className="text-lg">{progress.trainingTitle}</CardTitle>
          {deadlineLabel ? (
            <p className="text-sm text-muted-foreground">
              Deadline: {deadlineLabel}
            </p>
          ) : null}
          <p className="text-sm text-muted-foreground">
            Progress: {progress.summary.progressPercent}% (
            {progress.summary.completedItems}/{progress.summary.totalItems} item)
          </p>
        </div>
        <ButtonLink href={trainingHref} variant="outline" size="sm">
          Lihat detail
        </ButtonLink>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Assessment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Nilai Tertinggi</TableHead>
              <TableHead className="text-right">Passing Grade</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Pre-Test</TableCell>
              <TableCell>
                <AssessmentProgressBadge status={progress.summary.preTest.status} />
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatScoreCell(progress.summary.preTest)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {progress.summary.preTest.passingGrade}%
              </TableCell>
            </TableRow>

            {progress.modules.flatMap((module) => [
              <TableRow key={`${module.id}-quiz`}>
                <TableCell className="font-medium">
                  {module.title} — Quiz
                </TableCell>
                <TableCell>
                  <AssessmentProgressBadge status={module.quiz.status} />
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatScoreCell(module.quiz)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {module.quiz.passingGrade}%
                </TableCell>
              </TableRow>,
              <TableRow key={`${module.id}-latihan`}>
                <TableCell className="font-medium">
                  {module.title} — Latihan
                </TableCell>
                <TableCell>
                  <AssessmentProgressBadge status={module.latihan.status} />
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatScoreCell(module.latihan)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {module.latihan.passingGrade}%
                </TableCell>
              </TableRow>,
            ])}

            <TableRow>
              <TableCell className="font-medium">Post-Test</TableCell>
              <TableCell>
                <AssessmentProgressBadge status={progress.summary.postTest.status} />
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatScoreCell(progress.summary.postTest)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {progress.summary.postTest.passingGrade}%
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <p className="mt-4 text-xs text-muted-foreground">
          Nilai tertinggi dihitung dari attempt terbaik per assessment.{" "}
          <Link href={trainingHref} className="text-primary hover:underline">
            Buka halaman training
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
