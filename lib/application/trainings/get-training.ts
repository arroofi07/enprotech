import type { SessionUser } from "@/lib/domain/auth/types";
import {
  TrainingErrorCode,
  trainingFailure,
  trainingSuccess,
  type TrainingResult,
} from "@/lib/domain/trainings/errors";
import {
  getTrainingPublicationSummaries,
  type TrainingPublicationSummary,
} from "@/lib/infrastructure/db/repositories/assessment-repository";
import {
  findTrainingById,
  listEnrollmentsByTraining,
  type EnrollmentRecord,
  type TrainingRecord,
} from "@/lib/infrastructure/db/repositories/training-repository";
import { getTrainingSchema } from "@/lib/validations/training-schemas";

import { assertTrainerOrAdmin } from "./assert-trainer-or-admin";

export type TrainingDetail = TrainingRecord & {
  enrollments: EnrollmentRecord[];
  publicationSummary: TrainingPublicationSummary;
};

export async function getTraining(
  actor: SessionUser | null,
  input: unknown,
): Promise<TrainingResult<TrainingDetail>> {
  const forbidden = assertTrainerOrAdmin(actor);
  if (forbidden) {
    return forbidden;
  }

  const parsed = getTrainingSchema.safeParse(input);
  if (!parsed.success) {
    return trainingFailure(TrainingErrorCode.VALIDATION_ERROR);
  }

  const training = await findTrainingById(parsed.data.trainingId);
  if (!training) {
    return trainingFailure(TrainingErrorCode.TRAINING_NOT_FOUND);
  }

  const [enrollments, summaries] = await Promise.all([
    listEnrollmentsByTraining(parsed.data.trainingId),
    getTrainingPublicationSummaries([parsed.data.trainingId]),
  ]);
  const publicationSummary = summaries[parsed.data.trainingId];

  if (!publicationSummary) {
    return trainingFailure(TrainingErrorCode.TRAINING_NOT_FOUND);
  }

  return trainingSuccess({
    ...training,
    enrollments,
    publicationSummary,
  });
}
