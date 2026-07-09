import { Badge } from "@/components/ui/badge";
import type { TrainingStatus } from "@/lib/domain/trainings/types";

const STATUS_LABELS: Record<TrainingStatus, string> = {
  draft: "Draft",
  active: "Aktif",
  completed: "Selesai",
  archived: "Arsip",
};

const STATUS_VARIANTS: Record<
  TrainingStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  draft: "secondary",
  active: "default",
  completed: "outline",
  archived: "destructive",
};

type TrainingStatusBadgeProps = {
  status: TrainingStatus;
};

export function TrainingStatusBadge({ status }: TrainingStatusBadgeProps) {
  return (
    <Badge variant={STATUS_VARIANTS[status]}>{STATUS_LABELS[status]}</Badge>
  );
}
