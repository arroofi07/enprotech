import type { SessionUser } from "@/lib/domain/auth/types";
import {
  TrainingErrorCode,
  trainingFailure,
  trainingSuccess,
  type TrainingResult,
} from "@/lib/domain/trainings/errors";
import { resolveDirectStatusChange } from "@/lib/domain/trainings/status-transitions";
import {
  findTrainingById,
  updateTraining as updateTrainingInRepo,
  type TrainingRecord,
} from "@/lib/infrastructure/db/repositories/training-repository";
import {
  updateTrainingSchema,
} from "@/lib/validations/training-schemas";

import { assertTrainerOrAdmin } from "./assert-trainer-or-admin";

export async function updateTraining(
  actor: SessionUser | null,
  input: unknown,
): Promise<TrainingResult<TrainingRecord>> {
  const forbidden = assertTrainerOrAdmin(actor);
  if (forbidden) {
    return forbidden;
  }

  const payload =
    input && typeof input === "object" && "trainingId" in input
      ? (input as { trainingId: string } & Record<string, unknown>)
      : null;

  if (!payload?.trainingId) {
    return trainingFailure(TrainingErrorCode.VALIDATION_ERROR);
  }

  const { trainingId, ...fields } = payload;
  const parsed = updateTrainingSchema.safeParse(fields);
  if (!parsed.success) {
    return trainingFailure(TrainingErrorCode.VALIDATION_ERROR);
  }

  if (parsed.data.isPretestActive !== undefined) {
    return trainingFailure(TrainingErrorCode.VALIDATION_ERROR);
  }

  const existing = await findTrainingById(trainingId);
  if (!existing) {
    return trainingFailure(TrainingErrorCode.TRAINING_NOT_FOUND);
  }

  let nextStatus = parsed.data.status;

  if (nextStatus !== undefined) {
    const transition = resolveDirectStatusChange(existing.status, nextStatus);
    if (!transition.success) {
      return trainingFailure(transition.error);
    }
    nextStatus = transition.nextStatus;
  }

  const updated = await updateTrainingInRepo(trainingId, {
    ...parsed.data,
    ...(nextStatus !== undefined ? { status: nextStatus } : {}),
  });

  if (!updated) {
    return trainingFailure(TrainingErrorCode.TRAINING_NOT_FOUND);
  }

  return trainingSuccess(updated);
}
