import { Badge } from "@/components/ui/badge";
import type { ModuleProgressStatus } from "@/lib/domain/modules/types";

const LABELS: Record<ModuleProgressStatus, string> = {
  not_started: "Belum dimulai",
  in_progress: "Sedang berjalan",
  completed: "Selesai",
};

const VARIANTS: Record<
  ModuleProgressStatus,
  "secondary" | "outline" | "default"
> = {
  not_started: "secondary",
  in_progress: "outline",
  completed: "default",
};

type ModuleProgressBadgeProps = {
  status: ModuleProgressStatus;
};

export function ModuleProgressBadge({ status }: ModuleProgressBadgeProps) {
  return <Badge variant={VARIANTS[status]}>{LABELS[status]}</Badge>;
}
