import type { SessionUser } from "@/lib/domain/auth/types";
import { resolvePassingGrade } from "@/lib/domain/assessments/resolve-passing-grade";
import { hasPassed } from "@/lib/domain/assessments/best-score";
import {
  ReportErrorCode,
  reportFailure,
  reportSuccess,
  type ReportResult,
} from "@/lib/domain/reports/errors";
import type {
  StudentReportDetail,
  TrainingReportAssessmentDetail,
} from "@/lib/domain/reports/types";
import {
  findEnrollmentSummary,
  isStudentEnrolled,
} from "@/lib/infrastructure/db/repositories/report-repository";
import {
  listAssessmentsByTraining,
  listSubmittedAttempts,
  type AssessmentRecord,
} from "@/lib/infrastructure/db/repositories/assessment-repository";
import { findTrainingById } from "@/lib/infrastructure/db/repositories/training-repository";
import { getStudentTrainingProgressRawData } from "@/lib/infrastructure/db/repositories/progress-repository";
import { getStudentReportDetailSchema } from "@/lib/validations/report-schemas";

import { assertReportTrainerOrAdmin } from "./assert-trainer-or-admin";

async function buildAssessmentDetail(input: {
  studentId: string;
  assessment: AssessmentRecord;
  moduleTitle: string | null;
  trainingPassingGrade: number;
}): Promise<TrainingReportAssessmentDetail> {
  const attempts = await listSubmittedAttempts(
    input.studentId,
    input.assessment.id,
  );

  const bestScore =
    attempts.length > 0
      ? Math.max(...attempts.map((attempt) => attempt.score))
      : null;

  const passingGrade = resolvePassingGrade({
    type: input.assessment.type,
    assessmentPassingGrade: input.assessment.passingGrade,
    trainingPassingGrade: input.trainingPassingGrade,
  });

  return {
    assessmentId: input.assessment.id,
    type: input.assessment.type,
    title: input.assessment.title,
    moduleId: input.assessment.moduleId,
    moduleTitle: input.moduleTitle,
    bestScore,
    passingGrade,
    hasPassed:
      bestScore !== null && hasPassed(bestScore, passingGrade),
    attempts: attempts.map((attempt, index) => ({
      id: attempt.id,
      attemptNumber: attempts.length - index,
      score: attempt.score,
      startedAt: attempt.startedAt.toISOString(),
      submittedAt: attempt.submittedAt!.toISOString(),
    })),
  };
}

export async function getStudentReportDetail(
  actor: SessionUser | null,
  input: unknown,
): Promise<ReportResult<StudentReportDetail>> {
  const forbidden = assertReportTrainerOrAdmin(actor);
  if (forbidden) {
    return reportFailure(ReportErrorCode.FORBIDDEN);
  }

  const parsed = getStudentReportDetailSchema.safeParse(input);
  if (!parsed.success) {
    return reportFailure(ReportErrorCode.VALIDATION_ERROR);
  }

  const { studentId, trainingId } = parsed.data;

  const [enrolled, enrollment, training, assessmentRecords] = await Promise.all([
    isStudentEnrolled(studentId, trainingId),
    findEnrollmentSummary(studentId, trainingId),
    findTrainingById(trainingId),
    listAssessmentsByTraining(trainingId),
  ]);

  if (!training) {
    return reportFailure(ReportErrorCode.TRAINING_NOT_FOUND);
  }

  if (!enrolled || !enrollment) {
    return reportFailure(ReportErrorCode.ENROLLMENT_NOT_FOUND);
  }

  const raw = await getStudentTrainingProgressRawData(studentId, trainingId);
  if (!raw) {
    return reportFailure(ReportErrorCode.TRAINING_NOT_FOUND);
  }

  const moduleTitleById = new Map(
    raw.modules.map((module) => [module.id, module.title]),
  );

  const assessments = await Promise.all(
    assessmentRecords.map((assessment) =>
      buildAssessmentDetail({
        studentId,
        assessment,
        moduleTitle: assessment.moduleId
          ? (moduleTitleById.get(assessment.moduleId) ?? null)
          : null,
        trainingPassingGrade: training.passingGrade,
      }),
    ),
  );

  return reportSuccess({
    studentId,
    studentName: enrollment.studentName,
    studentEmail: enrollment.studentEmail,
    trainingId,
    trainingTitle: enrollment.trainingTitle,
    enrollmentStatus: enrollment.enrollmentStatus,
    enrolledAt: enrollment.enrolledAt.toISOString(),
    completedAt: enrollment.completedAt?.toISOString() ?? null,
    assessments,
  });
}
