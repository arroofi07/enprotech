import type { SessionUser } from "@/lib/domain/auth/types";
import {
  TrainingErrorCode,
  trainingFailure,
  trainingSuccess,
  type TrainingResult,
} from "@/lib/domain/trainings/errors";
import {
  findEnrollmentById,
  findTrainingById,
  removeEnrollment as removeEnrollmentInRepo,
} from "@/lib/infrastructure/db/repositories/training-repository";
import {
  removeEnrollmentSchema,
} from "@/lib/validations/training-schemas";

import { assertTrainerOrAdmin } from "./assert-trainer-or-admin";

export async function removeEnrollment(
  actor: SessionUser | null,
  input: unknown,
): Promise<TrainingResult<{ enrollmentId: string }>> {
  const forbidden = assertTrainerOrAdmin(actor);
  if (forbidden) {
    return forbidden;
  }

  const parsed = removeEnrollmentSchema.safeParse(input);
  if (!parsed.success) {
    return trainingFailure(TrainingErrorCode.VALIDATION_ERROR);
  }

  const enrollment = await findEnrollmentById(parsed.data.enrollmentId);
  if (!enrollment) {
    return trainingFailure(TrainingErrorCode.ENROLLMENT_NOT_FOUND);
  }

  const training = await findTrainingById(enrollment.trainingId);
  if (!training) {
    return trainingFailure(TrainingErrorCode.TRAINING_NOT_FOUND);
  }

  if (training.status === "archived") {
    return trainingFailure(TrainingErrorCode.INVALID_STATUS_TRANSITION);
  }

  const removed = await removeEnrollmentInRepo(parsed.data.enrollmentId);
  if (!removed) {
    return trainingFailure(TrainingErrorCode.ENROLLMENT_NOT_FOUND);
  }

  return trainingSuccess({ enrollmentId: parsed.data.enrollmentId });
}
