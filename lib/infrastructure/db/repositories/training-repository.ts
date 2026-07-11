import {
  and,
  count,
  desc,
  eq,
  ilike,
  inArray,
  notInArray,
  type SQL,
} from "drizzle-orm";

import { db } from "@/lib/db";
import { moduleContents, moduleProgress, modules } from "@/lib/db/schema/modules";
import { enrollments, trainings } from "@/lib/db/schema/trainings";
import { users } from "@/lib/db/schema/users";
import type { EnrollmentStatus, TrainingStatus } from "@/lib/domain/trainings/types";

export type TrainingRecord = {
  id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  passingGrade: number;
  deadline: string | null;
  status: TrainingStatus;
  isPretestActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
};

export type EnrollmentRecord = {
  id: string;
  studentId: string;
  trainingId: string;
  status: EnrollmentStatus;
  enrolledAt: Date;
  completedAt: Date | null;
  studentName: string;
  studentEmail: string;
};

export type EnrolledTrainingBase = TrainingRecord & {
  enrollmentId: string;
  enrollmentStatus: EnrollmentStatus;
  enrolledAt: Date;
};

export type EnrolledTrainingRecord = EnrolledTrainingBase & {
  progressPercent: number;
  completedModules: number;
  totalModules: number;
  completedQuizzes: number;
  totalQuizzes: number;
  completedLatihans: number;
  totalLatihans: number;
  completedItems: number;
  totalItems: number;
};

export type ListTrainingsQuery = {
  search?: string;
  status?: TrainingStatus;
  page: number;
  pageSize: number;
};

export type CreateTrainingInput = {
  title: string;
  description?: string;
  thumbnail?: string;
  passingGrade?: number;
  deadline?: Date | null;
  createdBy: string;
};

export type UpdateTrainingInput = {
  title?: string;
  description?: string | null;
  thumbnail?: string | null;
  passingGrade?: number;
  deadline?: Date | null;
  status?: TrainingStatus;
  isPretestActive?: boolean;
};

const trainingColumns = {
  id: trainings.id,
  title: trainings.title,
  description: trainings.description,
  thumbnail: trainings.thumbnail,
  passingGrade: trainings.passingGrade,
  deadline: trainings.deadline,
  status: trainings.status,
  isPretestActive: trainings.isPretestActive,
  createdBy: trainings.createdBy,
  createdAt: trainings.createdAt,
  updatedAt: trainings.updatedAt,
};

function mapTraining(
  record: typeof trainings.$inferSelect,
): TrainingRecord {
  return {
    id: record.id,
    title: record.title,
    description: record.description,
    thumbnail: record.thumbnail,
    passingGrade: record.passingGrade,
    deadline: record.deadline,
    status: record.status,
    isPretestActive: record.isPretestActive,
    createdBy: record.createdBy,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

function formatDeadline(deadline: Date | string | null | undefined): string | null {
  if (!deadline) {
    return null;
  }

  if (deadline instanceof Date) {
    const year = deadline.getFullYear();
    const month = String(deadline.getMonth() + 1).padStart(2, "0");
    const day = String(deadline.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  return deadline;
}

function buildListFilters(query: ListTrainingsQuery): SQL | undefined {
  const conditions: SQL[] = [];

  if (query.status) {
    conditions.push(eq(trainings.status, query.status));
  }

  if (query.search?.trim()) {
    const term = `%${query.search.trim()}%`;
    conditions.push(ilike(trainings.title, term));
  }

  if (conditions.length === 0) {
    return undefined;
  }

  if (conditions.length === 1) {
    return conditions[0];
  }

  return and(...conditions);
}

export async function createTraining(
  input: CreateTrainingInput,
): Promise<TrainingRecord> {
  const [training] = await db
    .insert(trainings)
    .values({
      title: input.title,
      description: input.description,
      thumbnail: input.thumbnail,
      passingGrade: input.passingGrade ?? 70,
      deadline: formatDeadline(input.deadline),
      createdBy: input.createdBy,
    })
    .returning();

  return mapTraining(training);
}

export async function findTrainingById(
  id: string,
): Promise<TrainingRecord | null> {
  const [training] = await db
    .select(trainingColumns)
    .from(trainings)
    .where(eq(trainings.id, id))
    .limit(1);

  return training ? mapTraining(training) : null;
}

export async function updateTraining(
  id: string,
  input: UpdateTrainingInput,
): Promise<TrainingRecord | null> {
  const [training] = await db
    .update(trainings)
    .set({
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.description !== undefined
        ? { description: input.description }
        : {}),
      ...(input.thumbnail !== undefined ? { thumbnail: input.thumbnail } : {}),
      ...(input.passingGrade !== undefined
        ? { passingGrade: input.passingGrade }
        : {}),
      ...(input.deadline !== undefined
        ? { deadline: formatDeadline(input.deadline) }
        : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.isPretestActive !== undefined
        ? { isPretestActive: input.isPretestActive }
        : {}),
    })
    .where(eq(trainings.id, id))
    .returning(trainingColumns);

  return training ? mapTraining(training) : null;
}

export async function listTrainings(
  query: ListTrainingsQuery,
): Promise<{ items: TrainingRecord[]; total: number }> {
  const where = buildListFilters(query);
  const offset = (query.page - 1) * query.pageSize;

  const [items, totalResult] = await Promise.all([
    db
      .select(trainingColumns)
      .from(trainings)
      .where(where)
      .orderBy(desc(trainings.createdAt))
      .limit(query.pageSize)
      .offset(offset),
    db.select({ value: count() }).from(trainings).where(where),
  ]);

  return {
    items: items.map(mapTraining),
    total: totalResult[0]?.value ?? 0,
  };
}

export async function listEnrollmentsByTraining(
  trainingId: string,
): Promise<EnrollmentRecord[]> {
  const rows = await db
    .select({
      id: enrollments.id,
      studentId: enrollments.studentId,
      trainingId: enrollments.trainingId,
      status: enrollments.status,
      enrolledAt: enrollments.enrolledAt,
      completedAt: enrollments.completedAt,
      studentName: users.name,
      studentEmail: users.email,
    })
    .from(enrollments)
    .innerJoin(users, eq(enrollments.studentId, users.id))
    .where(eq(enrollments.trainingId, trainingId))
    .orderBy(desc(enrollments.enrolledAt));

  return rows;
}

export async function findEnrollmentById(
  enrollmentId: string,
): Promise<EnrollmentRecord | null> {
  const [row] = await db
    .select({
      id: enrollments.id,
      studentId: enrollments.studentId,
      trainingId: enrollments.trainingId,
      status: enrollments.status,
      enrolledAt: enrollments.enrolledAt,
      completedAt: enrollments.completedAt,
      studentName: users.name,
      studentEmail: users.email,
    })
    .from(enrollments)
    .innerJoin(users, eq(enrollments.studentId, users.id))
    .where(eq(enrollments.id, enrollmentId))
    .limit(1);

  return row ?? null;
}

export async function findExistingEnrollmentStudentIds(
  trainingId: string,
  studentIds: string[],
): Promise<string[]> {
  if (studentIds.length === 0) {
    return [];
  }

  const rows = await db
    .select({ studentId: enrollments.studentId })
    .from(enrollments)
    .where(
      and(
        eq(enrollments.trainingId, trainingId),
        inArray(enrollments.studentId, studentIds),
      ),
    );

  return rows.map((row) => row.studentId);
}

export async function enrollStudents(
  trainingId: string,
  studentIds: string[],
): Promise<EnrollmentRecord[]> {
  if (studentIds.length === 0) {
    return [];
  }

  const inserted = await db
    .insert(enrollments)
    .values(
      studentIds.map((studentId) => ({
        trainingId,
        studentId,
      })),
    )
    .returning({ id: enrollments.id });

  const enrollmentIds = inserted.map((row) => row.id);
  const rows = await db
    .select({
      id: enrollments.id,
      studentId: enrollments.studentId,
      trainingId: enrollments.trainingId,
      status: enrollments.status,
      enrolledAt: enrollments.enrolledAt,
      completedAt: enrollments.completedAt,
      studentName: users.name,
      studentEmail: users.email,
    })
    .from(enrollments)
    .innerJoin(users, eq(enrollments.studentId, users.id))
    .where(inArray(enrollments.id, enrollmentIds))
    .orderBy(desc(enrollments.enrolledAt));

  return rows;
}

export async function removeEnrollment(enrollmentId: string): Promise<boolean> {
  const deleted = await db
    .delete(enrollments)
    .where(eq(enrollments.id, enrollmentId))
    .returning({ id: enrollments.id });

  return deleted.length > 0;
}

export async function countActiveStudentsByIds(
  studentIds: string[],
): Promise<number> {
  if (studentIds.length === 0) {
    return 0;
  }

  const [result] = await db
    .select({ value: count() })
    .from(users)
    .where(
      and(
        inArray(users.id, studentIds),
        eq(users.role, "student"),
        eq(users.status, "active"),
      ),
    );

  return result?.value ?? 0;
}

export async function areAllModulesReady(trainingId: string): Promise<boolean> {
  const moduleRows = await db
    .select({ id: modules.id })
    .from(modules)
    .where(eq(modules.trainingId, trainingId));

  if (moduleRows.length === 0) {
    return false;
  }

  const moduleIds = moduleRows.map((row) => row.id);
  const contentCounts = await db
    .select({
      moduleId: moduleContents.moduleId,
      value: count(),
    })
    .from(moduleContents)
    .where(inArray(moduleContents.moduleId, moduleIds))
    .groupBy(moduleContents.moduleId);

  const modulesWithContent = new Set(
    contentCounts
      .filter((row) => row.value > 0)
      .map((row) => row.moduleId),
  );

  return moduleIds.every((moduleId) => modulesWithContent.has(moduleId));
}

export async function setPretestActive(
  trainingId: string,
  active: boolean,
): Promise<TrainingRecord | null> {
  const [training] = await db
    .update(trainings)
    .set({ isPretestActive: active })
    .where(eq(trainings.id, trainingId))
    .returning(trainingColumns);

  return training ? mapTraining(training) : null;
}

export async function listEnrolledTrainingsByStudent(
  studentId: string,
  query: { page: number; pageSize: number; search?: string },
): Promise<{ items: EnrolledTrainingBase[]; total: number }> {
  const conditions: SQL[] = [
    eq(enrollments.studentId, studentId),
    notInArray(trainings.status, ["draft", "archived"]),
  ];

  if (query.search?.trim()) {
    const term = `%${query.search.trim()}%`;
    conditions.push(ilike(trainings.title, term));
  }

  const where = and(...conditions);
  const offset = (query.page - 1) * query.pageSize;

  const [rows, totalResult] = await Promise.all([
    db
      .select({
        ...trainingColumns,
        enrollmentId: enrollments.id,
        enrollmentStatus: enrollments.status,
        enrolledAt: enrollments.enrolledAt,
      })
      .from(enrollments)
      .innerJoin(trainings, eq(enrollments.trainingId, trainings.id))
      .where(where)
      .orderBy(desc(enrollments.enrolledAt))
      .limit(query.pageSize)
      .offset(offset),
    db.select({ value: count() }).from(enrollments).innerJoin(
      trainings,
      eq(enrollments.trainingId, trainings.id),
    ).where(where),
  ]);

  return {
    items: rows.map((row) => ({
      ...mapTraining(row),
      enrollmentId: row.enrollmentId,
      enrollmentStatus: row.enrollmentStatus,
      enrolledAt: row.enrolledAt,
    })),
    total: totalResult[0]?.value ?? 0,
  };
}

export async function countTrainingsByStatus(
  status: TrainingStatus,
): Promise<number> {
  const [result] = await db
    .select({ value: count() })
    .from(trainings)
    .where(eq(trainings.status, status));

  return result?.value ?? 0;
}

export async function areAllModulesCompleted(
  studentId: string,
  trainingId: string,
): Promise<boolean> {
  const moduleRows = await db
    .select({ id: modules.id })
    .from(modules)
    .where(eq(modules.trainingId, trainingId));

  if (moduleRows.length === 0) {
    return false;
  }

  const moduleIds = moduleRows.map((row) => row.id);
  const progressRows = await db
    .select({
      moduleId: moduleProgress.moduleId,
      status: moduleProgress.status,
    })
    .from(moduleProgress)
    .where(
      and(
        eq(moduleProgress.studentId, studentId),
        inArray(moduleProgress.moduleId, moduleIds),
      ),
    );

  const completedModuleIds = new Set(
    progressRows
      .filter((row) => row.status === "completed")
      .map((row) => row.moduleId),
  );

  return moduleIds.every((moduleId) => completedModuleIds.has(moduleId));
}

export async function trainingHasEnrollments(trainingId: string): Promise<boolean> {
  const [result] = await db
    .select({ value: count() })
    .from(enrollments)
    .where(eq(enrollments.trainingId, trainingId));

  return (result?.value ?? 0) > 0;
}
