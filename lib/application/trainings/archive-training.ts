import type { SessionUser } from "@/lib/domain/auth/types";
import {
  TrainingErrorCode,
  trainingFailure,
  trainingSuccess,
  type TrainingResult,
} from "@/lib/domain/trainings/errors";
import { resolveTrainingStatusTransition } from "@/lib/domain/trainings/status-transitions";
import {
  findTrainingById,
  updateTraining as updateTrainingInRepo,
  type TrainingRecord,
} from "@/lib/infrastructure/db/repositories/training-repository";
import { getTrainingSchema } from "@/lib/validations/training-schemas";

import { assertTrainerOrAdmin } from "./assert-trainer-or-admin";

export async function archiveTraining(
  actor: SessionUser | null,
  input: unknown,
): Promise<TrainingResult<TrainingRecord>> {
  const forbidden = assertTrainerOrAdmin(actor);
  if (forbidden) {
    return forbidden;
  }

  const parsed = getTrainingSchema.safeParse(input);
  if (!parsed.success) {
    return trainingFailure(TrainingErrorCode.VALIDATION_ERROR);
  }

  const existing = await findTrainingById(parsed.data.trainingId);
  if (!existing) {
    return trainingFailure(TrainingErrorCode.TRAINING_NOT_FOUND);
  }

  const transition = resolveTrainingStatusTransition("archive", existing.status);
  if (!transition.success) {
    return trainingFailure(transition.error);
  }

  const updated = await updateTrainingInRepo(parsed.data.trainingId, {
    status: transition.nextStatus,
  });

  if (!updated) {
    return trainingFailure(TrainingErrorCode.TRAINING_NOT_FOUND);
  }

  return trainingSuccess(updated);
}
