import {
  IconBook,
  IconClipboardCheck,
  IconPencil,
  IconSchool,
} from "@tabler/icons-react";

import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  AssessmentProgressBadge,
  formatAssessmentScore,
} from "@/components/progress/assessment-progress-badge";
import { ProgressStatCard } from "@/components/progress/progress-stat-card";
import type { StudentTrainingProgress } from "@/lib/domain/trainings/progress-types";
import { formatTrainingDeadline } from "@/lib/domain/trainings/format-deadline";

type TrainingProgressOverviewProps = {
  trainingId: string;
  progress: StudentTrainingProgress;
};

export function TrainingProgressOverview({
  trainingId,
  progress,
}: TrainingProgressOverviewProps) {
  const { summary } = progress;
  const deadlineLabel = formatTrainingDeadline(progress.deadline, "long");

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">Progress Keseluruhan</h2>
              <p className="text-sm text-muted-foreground">
                {summary.completedItems} dari {summary.totalItems} item selesai
              </p>
              {deadlineLabel ? (
                <p className="text-sm text-muted-foreground">
                  Deadline training:{" "}
                  <span className="font-medium text-foreground">
                    {deadlineLabel}
                  </span>
                </p>
              ) : null}
            </div>
            <div className="text-right">
              <p className="text-3xl font-semibold tabular-nums">
                {summary.progressPercent}%
              </p>
            </div>
          </div>
          <Progress value={summary.progressPercent} className="h-2" />
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ProgressStatCard
          title="Modul"
          value={`${summary.modules.completed}/${summary.modules.total}`}
          description="Modul selesai"
          icon={<IconBook className="size-5" />}
          highlight={summary.modules.completed < summary.modules.total}
        />
        <ProgressStatCard
          title="Quiz"
          value={`${summary.quizzes.completed}/${summary.quizzes.total}`}
          description="Quiz lulus"
          icon={<IconClipboardCheck className="size-5" />}
          highlight={summary.quizzes.completed < summary.quizzes.total}
        />
        <ProgressStatCard
          title="Latihan"
          value={`${summary.latihans.completed}/${summary.latihans.total}`}
          description="Latihan lulus"
          icon={<IconPencil className="size-5" />}
          highlight={summary.latihans.completed < summary.latihans.total}
        />
        <ProgressStatCard
          title="Assessment"
          value={`${Number(summary.preTest.status === "passed") + Number(summary.postTest.status === "passed")}/2`}
          description="Pre-test & post-test"
          icon={<IconSchool className="size-5" />}
          highlight={
            summary.preTest.status !== "passed" ||
            summary.postTest.status !== "passed"
          }
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="space-y-3 p-6">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold">Pre-Test</h3>
              <AssessmentProgressBadge status={summary.preTest.status} />
            </div>
            <p className="text-sm text-muted-foreground">
              {summary.preTest.status === "locked"
                ? "Pre-test belum diaktifkan oleh trainer."
                : summary.preTest.status === "not_started"
                  ? "Kerjakan pre-test sebelum mengakses modul."
                  : formatAssessmentScore(
                      summary.preTest.bestScore,
                      summary.preTest.passingGrade,
                      summary.preTest.hasPassed,
                    )}
            </p>
            {summary.preTest.status === "not_started" &&
            progress.isPretestActive ? (
              <ButtonLink href={`/student/trainings/${trainingId}/pre-test`}>
                Kerjakan Pre-Test
              </ButtonLink>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 p-6">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold">Post-Test</h3>
              <AssessmentProgressBadge status={summary.postTest.status} />
            </div>
            <p className="text-sm text-muted-foreground">
              {summary.postTest.status === "locked"
                ? "Selesaikan semua modul untuk membuka post-test."
                : summary.postTest.status === "not_started"
                  ? "Kerjakan post-test untuk menyelesaikan training."
                  : formatAssessmentScore(
                      summary.postTest.bestScore,
                      summary.postTest.passingGrade,
                      summary.postTest.hasPassed,
                    )}
            </p>
            {summary.postTest.status !== "locked" &&
            summary.postTest.status !== "passed" ? (
              <ButtonLink href={`/student/trainings/${trainingId}/post-test`}>
                Kerjakan Post-Test
              </ButtonLink>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
