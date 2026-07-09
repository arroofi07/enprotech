import type { SessionUser } from "@/lib/domain/auth/types";
import {
  TrainingErrorCode,
  trainingFailure,
  type TrainingFailure,
} from "@/lib/domain/trainings/errors";

export function assertTrainerOrAdmin(
  actor: SessionUser | null,
): TrainingFailure | null {
  if (!actor) {
    return trainingFailure(TrainingErrorCode.UNAUTHORIZED);
  }

  if (actor.role !== "admin" && actor.role !== "trainer") {
    return trainingFailure(TrainingErrorCode.FORBIDDEN);
  }

  return null;
}
