import {
  IconCircleCheckFilled,
  IconCircleDashed,
  IconSparkles,
} from "@tabler/icons-react";

import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { CertificateChecklist } from "@/lib/application/certificates/get-student-certificate-progress";

type CertificateProgressChecklistProps = {
  checklists: CertificateChecklist[];
};

export function CertificateProgressChecklist({
  checklists,
}: CertificateProgressChecklistProps) {
  if (checklists.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-foreground">
        Progress Menuju Sertifikat
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {checklists.map((checklist) => (
          <TrainingChecklistCard key={checklist.trainingId} checklist={checklist} />
        ))}
      </div>
    </div>
  );
}

function TrainingChecklistCard({
  checklist,
}: {
  checklist: CertificateChecklist;
}) {
  const { trainingTitle, steps, completedCount, totalCount, isEligible } =
    checklist;
  const percent = Math.round((completedCount / totalCount) * 100);

  return (
    <Card>
      <CardContent className="space-y-4 p-4 sm:p-5">
        <div className="space-y-2">
          <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
            <h3 className="min-w-0 font-semibold break-words">
              {trainingTitle}
            </h3>
            <span
              className={cn(
                "shrink-0 text-xs font-medium tabular-nums",
                isEligible ? "text-primary" : "text-muted-foreground",
              )}
            >
              {completedCount}/{totalCount} selesai
            </span>
          </div>
          <Progress
            value={percent}
            className={cn(
              isEligible &&
                "[&_[data-slot=progress-indicator]]:bg-emerald-500",
            )}
          />
        </div>

        <ul className="space-y-2">
          {steps.map((step) => (
            <li
              key={step.key}
              className="flex flex-col gap-2 rounded-md border border-border/60 bg-muted/30 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-start gap-2.5">
                {step.done ? (
                  <IconCircleCheckFilled className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                ) : (
                  <IconCircleDashed className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                )}
                <div className="min-w-0">
                  <p
                    className={cn(
                      "text-sm font-medium break-words",
                      step.done && "text-muted-foreground line-through",
                    )}
                  >
                    {step.label}
                  </p>
                  <p className="text-xs text-muted-foreground break-words">
                    {step.description}
                  </p>
                </div>
              </div>

              {!step.done ? (
                <ButtonLink
                  href={step.href}
                  variant="outline"
                  size="sm"
                  className="ml-6 shrink-0 self-start sm:ml-3 sm:self-center"
                >
                  Selesaikan
                </ButtonLink>
              ) : null}
            </li>
          ))}
        </ul>

        {isEligible ? (
          <div className="flex items-start gap-2 rounded-md bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <IconSparkles className="mt-0.5 size-4 shrink-0" />
            <span>
              Semua syarat terpenuhi. Sertifikat sedang diproses dan akan
              muncul di daftar sebentar lagi.
            </span>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
