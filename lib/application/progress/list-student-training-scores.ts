import type { SessionUser } from "@/lib/domain/auth/types";
import { mapStudentTrainingProgress } from "@/lib/domain/trainings/map-student-progress";
import {
  trainingSuccess,
  type TrainingResult,
} from "@/lib/domain/trainings/errors";
import type { StudentTrainingProgress } from "@/lib/domain/trainings/progress-types";
import { getStudentTrainingProgressRawData } from "@/lib/infrastructure/db/repositories/progress-repository";
import { listEnrolledTrainingsByStudent } from "@/lib/infrastructure/db/repositories/training-repository";

import { assertStudent } from "../trainings/assert-student";

export async function listStudentTrainingScores(
  actor: SessionUser | null,
): Promise<TrainingResult<StudentTrainingProgress[]>> {
  const forbidden = assertStudent(actor);
  if (forbidden) {
    return forbidden;
  }

  const trainings = await listEnrolledTrainingsByStudent(actor!.id);
  const scores = await Promise.all(
    trainings.map(async (training) => {
      const raw = await getStudentTrainingProgressRawData(actor!.id, training.id);
      if (!raw) {
        return null;
      }

      return mapStudentTrainingProgress(raw);
    }),
  );

  return trainingSuccess(
    scores.filter((item): item is StudentTrainingProgress => item !== null),
  );
}
