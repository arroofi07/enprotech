import type { SessionUser } from "@/lib/domain/auth/types";
import {
  TrainingErrorCode,
  trainingFailure,
  trainingSuccess,
  type TrainingResult,
} from "@/lib/domain/trainings/errors";
import {
  areAllModulesReady,
  findTrainingById,
  setPretestActive,
  type TrainingRecord,
} from "@/lib/infrastructure/db/repositories/training-repository";
import {
  activatePretestSchema,
} from "@/lib/validations/training-schemas";

import { assertTrainerOrAdmin } from "./assert-trainer-or-admin";

export async function activatePretest(
  actor: SessionUser | null,
  input: unknown,
): Promise<TrainingResult<TrainingRecord>> {
  const forbidden = assertTrainerOrAdmin(actor);
  if (forbidden) {
    return forbidden;
  }

  const parsed = activatePretestSchema.safeParse(input);
  if (!parsed.success) {
    return trainingFailure(TrainingErrorCode.VALIDATION_ERROR);
  }

  const training = await findTrainingById(parsed.data.trainingId);
  if (!training) {
    return trainingFailure(TrainingErrorCode.TRAINING_NOT_FOUND);
  }

  if (training.status !== "active") {
    return trainingFailure(TrainingErrorCode.INVALID_STATUS_TRANSITION);
  }

  if (training.isPretestActive) {
    return trainingFailure(TrainingErrorCode.PRETEST_ALREADY_ACTIVE);
  }

  const modulesReady = await areAllModulesReady(parsed.data.trainingId);
  if (!modulesReady) {
    return trainingFailure(TrainingErrorCode.MODULES_NOT_READY);
  }

  const updated = await setPretestActive(parsed.data.trainingId, true);
  if (!updated) {
    return trainingFailure(TrainingErrorCode.TRAINING_NOT_FOUND);
  }

  return trainingSuccess(updated);
}
