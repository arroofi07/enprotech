import type { SessionUser } from "@/lib/domain/auth/types";
import {
  TrainingErrorCode,
  trainingFailure,
  trainingSuccess,
  type TrainingResult,
} from "@/lib/domain/trainings/errors";
import {
  createTraining as createTrainingInRepo,
  type TrainingRecord,
} from "@/lib/infrastructure/db/repositories/training-repository";
import {
  createTrainingSchema,
} from "@/lib/validations/training-schemas";

import { assertTrainerOrAdmin } from "./assert-trainer-or-admin";

export async function createTraining(
  actor: SessionUser | null,
  input: unknown,
): Promise<TrainingResult<TrainingRecord>> {
  const forbidden = assertTrainerOrAdmin(actor);
  if (forbidden) {
    return forbidden;
  }

  const parsed = createTrainingSchema.safeParse(input);
  if (!parsed.success) {
    return trainingFailure(TrainingErrorCode.VALIDATION_ERROR);
  }

  const training = await createTrainingInRepo({
    ...parsed.data,
    createdBy: actor!.id,
  });

  return trainingSuccess(training);
}
