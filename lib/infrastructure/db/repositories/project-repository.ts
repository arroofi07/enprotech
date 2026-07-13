import { and, count, desc, eq, ilike, or, type SQL } from "drizzle-orm";

import { db } from "@/lib/db";
import { studentProjects } from "@/lib/db/schema/student-projects";
import { trainings } from "@/lib/db/schema/trainings";
import { users } from "@/lib/db/schema/users";
import type { StudentProject } from "@/lib/db/schema/student-projects";

export type UpsertProjectInput = {
  studentId: string;
  trainingId: string;
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

export async function upsertProject(
  input: UpsertProjectInput,
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
    .onConflictDoUpdate({
      target: [studentProjects.studentId, studentProjects.trainingId],
      set: {
        title: input.title ?? null,
        description: input.description ?? null,
        imageUrl: input.imageUrl,
        videoUrl: input.videoUrl,
        pdfUrl: input.pdfUrl,
        pdfFileSize: input.pdfFileSize ?? null,
        updatedAt: new Date(),
      },
    })
    .returning();

  return project;
}

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
