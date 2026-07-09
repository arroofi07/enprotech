import type { TrainingStatus } from "@/lib/domain/trainings/types";
import { TrainingErrorCode } from "@/lib/domain/trainings/errors";

export type TrainingStatusAction = "publish" | "complete" | "archive" | "restore";

const ALLOWED_TRANSITIONS: Record<
  TrainingStatusAction,
  { from: TrainingStatus[]; to: TrainingStatus }
> = {
  publish: { from: ["draft"], to: "active" },
  complete: { from: ["active"], to: "completed" },
  archive: { from: ["draft", "active", "completed"], to: "archived" },
  restore: { from: ["archived"], to: "active" },
};

export function resolveTrainingStatusTransition(
  action: TrainingStatusAction,
  currentStatus: TrainingStatus,
):
  | { success: true; nextStatus: TrainingStatus }
  | { success: false; error: typeof TrainingErrorCode.INVALID_STATUS_TRANSITION } {
  const rule = ALLOWED_TRANSITIONS[action];

  if (!rule.from.includes(currentStatus)) {
    return {
      success: false,
      error: TrainingErrorCode.INVALID_STATUS_TRANSITION,
    };
  }

  return { success: true, nextStatus: rule.to };
}

export function isStudentVisibleTrainingStatus(status: TrainingStatus): boolean {
  return status === "active" || status === "completed";
}

export function resolveDirectStatusChange(
  currentStatus: TrainingStatus,
  targetStatus: TrainingStatus,
):
  | { success: true; nextStatus: TrainingStatus }
  | { success: false; error: typeof TrainingErrorCode.INVALID_STATUS_TRANSITION } {
  if (currentStatus === targetStatus) {
    return { success: true, nextStatus: targetStatus };
  }

  if (currentStatus === "draft" && targetStatus === "active") {
    return resolveTrainingStatusTransition("publish", currentStatus);
  }

  if (currentStatus === "active" && targetStatus === "completed") {
    return resolveTrainingStatusTransition("complete", currentStatus);
  }

  if (targetStatus === "archived") {
    return resolveTrainingStatusTransition("archive", currentStatus);
  }

  if (currentStatus === "archived" && targetStatus === "active") {
    return resolveTrainingStatusTransition("restore", currentStatus);
  }

  return {
    success: false,
    error: TrainingErrorCode.INVALID_STATUS_TRANSITION,
  };
}
