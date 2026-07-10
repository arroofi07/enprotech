import type { SessionUser } from "@/lib/domain/auth/types";
import { mapStudentTrainingProgress } from "@/lib/domain/trainings/map-student-progress";
import {
  trainingSuccess,
  trainingFailure,
  TrainingErrorCode,
  type TrainingResult,
} from "@/lib/domain/trainings/errors";
import type { StudentTrainingProgress } from "@/lib/domain/trainings/progress-types";
import { getStudentTrainingProgressRawData } from "@/lib/infrastructure/db/repositories/progress-repository";
import { listEnrolledTrainingsByStudent } from "@/lib/infrastructure/db/repositories/training-repository";
import { buildPaginatedResult } from "@/lib/validations/pagination-schemas";
import { listPaginationQuerySchema } from "@/lib/validations/pagination-schemas";

import { assertStudent } from "../trainings/assert-student";

export type ListStudentTrainingScoresResult = {
  items: StudentTrainingProgress[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export async function listStudentTrainingScores(
  actor: SessionUser | null,
  input: unknown = {},
): Promise<TrainingResult<ListStudentTrainingScoresResult>> {
  const forbidden = assertStudent(actor);
  if (forbidden) {
    return forbidden;
  }

  const parsed = listPaginationQuerySchema.safeParse(input);
  if (!parsed.success) {
    return trainingFailure(TrainingErrorCode.VALIDATION_ERROR);
  }

  const { page, pageSize } = parsed.data;
  const enrolled = await listEnrolledTrainingsByStudent(actor!.id, {
    page,
    pageSize,
  });

  const scores = (
    await Promise.all(
      enrolled.items.map(async (training) => {
        const raw = await getStudentTrainingProgressRawData(
          actor!.id,
          training.id,
        );
        if (!raw) {
          return null;
        }

        return mapStudentTrainingProgress(raw);
      }),
    )
  ).filter((item): item is StudentTrainingProgress => item !== null);

  return trainingSuccess(
    buildPaginatedResult(scores, enrolled.total, page, pageSize),
  );
}
