import { and, avg, count, desc, eq, ilike, or, type SQL } from "drizzle-orm";

import { db } from "@/lib/db";
import { trainingFeedback } from "@/lib/db/schema/training-feedback";
import { trainings } from "@/lib/db/schema/trainings";
import { users } from "@/lib/db/schema/users";
import type { TrainingFeedback } from "@/lib/db/schema/training-feedback";

export type UpsertFeedbackInput = {
  studentId: string;
  trainingId: string;
  trainingRating: number;
  trainerRating: number;
  comment?: string;
};

export type FeedbackListItem = {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  trainingId: string;
  trainingTitle: string;
  trainingRating: number;
  trainerRating: number;
  comment: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ListFeedbackQuery = {
  search?: string;
  trainingId?: string;
  page: number;
  pageSize: number;
};

export type FeedbackStats = {
  avgTrainingRating: number | null;
  avgTrainerRating: number | null;
  total: number;
};

const feedbackListColumns = {
  id: trainingFeedback.id,
  studentId: trainingFeedback.studentId,
  studentName: users.name,
  studentEmail: users.email,
  trainingId: trainingFeedback.trainingId,
  trainingTitle: trainings.title,
  trainingRating: trainingFeedback.trainingRating,
  trainerRating: trainingFeedback.trainerRating,
  comment: trainingFeedback.comment,
  createdAt: trainingFeedback.createdAt,
  updatedAt: trainingFeedback.updatedAt,
};

function buildListFilters(query: ListFeedbackQuery): SQL | undefined {
  const conditions: SQL[] = [];

  if (query.trainingId) {
    conditions.push(eq(trainingFeedback.trainingId, query.trainingId));
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

export async function upsertFeedback(
  input: UpsertFeedbackInput,
): Promise<TrainingFeedback> {
  const [feedback] = await db
    .insert(trainingFeedback)
    .values({
      studentId: input.studentId,
      trainingId: input.trainingId,
      trainingRating: input.trainingRating,
      trainerRating: input.trainerRating,
      comment: input.comment ?? null,
    })
    .onConflictDoUpdate({
      target: [trainingFeedback.studentId, trainingFeedback.trainingId],
      set: {
        trainingRating: input.trainingRating,
        trainerRating: input.trainerRating,
        comment: input.comment ?? null,
        updatedAt: new Date(),
      },
    })
    .returning();

  return feedback;
}

export async function findFeedbackByStudentAndTraining(
  studentId: string,
  trainingId: string,
): Promise<TrainingFeedback | null> {
  const [feedback] = await db
    .select()
    .from(trainingFeedback)
    .where(
      and(
        eq(trainingFeedback.studentId, studentId),
        eq(trainingFeedback.trainingId, trainingId),
      ),
    )
    .limit(1);

  return feedback ?? null;
}

export async function listFeedbackByStudent(
  studentId: string,
): Promise<TrainingFeedback[]> {
  return db
    .select()
    .from(trainingFeedback)
    .where(eq(trainingFeedback.studentId, studentId))
    .orderBy(desc(trainingFeedback.updatedAt));
}

export async function listFeedback(
  query: ListFeedbackQuery,
): Promise<{ items: FeedbackListItem[]; total: number }> {
  const where = buildListFilters(query);
  const offset = (query.page - 1) * query.pageSize;

  const [items, totalResult] = await Promise.all([
    db
      .select(feedbackListColumns)
      .from(trainingFeedback)
      .innerJoin(users, eq(trainingFeedback.studentId, users.id))
      .innerJoin(trainings, eq(trainingFeedback.trainingId, trainings.id))
      .where(where)
      .orderBy(desc(trainingFeedback.updatedAt))
      .limit(query.pageSize)
      .offset(offset),
    db
      .select({ value: count() })
      .from(trainingFeedback)
      .innerJoin(users, eq(trainingFeedback.studentId, users.id))
      .innerJoin(trainings, eq(trainingFeedback.trainingId, trainings.id))
      .where(where),
  ]);

  return {
    items,
    total: Number(totalResult[0]?.value ?? 0),
  };
}

export async function getFeedbackStats(
  trainingId?: string,
): Promise<FeedbackStats> {
  const where = trainingId
    ? eq(trainingFeedback.trainingId, trainingId)
    : undefined;

  const [row] = await db
    .select({
      avgTrainingRating: avg(trainingFeedback.trainingRating),
      avgTrainerRating: avg(trainingFeedback.trainerRating),
      total: count(),
    })
    .from(trainingFeedback)
    .where(where);

  return {
    avgTrainingRating: row?.avgTrainingRating
      ? Number(row.avgTrainingRating)
      : null,
    avgTrainerRating: row?.avgTrainerRating
      ? Number(row.avgTrainerRating)
      : null,
    total: Number(row?.total ?? 0),
  };
}
