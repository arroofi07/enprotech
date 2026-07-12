import { IconChevronRight } from "@tabler/icons-react";

import { TrainingStatusBadge } from "@/components/trainings/training-status-badge";
import { ButtonLink } from "@/components/ui/button-link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatTrainingDeadline } from "@/lib/domain/trainings/format-deadline";
import type { EnrolledTrainingRecord } from "@/lib/infrastructure/db/repositories/training-repository";

type StudentTrainingCardProps = {
  training: EnrolledTrainingRecord;
};

export function StudentTrainingCard({ training }: StudentTrainingCardProps) {
  const deadlineLabel = formatTrainingDeadline(training.deadline, "long");

  return (
    <Card className="flex h-full flex-col overflow-hidden">
        {training.thumbnail ? (
          <div className="aspect-video w-full overflow-hidden bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={training.thumbnail}
              alt={training.title}
              className="h-full w-full object-cover"
            />
          </div>
        ) : null}
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <CardTitle className="text-lg">{training.title}</CardTitle>
              {training.description ? (
                <CardDescription className="line-clamp-2">
                  {training.description}
                </CardDescription>
              ) : null}
            </div>
            <TrainingStatusBadge status={training.status} />
          </div>
        </CardHeader>
        <CardContent className="flex-1 space-y-4">
          {deadlineLabel ? (
            <p className="text-sm text-muted-foreground">
              Deadline: {deadlineLabel}
            </p>
          ) : null}

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{training.progressPercent}%</span>
            </div>
            <Progress value={training.progressPercent} />
            <p className="text-xs text-muted-foreground">
              {training.completedItems} dari {training.totalItems} item selesai
            </p>
            <p className="text-xs text-muted-foreground">
              Modul {training.completedModules}/{training.totalModules} · Quiz{" "}
              {training.completedQuizzes}/{training.totalQuizzes} · Latihan{" "}
              {training.completedLatihans}/{training.totalLatihans}
            </p>
          </div>
        </CardContent>
        <CardFooter className="border-t bg-muted/20 pt-4">
          <ButtonLink
            className="w-full"
            href={`/student/trainings/${training.id}`}
          >
            Lihat Detail
            <IconChevronRight data-icon="inline-end" className="size-4" />
          </ButtonLink>
        </CardFooter>
      </Card>
  );
}
