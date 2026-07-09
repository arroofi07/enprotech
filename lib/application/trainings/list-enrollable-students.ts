import type { SessionUser } from "@/lib/domain/auth/types";
import {
  trainingFailure,
  trainingSuccess,
  TrainingErrorCode,
  type TrainingResult,
} from "@/lib/domain/trainings/errors";
import {
  listActiveStudents,
  type PublicUserRecord,
} from "@/lib/infrastructure/db/repositories/user-repository";

import { assertTrainerOrAdmin } from "./assert-trainer-or-admin";

export async function listEnrollableStudents(
  actor: SessionUser | null,
): Promise<TrainingResult<PublicUserRecord[]>> {
  const forbidden = assertTrainerOrAdmin(actor);
  if (forbidden) {
    return forbidden;
  }

  const students = await listActiveStudents();
  return trainingSuccess(students);
}
