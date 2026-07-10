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
import { listEnrolledTrainingsQuerySchema } from "@/lib/validations/training-schemas";
import { buildPaginatedResult } from "@/lib/validations/pagination-schemas";

import { assertStudent } from "./assert-student";
import { enrichEnrolledTrainingsWithProgress } from "../progress/enrich-enrolled-trainings";

export type ListEnrolledTrainingsResult = {
  items: EnrolledTrainingRecord[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export async function listEnrolledTrainings(
  actor: SessionUser | null,
  input: unknown = {},
): Promise<TrainingResult<ListEnrolledTrainingsResult>> {
  const forbidden = assertStudent(actor);
  if (forbidden) {
    return forbidden;
  }

  const parsed = listEnrolledTrainingsQuerySchema.safeParse(input);
  if (!parsed.success) {
    return trainingFailure(TrainingErrorCode.VALIDATION_ERROR);
  }

  const { page, pageSize } = parsed.data;
  const result = await listEnrolledTrainingsByStudent(actor!.id, {
    page,
    pageSize,
  });
  const enriched = await enrichEnrolledTrainingsWithProgress(
    actor!.id,
    result.items,
  );

  return trainingSuccess(
    buildPaginatedResult(enriched, result.total, page, pageSize),
  );
}
