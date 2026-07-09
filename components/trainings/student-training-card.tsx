import Link from "next/link";

import { TrainingStatusBadge } from "@/components/trainings/training-status-badge";
import {
  Card,
  CardContent,
  CardDescription,
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
    <Link href={`/student/trainings/${training.id}`} className="block h-full">
    <Card className="h-full overflow-hidden transition-colors hover:bg-muted/40">
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
      <CardContent className="space-y-4">
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
            {training.completedModules} dari {training.totalModules} modul selesai
          </p>
        </div>
      </CardContent>
    </Card>
    </Link>
  );
}
