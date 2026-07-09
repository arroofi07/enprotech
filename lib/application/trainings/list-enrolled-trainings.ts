import type { SessionUser } from "@/lib/domain/auth/types";
import {
  TrainingErrorCode,
  trainingFailure,
  trainingSuccess,
  type TrainingResult,
} from "@/lib/domain/trainings/errors";
import {
  listEnrolledTrainingsByStudent,
  type EnrolledTrainingRecord,
} from "@/lib/infrastructure/db/repositories/training-repository";

import { assertStudent } from "./assert-student";
import { enrichEnrolledTrainingsWithProgress } from "../progress/enrich-enrolled-trainings";

export async function listEnrolledTrainings(
  actor: SessionUser | null,
): Promise<TrainingResult<EnrolledTrainingRecord[]>> {
  const forbidden = assertStudent(actor);
  if (forbidden) {
    return forbidden;
  }

  const items = await listEnrolledTrainingsByStudent(actor!.id);
  const enriched = await enrichEnrolledTrainingsWithProgress(actor!.id, items);
  return trainingSuccess(enriched);
}
