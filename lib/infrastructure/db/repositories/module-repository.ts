import { and, asc, eq, inArray, notInArray, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  moduleContents,
  moduleProgress,
  modules,
} from "@/lib/db/schema/modules";
import { enrollments, trainings } from "@/lib/db/schema/trainings";
import type {
  ModuleContentType,
  ModuleProgressStatus,
} from "@/lib/domain/modules/types";

export type ModuleRecord = {
  id: string;
  trainingId: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  videoConferenceLink: string | null;
  minQuizScore: number;
  minLatihanScore: number;
  minAttendance: number;
  order: number;
  createdAt: Date;
  updatedAt: Date;
};

export type ModuleContentRecord = {
  id: string;
  moduleId: string;
  type: ModuleContentType;
  title: string;
  url: string;
  fileSize: number | null;
  order: number;
  createdAt: Date;
};

export type ModuleWithContents = ModuleRecord & {
  contents: ModuleContentRecord[];
};

export type ModuleProgressRecord = {
  id: string;
  studentId: string;
  moduleId: string;
  status: ModuleProgressStatus;
  completedAt: Date | null;
};

export type StudentModuleDetail = ModuleWithContents & {
  progress: ModuleProgressRecord | null;
};

const moduleColumns = {
  id: modules.id,
  trainingId: modules.trainingId,
  title: modules.title,
  description: modules.description,
  thumbnail: modules.thumbnail,
  videoConferenceLink: modules.videoConferenceLink,
  minQuizScore: modules.minQuizScore,
  minLatihanScore: modules.minLatihanScore,
  minAttendance: modules.minAttendance,
  order: modules.order,
  createdAt: modules.createdAt,
  updatedAt: modules.updatedAt,
};

const contentColumns = {
  id: moduleContents.id,
  moduleId: moduleContents.moduleId,
  type: moduleContents.type,
  title: moduleContents.title,
  url: moduleContents.url,
  fileSize: moduleContents.fileSize,
  order: moduleContents.order,
  createdAt: moduleContents.createdAt,
};

function mapModule(row: typeof modules.$inferSelect): ModuleRecord {
  return {
    id: row.id,
    trainingId: row.trainingId,
    title: row.title,
    description: row.description,
    thumbnail: row.thumbnail,
    videoConferenceLink: row.videoConferenceLink,
    minQuizScore: row.minQuizScore,
    minLatihanScore: row.minLatihanScore,
    minAttendance: row.minAttendance,
    order: row.order,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function mapContent(
  row: typeof moduleContents.$inferSelect,
): ModuleContentRecord {
  return {
    id: row.id,
    moduleId: row.moduleId,
    type: row.type,
    title: row.title,
    url: row.url,
    fileSize: row.fileSize,
    order: row.order,
    createdAt: row.createdAt,
  };
}

export async function findTrainingByIdForModule(
  trainingId: string,
): Promise<{ id: string; status: string } | null> {
  const [training] = await db
    .select({ id: trainings.id, status: trainings.status })
    .from(trainings)
    .where(eq(trainings.id, trainingId));

  return training ?? null;
}

export async function isStudentEnrolledInTraining(
  studentId: string,
  trainingId: string,
): Promise<boolean> {
  const [row] = await db
    .select({ id: enrollments.id })
    .from(enrollments)
    .innerJoin(trainings, eq(enrollments.trainingId, trainings.id))
    .where(
      and(
        eq(enrollments.studentId, studentId),
        eq(enrollments.trainingId, trainingId),
        notInArray(trainings.status, ["draft", "archived"]),
      ),
    );

  return Boolean(row);
}

export async function getNextModuleOrder(trainingId: string): Promise<number> {
  const rows = await db
    .select({ order: modules.order })
    .from(modules)
    .where(eq(modules.trainingId, trainingId))
    .orderBy(asc(modules.order));

  if (rows.length === 0) {
    return 0;
  }

  return Math.max(...rows.map((row) => row.order)) + 1;
}

export async function createModule(input: {
  trainingId: string;
  title: string;
  description?: string;
  thumbnail?: string;
  videoConferenceLink?: string;
  minQuizScore?: number;
  minLatihanScore?: number;
  minAttendance?: number;
  order?: number;
  contents?: Array<{
    type: ModuleContentType;
    title: string;
    url: string;
    fileSize?: number;
  }>;
}): Promise<ModuleRecord> {
  const targetOrder =
    input.order ?? (await getNextModuleOrder(input.trainingId));

  return db.transaction(async (tx) => {
    const existingModules = await tx
      .select({ id: modules.id, order: modules.order })
      .from(modules)
      .where(eq(modules.trainingId, input.trainingId))
      .orderBy(asc(modules.order));

    for (const row of [...existingModules].reverse()) {
      if (row.order >= targetOrder) {
        await tx
          .update(modules)
          .set({ order: row.order + 1 })
          .where(eq(modules.id, row.id));
      }
    }

    const [module] = await tx
      .insert(modules)
      .values({
        trainingId: input.trainingId,
        title: input.title,
        description: input.description ?? null,
        thumbnail: input.thumbnail ?? null,
        videoConferenceLink: input.videoConferenceLink ?? null,
        minQuizScore: input.minQuizScore ?? 0,
        minLatihanScore: input.minLatihanScore ?? 0,
        minAttendance: input.minAttendance ?? 0,
        order: targetOrder,
      })
      .returning(moduleColumns);

    if (input.contents?.length) {
      for (let index = 0; index < input.contents.length; index += 1) {
        const content = input.contents[index]!;
        await tx.insert(moduleContents).values({
          moduleId: module.id,
          type: content.type,
          title: content.title,
          url: content.url,
          fileSize: content.fileSize ?? null,
          order: index,
        });
      }
    }

    return mapModule(module);
  });
}

export async function findModuleById(
  moduleId: string,
): Promise<ModuleRecord | null> {
  const [module] = await db
    .select(moduleColumns)
    .from(modules)
    .where(eq(modules.id, moduleId));

  return module ? mapModule(module) : null;
}

export async function findModuleByTrainingAndTitle(
  trainingId: string,
  title: string,
): Promise<ModuleRecord | null> {
  const [module] = await db
    .select(moduleColumns)
    .from(modules)
    .where(and(eq(modules.trainingId, trainingId), eq(modules.title, title)))
    .limit(1);

  return module ? mapModule(module) : null;
}

export async function listModulesByTraining(
  trainingId: string,
): Promise<ModuleWithContents[]> {
  const moduleRows = await db
    .select(moduleColumns)
    .from(modules)
    .where(eq(modules.trainingId, trainingId))
    .orderBy(asc(modules.order));

  if (moduleRows.length === 0) {
    return [];
  }

  const moduleIds = moduleRows.map((row) => row.id);
  const contentRows = await db
    .select(contentColumns)
    .from(moduleContents)
    .where(inArray(moduleContents.moduleId, moduleIds))
    .orderBy(asc(moduleContents.order));

  const contentsByModule = new Map<string, ModuleContentRecord[]>();
  for (const row of contentRows) {
    const current = contentsByModule.get(row.moduleId) ?? [];
    current.push(mapContent(row));
    contentsByModule.set(row.moduleId, current);
  }

  return moduleRows.map((row) => ({
    ...mapModule(row),
    contents: contentsByModule.get(row.id) ?? [],
  }));
}

export async function updateModule(
  moduleId: string,
  input: {
    title?: string;
    description?: string | null;
    thumbnail?: string | null;
    videoConferenceLink?: string | null;
    minQuizScore?: number;
    minLatihanScore?: number;
    minAttendance?: number;
    order?: number;
  },
): Promise<ModuleRecord | null> {
  const [module] = await db
    .update(modules)
    .set(input)
    .where(eq(modules.id, moduleId))
    .returning(moduleColumns);

  return module ? mapModule(module) : null;
}

export async function deleteModule(moduleId: string): Promise<boolean> {
  const result = await db
    .delete(modules)
    .where(eq(modules.id, moduleId))
    .returning({ id: modules.id });

  return result.length > 0;
}

export async function reorderModules(
  trainingId: string,
  moduleIds: string[],
): Promise<ModuleRecord[]> {
  const existing = await db
    .select({ id: modules.id })
    .from(modules)
    .where(eq(modules.trainingId, trainingId));

  const existingIds = new Set(existing.map((row) => row.id));
  const validIds = moduleIds.filter((id) => existingIds.has(id));

  if (validIds.length !== existing.length) {
    return [];
  }

  await db.transaction(async (tx) => {
    for (let index = 0; index < validIds.length; index += 1) {
      await tx
        .update(modules)
        .set({ order: index })
        .where(eq(modules.id, validIds[index]!));
    }
  });

  return listModulesByTraining(trainingId).then((rows) =>
    rows.map(({ contents: _contents, ...module }) => module),
  );
}

export async function getNextContentOrder(moduleId: string): Promise<number> {
  const rows = await db
    .select({ order: moduleContents.order })
    .from(moduleContents)
    .where(eq(moduleContents.moduleId, moduleId))
    .orderBy(asc(moduleContents.order));

  if (rows.length === 0) {
    return 0;
  }

  return Math.max(...rows.map((row) => row.order)) + 1;
}

export async function createModuleContent(input: {
  moduleId: string;
  type: ModuleContentType;
  title: string;
  url: string;
  fileSize?: number;
}): Promise<ModuleContentRecord> {
  const order = await getNextContentOrder(input.moduleId);

  const [content] = await db
    .insert(moduleContents)
    .values({
      moduleId: input.moduleId,
      type: input.type,
      title: input.title,
      url: input.url,
      fileSize: input.fileSize ?? null,
      order,
    })
    .returning(contentColumns);

  return mapContent(content);
}

export async function findModuleContentById(
  contentId: string,
): Promise<ModuleContentRecord | null> {
  const [content] = await db
    .select(contentColumns)
    .from(moduleContents)
    .where(eq(moduleContents.id, contentId));

  return content ? mapContent(content) : null;
}

export async function updateModuleContent(
  contentId: string,
  input: {
    title?: string;
    url?: string;
    fileSize?: number | null;
  },
): Promise<ModuleContentRecord | null> {
  const [content] = await db
    .update(moduleContents)
    .set(input)
    .where(eq(moduleContents.id, contentId))
    .returning(contentColumns);

  return content ? mapContent(content) : null;
}

export async function deleteModuleContent(contentId: string): Promise<boolean> {
  const result = await db
    .delete(moduleContents)
    .where(eq(moduleContents.id, contentId))
    .returning({ id: moduleContents.id });

  return result.length > 0;
}

export async function reorderModuleContents(
  moduleId: string,
  contentIds: string[],
): Promise<ModuleContentRecord[]> {
  const existing = await db
    .select({ id: moduleContents.id })
    .from(moduleContents)
    .where(eq(moduleContents.moduleId, moduleId));

  const existingIds = new Set(existing.map((row) => row.id));
  const validIds = contentIds.filter((id) => existingIds.has(id));

  if (validIds.length !== existing.length) {
    return [];
  }

  await db.transaction(async (tx) => {
    for (let index = 0; index < validIds.length; index += 1) {
      await tx
        .update(moduleContents)
        .set({ order: index })
        .where(eq(moduleContents.id, validIds[index]!));
    }
  });

  const rows = await db
    .select(contentColumns)
    .from(moduleContents)
    .where(eq(moduleContents.moduleId, moduleId))
    .orderBy(asc(moduleContents.order));

  return rows.map(mapContent);
}

export async function getModuleProgress(
  studentId: string,
  moduleId: string,
): Promise<ModuleProgressRecord | null> {
  const [row] = await db
    .select({
      id: moduleProgress.id,
      studentId: moduleProgress.studentId,
      moduleId: moduleProgress.moduleId,
      status: moduleProgress.status,
      completedAt: moduleProgress.completedAt,
    })
    .from(moduleProgress)
    .where(
      and(
        eq(moduleProgress.studentId, studentId),
        eq(moduleProgress.moduleId, moduleId),
      ),
    );

  return row ?? null;
}

export async function listModuleProgressByTraining(
  studentId: string,
  trainingId: string,
): Promise<Map<string, ModuleProgressRecord>> {
  const rows = await db
    .select({
      id: moduleProgress.id,
      studentId: moduleProgress.studentId,
      moduleId: moduleProgress.moduleId,
      status: moduleProgress.status,
      completedAt: moduleProgress.completedAt,
    })
    .from(moduleProgress)
    .innerJoin(modules, eq(moduleProgress.moduleId, modules.id))
    .where(
      and(
        eq(moduleProgress.studentId, studentId),
        eq(modules.trainingId, trainingId),
      ),
    );

  return new Map(rows.map((row) => [row.moduleId, row]));
}

export async function upsertModuleProgress(input: {
  studentId: string;
  moduleId: string;
  status: ModuleProgressStatus;
}): Promise<ModuleProgressRecord> {
  const existing = await getModuleProgress(input.studentId, input.moduleId);
  const completedAt =
    input.status === "completed" ? new Date() : existing?.completedAt ?? null;

  if (existing) {
    const [updated] = await db
      .update(moduleProgress)
      .set({
        status: input.status,
        completedAt,
      })
      .where(eq(moduleProgress.id, existing.id))
      .returning({
        id: moduleProgress.id,
        studentId: moduleProgress.studentId,
        moduleId: moduleProgress.moduleId,
        status: moduleProgress.status,
        completedAt: moduleProgress.completedAt,
      });

    return updated!;
  }

  const [created] = await db
    .insert(moduleProgress)
    .values({
      studentId: input.studentId,
      moduleId: input.moduleId,
      status: input.status,
      completedAt,
    })
    .returning({
      id: moduleProgress.id,
      studentId: moduleProgress.studentId,
      moduleId: moduleProgress.moduleId,
      status: moduleProgress.status,
      completedAt: moduleProgress.completedAt,
    });

  return created!;
}

export async function getStudentModuleDetail(
  studentId: string,
  moduleId: string,
): Promise<StudentModuleDetail | null> {
  const module = await findModuleById(moduleId);
  if (!module) {
    return null;
  }

  const contentRows = await db
    .select(contentColumns)
    .from(moduleContents)
    .where(eq(moduleContents.moduleId, moduleId))
    .orderBy(asc(moduleContents.order));

  const progress = await getModuleProgress(studentId, moduleId);

  return {
    ...module,
    contents: contentRows.map(mapContent),
    progress,
  };
}

export async function countModulesByTrainingIds(
  trainingIds: string[],
): Promise<Record<string, number>> {
  const counts = Object.fromEntries(
    trainingIds.map((trainingId) => [trainingId, 0]),
  );

  if (trainingIds.length === 0) {
    return counts;
  }

  const rows = await db
    .select({
      trainingId: modules.trainingId,
      moduleCount: sql<number>`cast(count(${modules.id}) as int)`,
    })
    .from(modules)
    .where(inArray(modules.trainingId, trainingIds))
    .groupBy(modules.trainingId);

  for (const row of rows) {
    counts[row.trainingId] = Number(row.moduleCount ?? 0);
  }

  return counts;
}
