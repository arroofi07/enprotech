import { Badge } from "@/components/ui/badge";
import type { AssessmentProgressStatus } from "@/lib/domain/trainings/progress-types";
import { cn } from "@/lib/utils";

const LABELS: Record<AssessmentProgressStatus, string> = {
  not_started: "Belum dikerjakan",
  in_progress: "Sedang dikerjakan",
  submitted: "Sudah submit",
  passed: "Lulus",
  locked: "Terkunci",
};

const VARIANTS: Record<
  AssessmentProgressStatus,
  "secondary" | "outline" | "default" | "destructive"
> = {
  not_started: "secondary",
  in_progress: "outline",
  submitted: "outline",
  passed: "default",
  locked: "secondary",
};

type AssessmentProgressBadgeProps = {
  status: AssessmentProgressStatus;
  className?: string;
};

export function AssessmentProgressBadge({
  status,
  className,
}: AssessmentProgressBadgeProps) {
  const needsAttention =
    status === "not_started" || status === "submitted" || status === "in_progress";

  return (
    <Badge
      variant={VARIANTS[status]}
      className={cn(
        needsAttention && status === "not_started" && "border-dashed",
        className,
      )}
    >
      {LABELS[status]}
    </Badge>
  );
}

export function formatAssessmentScore(
  bestScore: number | null,
  passingGrade: number,
  hasPassed: boolean,
): string {
  if (bestScore === null) {
    return "Belum ada nilai";
  }

  // Passing grade is intentionally not shown to peserta.
  return `Nilai tertinggi: ${bestScore}%`;
}
