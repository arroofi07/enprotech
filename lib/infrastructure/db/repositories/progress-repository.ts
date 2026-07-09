import { and, asc, eq, inArray, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  assessmentAttempts,
  assessments,
} from "@/lib/db/schema/assessments";
import { moduleProgress, modules } from "@/lib/db/schema/modules";
import type { StudentTrainingProgressRawData } from "@/lib/domain/trainings/progress-raw-data";
import { findTrainingById } from "@/lib/infrastructure/db/repositories/training-repository";

export async function getStudentTrainingProgressRawData(
  studentId: string,
  trainingId: string,
): Promise<StudentTrainingProgressRawData | null> {
  const training = await findTrainingById(trainingId);
  if (!training) {
    return null;
  }

  const [moduleRows, assessmentRows] = await Promise.all([
    db
      .select({
        id: modules.id,
        title: modules.title,
        order: modules.order,
        minQuizScore: modules.minQuizScore,
        minLatihanScore: modules.minLatihanScore,
        progressStatus: moduleProgress.status,
      })
      .from(modules)
      .leftJoin(
        moduleProgress,
        and(
          eq(moduleProgress.moduleId, modules.id),
          eq(moduleProgress.studentId, studentId),
        ),
      )
      .where(eq(modules.trainingId, trainingId))
      .orderBy(asc(modules.order), asc(modules.createdAt)),
    db
      .select({
        id: assessments.id,
        moduleId: assessments.moduleId,
        type: assessments.type,
        passingGrade: assessments.passingGrade,
      })
      .from(assessments)
      .where(eq(assessments.trainingId, trainingId)),
  ]);

  const assessmentIds = assessmentRows.map((row) => row.id);
  const attemptStatsByAssessmentId = await getAttemptStatsByAssessmentIds(
    studentId,
    assessmentIds,
  );

  return {
    training: {
      id: training.id,
      title: training.title,
      deadline: training.deadline,
      isPretestActive: training.isPretestActive,
      passingGrade: training.passingGrade,
    },
    modules: moduleRows.map((row) => ({
      id: row.id,
      title: row.title,
      order: row.order,
      minQuizScore: row.minQuizScore,
      minLatihanScore: row.minLatihanScore,
      progressStatus: row.progressStatus ?? "not_started",
    })),
    assessments: assessmentRows,
    attemptStatsByAssessmentId,
  };
}

async function getAttemptStatsByAssessmentIds(
  studentId: string,
  assessmentIds: string[],
) {
  if (assessmentIds.length === 0) {
    return new Map();
  }

  const rows = await db
    .select({
      assessmentId: assessmentAttempts.assessmentId,
      bestScore: sql<number>`coalesce(max(case when ${assessmentAttempts.submittedAt} is not null then ${assessmentAttempts.score} end), 0)`,
      submittedCount: sql<number>`count(*) filter (where ${assessmentAttempts.submittedAt} is not null)`,
      hasInProgressAttempt: sql<boolean>`bool_or(${assessmentAttempts.submittedAt} is null)`,
    })
    .from(assessmentAttempts)
    .where(
      and(
        eq(assessmentAttempts.studentId, studentId),
        inArray(assessmentAttempts.assessmentId, assessmentIds),
      ),
    )
    .groupBy(assessmentAttempts.assessmentId);

  return new Map(
    rows.map((row) => [
      row.assessmentId,
      {
        bestScore: row.bestScore,
        submittedCount: Number(row.submittedCount),
        hasInProgressAttempt: row.hasInProgressAttempt,
      },
    ]),
  );
}
