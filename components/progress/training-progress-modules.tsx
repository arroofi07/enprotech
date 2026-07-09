import Link from "next/link";

import { ModuleProgressBadge } from "@/components/modules/module-progress-badge";
import {
  AssessmentProgressBadge,
  formatAssessmentScore,
} from "@/components/progress/assessment-progress-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ModuleProgressItem } from "@/lib/domain/trainings/progress-types";
import { cn } from "@/lib/utils";

type TrainingProgressModulesProps = {
  trainingId: string;
  modules: ModuleProgressItem[];
  locked?: boolean;
};

function hasPendingWork(module: ModuleProgressItem): boolean {
  return (
    module.status !== "completed" ||
    module.quiz.status !== "passed" ||
    module.latihan.status !== "passed"
  );
}

export function TrainingProgressModules({
  trainingId,
  modules,
  locked = false,
}: TrainingProgressModulesProps) {
  if (modules.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold">Detail Modul</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Status modul, quiz, dan latihan beserta nilai tertinggi Anda.
        </p>
      </div>

      <div className="space-y-3">
        {modules.map((module) => {
          const pending = hasPendingWork(module);

          return (
            <Card
              key={module.id}
              className={cn(
                pending && !locked && "border-dashed border-muted-foreground/30",
              )}
            >
              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <CardTitle className="text-base">{module.title}</CardTitle>
                    {locked ? (
                      <p className="text-sm text-muted-foreground">
                        Terkunci sampai pre-test selesai.
                      </p>
                    ) : null}
                  </div>
                  <ModuleProgressBadge status={module.status} />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2 rounded-lg border p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium">Quiz</span>
                      <AssessmentProgressBadge status={module.quiz.status} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatAssessmentScore(
                        module.quiz.bestScore,
                        module.quiz.passingGrade,
                        module.quiz.hasPassed,
                      )}
                    </p>
                  </div>

                  <div className="space-y-2 rounded-lg border p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium">Latihan</span>
                      <AssessmentProgressBadge status={module.latihan.status} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatAssessmentScore(
                        module.latihan.bestScore,
                        module.latihan.passingGrade,
                        module.latihan.hasPassed,
                      )}
                    </p>
                  </div>
                </div>

                {!locked ? (
                  <Link
                    href={`/student/trainings/${trainingId}/modules/${module.id}`}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Buka modul
                  </Link>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
