import type { SessionUser } from "@/lib/domain/auth/types";
import {
  TrainingErrorCode,
  trainingFailure,
  trainingSuccess,
  type TrainingResult,
} from "@/lib/domain/trainings/errors";
import {
  countActiveStudentsByIds,
  enrollStudents as enrollStudentsInRepo,
  findExistingEnrollmentStudentIds,
  findTrainingById,
  type EnrollmentRecord,
} from "@/lib/infrastructure/db/repositories/training-repository";
import {
  enrollStudentsSchema,
} from "@/lib/validations/training-schemas";

import { notifyEnrolled } from "@/lib/application/notifications/notify-enrolled";

import { assertTrainerOrAdmin } from "./assert-trainer-or-admin";

export async function enrollStudents(
  actor: SessionUser | null,
  input: unknown,
): Promise<TrainingResult<EnrollmentRecord[]>> {
  const forbidden = assertTrainerOrAdmin(actor);
  if (forbidden) {
    return forbidden;
  }

  const parsed = enrollStudentsSchema.safeParse(input);
  if (!parsed.success) {
    return trainingFailure(TrainingErrorCode.VALIDATION_ERROR);
  }

  const { trainingId, studentIds } = parsed.data;
  const uniqueStudentIds = [...new Set(studentIds)];

  const training = await findTrainingById(trainingId);
  if (!training) {
    return trainingFailure(TrainingErrorCode.TRAINING_NOT_FOUND);
  }

  if (training.status === "archived") {
    return trainingFailure(TrainingErrorCode.INVALID_STATUS_TRANSITION);
  }

  const activeStudentCount = await countActiveStudentsByIds(uniqueStudentIds);
  if (activeStudentCount !== uniqueStudentIds.length) {
    return trainingFailure(TrainingErrorCode.STUDENT_NOT_FOUND);
  }

  const alreadyEnrolled = await findExistingEnrollmentStudentIds(
    trainingId,
    uniqueStudentIds,
  );
  const newStudentIds = uniqueStudentIds.filter(
    (studentId) => !alreadyEnrolled.includes(studentId),
  );

  if (newStudentIds.length === 0) {
    return trainingFailure(TrainingErrorCode.ALREADY_ENROLLED);
  }

  const enrollments = await enrollStudentsInRepo(trainingId, newStudentIds);

  await notifyEnrolled({ studentIds: newStudentIds, trainingId });

  return trainingSuccess(enrollments);
}
