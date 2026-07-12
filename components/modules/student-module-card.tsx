import { IconChevronRight } from "@tabler/icons-react";

import { ModuleProgressBadge } from "@/components/modules/module-progress-badge";
import { AssessmentProgressBadge } from "@/components/progress/assessment-progress-badge";
import { ButtonLink } from "@/components/ui/button-link";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { StudentModuleListItem } from "@/lib/application/modules/list-student-modules";
import type { ModuleProgressItem } from "@/lib/domain/trainings/progress-types";
import { cn } from "@/lib/utils";

type StudentModuleCardProps = {
  module: StudentModuleListItem;
  trainingId: string;
  trainingTitle?: string;
  preTestLocked?: boolean;
  progressItem?: ModuleProgressItem;
};

export function StudentModuleCard({
  module,
  trainingId,
  trainingTitle,
  preTestLocked = false,
  progressItem,
}: StudentModuleCardProps) {
  const status = module.progress?.status ?? "not_started";
  const locked = preTestLocked || module.isLocked;

  return (
    <Card
      className={`flex h-full flex-col overflow-hidden ${
        locked ? "opacity-60" : ""
      }`}
    >
      {module.thumbnail ? (
        <div className="aspect-video w-full overflow-hidden bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={module.thumbnail}
            alt={module.title}
            className="h-full w-full object-cover"
          />
        </div>
      ) : null}
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            {trainingTitle ? (
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {trainingTitle}
              </p>
            ) : null}
            <CardTitle className="text-base">{module.title}</CardTitle>
            {module.description ? (
              <CardDescription className="line-clamp-2">
                {module.description}
              </CardDescription>
            ) : null}
          </div>
          <ModuleProgressBadge status={status} />
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-3">
        <p className="text-sm text-muted-foreground">
          {preTestLocked
            ? "Selesaikan pre-test untuk membuka modul."
            : module.isLocked
              ? "Selesaikan modul sebelumnya terlebih dahulu."
              : `${module.contents.length} materi`}
        </p>

        {progressItem && !locked ? (
          <div className="flex flex-wrap gap-2">
            <AssessmentProgressBadge status={progressItem.quiz.status} />
            <AssessmentProgressBadge status={progressItem.latihan.status} />
          </div>
        ) : null}
      </CardContent>
      <CardFooter className="border-t bg-muted/20 pt-4">
        {locked ? (
          <span
            className={cn(
              buttonVariants({ variant: "outline" }),
              "w-full cursor-not-allowed opacity-50",
            )}
          >
            Modul Terkunci
          </span>
        ) : (
          <ButtonLink
            className="w-full"
            href={`/student/trainings/${trainingId}/modules/${module.id}`}
          >
            Buka Modul
            <IconChevronRight data-icon="inline-end" className="size-4" />
          </ButtonLink>
        )}
      </CardFooter>
    </Card>
  );
}
