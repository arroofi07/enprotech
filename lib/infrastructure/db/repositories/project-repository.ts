import { and, count, desc, eq, ilike, or, type SQL } from "drizzle-orm";

import { db } from "@/lib/db";
import { studentProjects } from "@/lib/db/schema/student-projects";
import { trainings } from "@/lib/db/schema/trainings";
import { users } from "@/lib/db/schema/users";
import type { StudentProject } from "@/lib/db/schema/student-projects";

export type InsertProjectInput = {
  studentId: string;
  trainingId: string;
  title?: string;
  description?: string;
  imageUrl: string;
  videoUrl: string;
  pdfUrl: string;
  pdfFileSize?: number;
};

export type UpdateProjectInput = {
  title?: string;
  description?: string;
  imageUrl: string;
  videoUrl: string;
  pdfUrl: string;
  pdfFileSize?: number;
};

export type ProjectListItem = {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  trainingId: string;
  trainingTitle: string;
  title: string | null;
  description: string | null;
  imageUrl: string;
  videoUrl: string;
  pdfUrl: string;
  pdfFileSize: number | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ListProjectsQuery = {
  search?: string;
  trainingId?: string;
  page: number;
  pageSize: number;
};

const projectListColumns = {
  id: studentProjects.id,
  studentId: studentProjects.studentId,
  studentName: users.name,
  studentEmail: users.email,
  trainingId: studentProjects.trainingId,
  trainingTitle: trainings.title,
  title: studentProjects.title,
  description: studentProjects.description,
  imageUrl: studentProjects.imageUrl,
  videoUrl: studentProjects.videoUrl,
  pdfUrl: studentProjects.pdfUrl,
  pdfFileSize: studentProjects.pdfFileSize,
  createdAt: studentProjects.createdAt,
  updatedAt: studentProjects.updatedAt,
};

function buildListFilters(query: ListProjectsQuery): SQL | undefined {
  const conditions: SQL[] = [];

  if (query.trainingId) {
    conditions.push(eq(studentProjects.trainingId, query.trainingId));
  }

  if (query.search?.trim()) {
    const term = `%${query.search.trim()}%`;
    const searchCondition = or(
      ilike(users.name, term),
      ilike(users.email, term),
    );

    if (searchCondition) {
      conditions.push(searchCondition);
    }
  }

  if (conditions.length === 0) {
    return undefined;
  }

  if (conditions.length === 1) {
    return conditions[0];
  }

  return and(...conditions);
}

export async function insertProject(
  input: InsertProjectInput,
): Promise<StudentProject> {
  const [project] = await db
    .insert(studentProjects)
    .values({
      studentId: input.studentId,
      trainingId: input.trainingId,
      title: input.title ?? null,
      description: input.description ?? null,
      imageUrl: input.imageUrl,
      videoUrl: input.videoUrl,
      pdfUrl: input.pdfUrl,
      pdfFileSize: input.pdfFileSize ?? null,
    })
    .returning();

  return project;
}

export async function updateProjectForStudent(
  projectId: string,
  studentId: string,
  input: UpdateProjectInput,
): Promise<StudentProject | null> {
  const [project] = await db
    .update(studentProjects)
    .set({
      title: input.title ?? null,
      description: input.description ?? null,
      imageUrl: input.imageUrl,
      videoUrl: input.videoUrl,
      pdfUrl: input.pdfUrl,
      pdfFileSize: input.pdfFileSize ?? null,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(studentProjects.id, projectId),
        eq(studentProjects.studentId, studentId),
      ),
    )
    .returning();

  return project ?? null;
}

export async function deleteProjectForStudent(
  projectId: string,
  studentId: string,
): Promise<boolean> {
  const deleted = await db
    .delete(studentProjects)
    .where(
      and(
        eq(studentProjects.id, projectId),
        eq(studentProjects.studentId, studentId),
      ),
    )
    .returning({ id: studentProjects.id });

  return deleted.length > 0;
}

export async function countProjectsByStudentAndTraining(
  studentId: string,
  trainingId: string,
): Promise<number> {
  const [result] = await db
    .select({ value: count() })
    .from(studentProjects)
    .where(
      and(
        eq(studentProjects.studentId, studentId),
        eq(studentProjects.trainingId, trainingId),
      ),
    );

  return Number(result?.value ?? 0);
}

/**
 * Returns the earliest project a student submitted for a training (if any).
 * Used by the certificate/flow gate, which only cares whether at least one
 * project exists.
 */
export async function findProjectByStudentAndTraining(
  studentId: string,
  trainingId: string,
): Promise<StudentProject | null> {
  const [project] = await db
    .select()
    .from(studentProjects)
    .where(
      and(
        eq(studentProjects.studentId, studentId),
        eq(studentProjects.trainingId, trainingId),
      ),
    )
    .orderBy(studentProjects.createdAt)
    .limit(1);

  return project ?? null;
}

export async function listProjectsByStudentAndTraining(
  studentId: string,
  trainingId: string,
): Promise<StudentProject[]> {
  return db
    .select()
    .from(studentProjects)
    .where(
      and(
        eq(studentProjects.studentId, studentId),
        eq(studentProjects.trainingId, trainingId),
      ),
    )
    .orderBy(studentProjects.createdAt);
}

export async function findProjectByIdForStudent(
  projectId: string,
  studentId: string,
): Promise<StudentProject | null> {
  const [project] = await db
    .select()
    .from(studentProjects)
    .where(
      and(
        eq(studentProjects.id, projectId),
        eq(studentProjects.studentId, studentId),
      ),
    )
    .limit(1);

  return project ?? null;
}

export async function listProjectsByStudent(
  studentId: string,
): Promise<StudentProject[]> {
  return db
    .select()
    .from(studentProjects)
    .where(eq(studentProjects.studentId, studentId))
    .orderBy(desc(studentProjects.updatedAt));
}

export async function listProjects(
  query: ListProjectsQuery,
): Promise<{ items: ProjectListItem[]; total: number }> {
  const where = buildListFilters(query);
  const offset = (query.page - 1) * query.pageSize;

  const [items, totalResult] = await Promise.all([
    db
      .select(projectListColumns)
      .from(studentProjects)
      .innerJoin(users, eq(studentProjects.studentId, users.id))
      .innerJoin(trainings, eq(studentProjects.trainingId, trainings.id))
      .where(where)
      .orderBy(desc(studentProjects.updatedAt))
      .limit(query.pageSize)
      .offset(offset),
    db
      .select({ value: count() })
      .from(studentProjects)
      .innerJoin(users, eq(studentProjects.studentId, users.id))
      .innerJoin(trainings, eq(studentProjects.trainingId, trainings.id))
      .where(where),
  ]);

  return {
    items,
    total: Number(totalResult[0]?.value ?? 0),
  };
}
