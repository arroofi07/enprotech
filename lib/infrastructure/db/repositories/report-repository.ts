import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  lte,
  or,
  sql,
  type SQL,
} from "drizzle-orm";

import { db } from "@/lib/db";
import { assessmentAttempts, assessments } from "@/lib/db/schema/assessments";
import { moduleProgress, modules } from "@/lib/db/schema/modules";
import { enrollments, trainings } from "@/lib/db/schema/trainings";
import { users } from "@/lib/db/schema/users";
import type { ModuleProgressStatus } from "@/lib/domain/modules/types";
import type { TrainingReportRow } from "@/lib/domain/reports/types";
import type { EnrollmentStatus } from "@/lib/domain/trainings/types";

export type ListTrainingReportQuery = {
  studentId?: string;
  trainingId?: string;
  moduleId?: string;
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
  page: number;
  pageSize: number;
};

type ReportBaseRow = {
  studentId: string;
  studentName: string;
  studentEmail: string;
  trainingId: string;
  trainingTitle: string;
  moduleId: string;
  moduleTitle: string;
  moduleOrder: number;
  moduleStatus: ModuleProgressStatus;
  enrollmentStatus: EnrollmentStatus;
  enrolledAt: Date;
  completedAt: Date | null;
};

function buildReportWhereClause(query: ListTrainingReportQuery): SQL | undefined {
  const conditions: SQL[] = [eq(users.role, "student")];

  if (query.studentId) {
    conditions.push(eq(enrollments.studentId, query.studentId));
  }

  if (query.trainingId) {
    conditions.push(eq(trainings.id, query.trainingId));
  }

  if (query.moduleId) {
    conditions.push(eq(modules.id, query.moduleId));
  }

  if (query.search) {
    conditions.push(
      or(
        ilike(users.name, `%${query.search}%`),
        ilike(users.email, `%${query.search}%`),
      )!,
    );
  }

  if (query.dateFrom || query.dateTo) {
    const dateConditions: SQL[] = [];

    if (query.dateFrom) {
      dateConditions.push(gte(enrollments.enrolledAt, query.dateFrom));
      dateConditions.push(
        gte(moduleProgress.completedAt, query.dateFrom),
      );
    }

    if (query.dateTo) {
      dateConditions.push(lte(enrollments.enrolledAt, query.dateTo));
      dateConditions.push(
        lte(moduleProgress.completedAt, query.dateTo),
      );
    }

    if (dateConditions.length > 0) {
      conditions.push(or(...dateConditions)!);
    }
  }

  return conditions.length > 0 ? and(...conditions) : undefined;
}

function mapBaseRow(row: {
  studentId: string;
  studentName: string;
  studentEmail: string;
  trainingId: string;
  trainingTitle: string;
  moduleId: string;
  moduleTitle: string;
  moduleOrder: number;
  moduleStatus: ModuleProgressStatus | null;
  enrollmentStatus: EnrollmentStatus;
  enrolledAt: Date;
  completedAt: Date | null;
}): ReportBaseRow {
  return {
    studentId: row.studentId,
    studentName: row.studentName,
    studentEmail: row.studentEmail,
    trainingId: row.trainingId,
    trainingTitle: row.trainingTitle,
    moduleId: row.moduleId,
    moduleTitle: row.moduleTitle,
    moduleOrder: row.moduleOrder,
    moduleStatus: row.moduleStatus ?? "not_started",
    enrollmentStatus: row.enrollmentStatus,
    enrolledAt: row.enrolledAt,
    completedAt: row.completedAt,
  };
}

async function enrichRowsWithScores(
  rows: ReportBaseRow[],
): Promise<TrainingReportRow[]> {
  if (rows.length === 0) {
    return [];
  }

  const moduleIds = [...new Set(rows.map((row) => row.moduleId))];
  const assessmentRows = await db
    .select({
      id: assessments.id,
      moduleId: assessments.moduleId,
      type: assessments.type,
    })
    .from(assessments)
    .where(
      and(
        inArray(assessments.moduleId, moduleIds),
        inArray(assessments.type, ["quiz", "latihan"]),
      ),
    );

  const assessmentByModule = new Map<
    string,
    { quizId?: string; latihanId?: string }
  >();

  for (const assessment of assessmentRows) {
    if (!assessment.moduleId) {
      continue;
    }

    const current = assessmentByModule.get(assessment.moduleId) ?? {};
    if (assessment.type === "quiz") {
      current.quizId = assessment.id;
    } else if (assessment.type === "latihan") {
      current.latihanId = assessment.id;
    }
    assessmentByModule.set(assessment.moduleId, current);
  }

  const assessmentIds = assessmentRows.map((row) => row.id);
  const studentIds = [...new Set(rows.map((row) => row.studentId))];

  const scoreByStudentAssessment = new Map<string, number>();

  if (assessmentIds.length > 0 && studentIds.length > 0) {
    const scoreRows = await db
      .select({
        studentId: assessmentAttempts.studentId,
        assessmentId: assessmentAttempts.assessmentId,
        bestScore: sql<number>`max(${assessmentAttempts.score})`,
      })
      .from(assessmentAttempts)
      .where(
        and(
          inArray(assessmentAttempts.studentId, studentIds),
          inArray(assessmentAttempts.assessmentId, assessmentIds),
          sql`${assessmentAttempts.submittedAt} is not null`,
        ),
      )
      .groupBy(
        assessmentAttempts.studentId,
        assessmentAttempts.assessmentId,
      );

    for (const scoreRow of scoreRows) {
      scoreByStudentAssessment.set(
        `${scoreRow.studentId}:${scoreRow.assessmentId}`,
        scoreRow.bestScore,
      );
    }
  }

  return rows.map((row) => {
    const moduleAssessments = assessmentByModule.get(row.moduleId);
    const quizScore = moduleAssessments?.quizId
      ? (scoreByStudentAssessment.get(
          `${row.studentId}:${moduleAssessments.quizId}`,
        ) ?? null)
      : null;
    const latihanScore = moduleAssessments?.latihanId
      ? (scoreByStudentAssessment.get(
          `${row.studentId}:${moduleAssessments.latihanId}`,
        ) ?? null)
      : null;

    return {
      rowKey: `${row.studentId}:${row.moduleId}`,
      studentId: row.studentId,
      studentName: row.studentName,
      studentEmail: row.studentEmail,
      trainingId: row.trainingId,
      trainingTitle: row.trainingTitle,
      moduleId: row.moduleId,
      moduleTitle: row.moduleTitle,
      moduleOrder: row.moduleOrder,
      quizScore,
      latihanScore,
      moduleStatus: row.moduleStatus,
      enrollmentStatus: row.enrollmentStatus,
      enrolledAt: row.enrolledAt.toISOString(),
      completedAt: row.completedAt?.toISOString() ?? null,
    };
  });
}

function buildBaseSelect() {
  return db
    .select({
      studentId: users.id,
      studentName: users.name,
      studentEmail: users.email,
      trainingId: trainings.id,
      trainingTitle: trainings.title,
      moduleId: modules.id,
      moduleTitle: modules.title,
      moduleOrder: modules.order,
      moduleStatus: moduleProgress.status,
      enrollmentStatus: enrollments.status,
      enrolledAt: enrollments.enrolledAt,
      completedAt: moduleProgress.completedAt,
    })
    .from(enrollments)
    .innerJoin(users, eq(enrollments.studentId, users.id))
    .innerJoin(trainings, eq(enrollments.trainingId, trainings.id))
    .innerJoin(modules, eq(modules.trainingId, trainings.id))
    .leftJoin(
      moduleProgress,
      and(
        eq(moduleProgress.moduleId, modules.id),
        eq(moduleProgress.studentId, enrollments.studentId),
      ),
    );
}

export async function listTrainingReportRows(
  query: ListTrainingReportQuery,
): Promise<{ items: TrainingReportRow[]; total: number }> {
  const where = buildReportWhereClause(query);
  const offset = (query.page - 1) * query.pageSize;

  const [baseRows, totalResult] = await Promise.all([
    buildBaseSelect()
      .where(where)
      .orderBy(
        desc(enrollments.enrolledAt),
        asc(users.name),
        asc(modules.order),
      )
      .limit(query.pageSize)
      .offset(offset),
    db
      .select({ value: count() })
      .from(enrollments)
      .innerJoin(users, eq(enrollments.studentId, users.id))
      .innerJoin(trainings, eq(enrollments.trainingId, trainings.id))
      .innerJoin(modules, eq(modules.trainingId, trainings.id))
      .leftJoin(
        moduleProgress,
        and(
          eq(moduleProgress.moduleId, modules.id),
          eq(moduleProgress.studentId, enrollments.studentId),
        ),
      )
      .where(where),
  ]);

  const items = await enrichRowsWithScores(
    baseRows.map((row) => mapBaseRow(row)),
  );

  return {
    items,
    total: Number(totalResult[0]?.value ?? 0),
  };
}

export async function listAllTrainingReportRows(
  query: Omit<ListTrainingReportQuery, "page" | "pageSize">,
): Promise<TrainingReportRow[]> {
  const where = buildReportWhereClause({
    ...query,
    page: 1,
    pageSize: 1,
  });

  const baseRows = await buildBaseSelect()
    .where(where)
    .orderBy(
      desc(enrollments.enrolledAt),
      asc(users.name),
      asc(modules.order),
    );

  return enrichRowsWithScores(baseRows.map((row) => mapBaseRow(row)));
}

export type ReportFilterOption = {
  id: string;
  label: string;
};

export async function listTrainingFilterOptions(): Promise<ReportFilterOption[]> {
  const rows = await db
    .select({
      id: trainings.id,
      label: trainings.title,
    })
    .from(trainings)
    .orderBy(desc(trainings.createdAt));

  return rows;
}

export async function listModuleFilterOptions(
  trainingId: string,
): Promise<ReportFilterOption[]> {
  const rows = await db
    .select({
      id: modules.id,
      label: modules.title,
    })
    .from(modules)
    .where(eq(modules.trainingId, trainingId))
    .orderBy(asc(modules.order));

  return rows;
}

export async function isStudentEnrolled(
  studentId: string,
  trainingId: string,
): Promise<boolean> {
  const [row] = await db
    .select({ id: enrollments.id })
    .from(enrollments)
    .where(
      and(
        eq(enrollments.studentId, studentId),
        eq(enrollments.trainingId, trainingId),
      ),
    )
    .limit(1);

  return Boolean(row);
}

export async function findEnrollmentSummary(
  studentId: string,
  trainingId: string,
): Promise<{
  studentName: string;
  studentEmail: string;
  trainingTitle: string;
  enrollmentStatus: EnrollmentStatus;
  enrolledAt: Date;
  completedAt: Date | null;
} | null> {
  const [row] = await db
    .select({
      studentName: users.name,
      studentEmail: users.email,
      trainingTitle: trainings.title,
      enrollmentStatus: enrollments.status,
      enrolledAt: enrollments.enrolledAt,
      completedAt: enrollments.completedAt,
    })
    .from(enrollments)
    .innerJoin(users, eq(enrollments.studentId, users.id))
    .innerJoin(trainings, eq(enrollments.trainingId, trainings.id))
    .where(
      and(
        eq(enrollments.studentId, studentId),
        eq(enrollments.trainingId, trainingId),
      ),
    )
    .limit(1);

  return row ?? null;
}
