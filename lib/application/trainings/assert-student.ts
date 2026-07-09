import type { SessionUser } from "@/lib/domain/auth/types";
import {
  TrainingErrorCode,
  trainingFailure,
  type TrainingFailure,
} from "@/lib/domain/trainings/errors";

export function assertStudent(
  actor: SessionUser | null,
): TrainingFailure | null {
  if (!actor) {
    return trainingFailure(TrainingErrorCode.UNAUTHORIZED);
  }

  if (actor.role !== "student") {
    return trainingFailure(TrainingErrorCode.FORBIDDEN);
  }

  return null;
}
