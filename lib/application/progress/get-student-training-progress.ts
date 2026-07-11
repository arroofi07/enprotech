import type { SessionUser } from "@/lib/domain/auth/types";
import { mapStudentTrainingProgress } from "@/lib/domain/trainings/map-student-progress";
import {
  TrainingErrorCode,
  trainingFailure,
  trainingSuccess,
  type TrainingResult,
} from "@/lib/domain/trainings/errors";
import type { StudentTrainingProgress } from "@/lib/domain/trainings/progress-types";
import { isStudentEnrolledInTraining } from "@/lib/infrastructure/db/repositories/module-repository";
import { getStudentTrainingProgressRawData } from "@/lib/infrastructure/db/repositories/progress-repository";
import { getTrainingProgressSchema } from "@/lib/validations/progress-schemas";

import { getModuleProgressionState } from "../modules/check-module-access";
import { assertStudent } from "../trainings/assert-student";

export async function getStudentTrainingProgress(
  actor: SessionUser | null,
  input: unknown,
): Promise<TrainingResult<StudentTrainingProgress>> {
  const forbidden = assertStudent(actor);
  if (forbidden) {
    return forbidden;
  }

  const parsed = getTrainingProgressSchema.safeParse(input);
  if (!parsed.success) {
    return trainingFailure(TrainingErrorCode.VALIDATION_ERROR);
  }

  const enrolled = await isStudentEnrolledInTraining(
    actor!.id,
    parsed.data.trainingId,
  );
  if (!enrolled) {
    return trainingFailure(TrainingErrorCode.FORBIDDEN);
  }

  const [raw, progressionState] = await Promise.all([
    getStudentTrainingProgressRawData(actor!.id, parsed.data.trainingId),
    getModuleProgressionState(actor!.id, parsed.data.trainingId),
  ]);
  if (!raw) {
    return trainingFailure(TrainingErrorCode.TRAINING_NOT_FOUND);
  }

  return trainingSuccess(
    mapStudentTrainingProgress(raw, progressionState.lockedByModuleId),
  );
}
