import type { SessionUser } from "@/lib/domain/auth/types";
import {
  TrainingErrorCode,
  trainingFailure,
  trainingSuccess,
  type TrainingResult,
} from "@/lib/domain/trainings/errors";
import {
  listTrainings as listTrainingsFromRepo,
  type TrainingRecord,
} from "@/lib/infrastructure/db/repositories/training-repository";
import { listTrainingsQuerySchema } from "@/lib/validations/training-schemas";

import { assertTrainerOrAdmin } from "./assert-trainer-or-admin";

export type ListTrainingsResult = {
  items: TrainingRecord[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export async function listTrainings(
  actor: SessionUser | null,
  input: unknown,
): Promise<TrainingResult<ListTrainingsResult>> {
  const forbidden = assertTrainerOrAdmin(actor);
  if (forbidden) {
    return forbidden;
  }

  const parsed = listTrainingsQuerySchema.safeParse(input);
  if (!parsed.success) {
    return trainingFailure(TrainingErrorCode.VALIDATION_ERROR);
  }

  const { page, pageSize, ...filters } = parsed.data;
  const result = await listTrainingsFromRepo({
    ...filters,
    page,
    pageSize,
  });

  return trainingSuccess({
    items: result.items,
    total: result.total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(result.total / pageSize)),
  });
}
