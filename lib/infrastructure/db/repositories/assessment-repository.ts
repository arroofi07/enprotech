import { and, asc, count, desc, eq, ilike, inArray, isNull, or, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  assessmentAttempts,
  assessments,
  questions,
  type AssessmentAnswer,
  type QuestionOption,
} from "@/lib/db/schema/assessments";
import { moduleContents, modules } from "@/lib/db/schema/modules";
import { enrollments, trainings } from "@/lib/db/schema/trainings";
import type {
  AssessmentType,
  ModuleAssessmentType,
  TrainingAssessmentType,
} from "@/lib/domain/assessments/types";

export type AssessmentRecord = {
  id: string;
  trainingId: string;
  moduleId: string | null;
  type: AssessmentType;
  title: string;
  passingGrade: number | null;
  timeLimit: number | null;
  maxRetry: number | null;
  questionDisplayCount: number | null;
  shuffleQuestions: boolean;
  createdAt: Date;
};

export type QuestionRecord = {
  id: string;
  assessmentId: string;
  questionText: string;
  options: QuestionOption[];
  order: number;
  createdAt: Date;
};

export type AssessmentAttemptRecord = {
  id: string;
  studentId: string;
  assessmentId: string;
  score: number;
  answers: AssessmentAnswer[];
  questionIds: string[] | null;
  startedAt: Date;
  submittedAt: Date | null;
};

export type TrainingPublicationSummary = {
  moduleCount: number;
  modulesWithContentCount: number;
  quizQuestionCount: number;
  modulesWithQuizQuestionsCount: number;
  latihanQuestionCount: number;
  modulesWithLatihanQuestionsCount: number;
  preTestQuestionCount: number;
  postTestQuestionCount: number;
  isReadyToPublish: boolean;
};

export type ModuleContext = {
  id: string;
  trainingId: string;
  title: string;
  minQuizScore: number;
  minLatihanScore: number;
  videoConferenceScheduledAt: Date | null;
};

const assessmentColumns = {
  id: assessments.id,
  trainingId: assessments.trainingId,
  moduleId: assessments.moduleId,
  type: assessments.type,
  title: assessments.title,
  passingGrade: assessments.passingGrade,
  timeLimit: assessments.timeLimit,
  maxRetry: assessments.maxRetry,
  questionDisplayCount: assessments.questionDisplayCount,
  shuffleQuestions: assessments.shuffleQuestions,
  createdAt: assessments.createdAt,
};

const questionColumns = {
  id: questions.id,
  assessmentId: questions.assessmentId,
  questionText: questions.questionText,
  options: questions.options,
  order: questions.order,
  createdAt: questions.createdAt,
};

const attemptColumns = {
  id: assessmentAttempts.id,
  studentId: assessmentAttempts.studentId,
  assessmentId: assessmentAttempts.assessmentId,
  score: assessmentAttempts.score,
  answers: assessmentAttempts.answers,
  questionIds: assessmentAttempts.questionIds,
  startedAt: assessmentAttempts.startedAt,
  submittedAt: assessmentAttempts.submittedAt,
};

function mapAssessment(
  row: typeof assessments.$inferSelect,
): AssessmentRecord {
  return {
    id: row.id,
    trainingId: row.trainingId,
    moduleId: row.moduleId,
    type: row.type,
    title: row.title,
    passingGrade: row.passingGrade,
    timeLimit: row.timeLimit,
    maxRetry: row.maxRetry,
    questionDisplayCount: row.questionDisplayCount,
    shuffleQuestions: row.shuffleQuestions,
    createdAt: row.createdAt,
  };
}

function mapQuestion(row: typeof questions.$inferSelect): QuestionRecord {
  return {
    id: row.id,
    assessmentId: row.assessmentId,
    questionText: row.questionText,
    options: row.options,
    order: row.order,
    createdAt: row.createdAt,
  };
}

function mapAttempt(
  row: typeof assessmentAttempts.$inferSelect,
): AssessmentAttemptRecord {
  return {
    id: row.id,
    studentId: row.studentId,
    assessmentId: row.assessmentId,
    score: row.score,
    answers: row.answers,
    questionIds: row.questionIds ?? null,
    startedAt: row.startedAt,
    submittedAt: row.submittedAt,
  };
}

export async function findModuleContextById(
  moduleId: string,
): Promise<ModuleContext | null> {
  const [row] = await db
    .select({
      id: modules.id,
      trainingId: modules.trainingId,
      title: modules.title,
      minQuizScore: modules.minQuizScore,
      minLatihanScore: modules.minLatihanScore,
      videoConferenceScheduledAt: modules.videoConferenceScheduledAt,
    })
    .from(modules)
    .where(eq(modules.id, moduleId))
    .limit(1);

  return row ?? null;
}

export async function getTrainingPassingGrade(
  trainingId: string,
): Promise<number> {
  const [row] = await db
    .select({ passingGrade: trainings.passingGrade })
    .from(trainings)
    .where(eq(trainings.id, trainingId))
    .limit(1);

  return row?.passingGrade ?? 70;
}

export async function findAssessmentByModuleAndType(
  moduleId: string,
  type: ModuleAssessmentType,
): Promise<AssessmentRecord | null> {
  const [row] = await db
    .select(assessmentColumns)
    .from(assessments)
    .where(and(eq(assessments.moduleId, moduleId), eq(assessments.type, type)))
    .limit(1);

  return row ? mapAssessment(row) : null;
}

export async function findAssessmentByTrainingAndType(
  trainingId: string,
  type: TrainingAssessmentType,
): Promise<AssessmentRecord | null> {
  const [row] = await db
    .select(assessmentColumns)
    .from(assessments)
    .where(
      and(
        eq(assessments.trainingId, trainingId),
        isNull(assessments.moduleId),
        eq(assessments.type, type),
      ),
    )
    .limit(1);

  return row ? mapAssessment(row) : null;
}

export async function findAssessmentById(
  assessmentId: string,
): Promise<AssessmentRecord | null> {
  const [row] = await db
    .select(assessmentColumns)
    .from(assessments)
    .where(eq(assessments.id, assessmentId))
    .limit(1);

  return row ? mapAssessment(row) : null;
}

export async function listAssessmentsByTraining(
  trainingId: string,
): Promise<AssessmentRecord[]> {
  const rows = await db
    .select(assessmentColumns)
    .from(assessments)
    .where(eq(assessments.trainingId, trainingId));

  return rows.map(mapAssessment);
}

export async function createAssessment(input: {
  trainingId: string;
  moduleId: string;
  type: ModuleAssessmentType;
  title: string;
}): Promise<AssessmentRecord> {
  const [row] = await db
    .insert(assessments)
    .values({
      trainingId: input.trainingId,
      moduleId: input.moduleId,
      type: input.type,
      title: input.title,
      maxRetry: null,
    })
    .returning(assessmentColumns);

  return mapAssessment(row);
}

export async function createTrainingAssessment(input: {
  trainingId: string;
  type: TrainingAssessmentType;
  title: string;
}): Promise<AssessmentRecord> {
  const [row] = await db
    .insert(assessments)
    .values({
      trainingId: input.trainingId,
      moduleId: null,
      type: input.type,
      title: input.title,
      maxRetry: null,
    })
    .returning(assessmentColumns);

  return mapAssessment(row);
}

export async function listQuestionsByAssessment(
  assessmentId: string,
): Promise<QuestionRecord[]> {
  const rows = await db
    .select(questionColumns)
    .from(questions)
    .where(eq(questions.assessmentId, assessmentId))
    .orderBy(asc(questions.order), asc(questions.createdAt));

  return rows.map(mapQuestion);
}

export async function findQuestionById(
  questionId: string,
): Promise<QuestionRecord | null> {
  const [row] = await db
    .select(questionColumns)
    .from(questions)
    .where(eq(questions.id, questionId))
    .limit(1);

  return row ? mapQuestion(row) : null;
}

export async function getNextQuestionOrder(
  assessmentId: string,
): Promise<number> {
  const [row] = await db
    .select({
      maxOrder: sql<number>`coalesce(max(${questions.order}), -1)`,
    })
    .from(questions)
    .where(eq(questions.assessmentId, assessmentId));

  return (row?.maxOrder ?? -1) + 1;
}

export async function createQuestion(input: {
  assessmentId: string;
  questionText: string;
  options: QuestionOption[];
  order: number;
}): Promise<QuestionRecord> {
  const [row] = await db
    .insert(questions)
    .values({
      assessmentId: input.assessmentId,
      questionText: input.questionText,
      options: input.options,
      order: input.order,
    })
    .returning(questionColumns);

  return mapQuestion(row);
}

export async function bulkCreateQuestions(
  items: Array<{
    assessmentId: string;
    questionText: string;
    options: QuestionOption[];
    order: number;
  }>,
): Promise<QuestionRecord[]> {
  if (items.length === 0) {
    return [];
  }

  const rows = await db
    .insert(questions)
    .values(items)
    .returning(questionColumns);

  return rows.map(mapQuestion);
}

export async function updateQuestion(
  questionId: string,
  input: {
    questionText: string;
    options: QuestionOption[];
  },
): Promise<QuestionRecord | null> {
  const [row] = await db
    .update(questions)
    .set({
      questionText: input.questionText,
      options: input.options,
    })
    .where(eq(questions.id, questionId))
    .returning(questionColumns);

  return row ? mapQuestion(row) : null;
}

export async function deleteQuestion(questionId: string): Promise<boolean> {
  const deleted = await db
    .delete(questions)
    .where(eq(questions.id, questionId))
    .returning({ id: questions.id });

  return deleted.length > 0;
}

export async function findInProgressAttempt(
  studentId: string,
  assessmentId: string,
): Promise<AssessmentAttemptRecord | null> {
  const [row] = await db
    .select(attemptColumns)
    .from(assessmentAttempts)
    .where(
      and(
        eq(assessmentAttempts.studentId, studentId),
        eq(assessmentAttempts.assessmentId, assessmentId),
        isNull(assessmentAttempts.submittedAt),
      ),
    )
    .orderBy(desc(assessmentAttempts.startedAt))
    .limit(1);

  return row ? mapAttempt(row) : null;
}

export async function updateAssessmentSettings(
  assessmentId: string,
  input: {
    questionDisplayCount?: number | null;
    shuffleQuestions?: boolean;
    timeLimit?: number | null;
  },
): Promise<AssessmentRecord | null> {
  const [row] = await db
    .update(assessments)
    .set({
      ...(input.questionDisplayCount !== undefined
        ? { questionDisplayCount: input.questionDisplayCount }
        : {}),
      ...(input.shuffleQuestions !== undefined
        ? { shuffleQuestions: input.shuffleQuestions }
        : {}),
      ...(input.timeLimit !== undefined ? { timeLimit: input.timeLimit } : {}),
    })
    .where(eq(assessments.id, assessmentId))
    .returning(assessmentColumns);

  return row ? mapAssessment(row) : null;
}

export async function createAttempt(input: {
  studentId: string;
  assessmentId: string;
  questionIds?: string[];
}): Promise<AssessmentAttemptRecord> {
  const [row] = await db
    .insert(assessmentAttempts)
    .values({
      studentId: input.studentId,
      assessmentId: input.assessmentId,
      score: 0,
      answers: [],
      questionIds: input.questionIds ?? null,
    })
    .returning(attemptColumns);

  return mapAttempt(row);
}

export async function createSubmittedAttempt(input: {
  studentId: string;
  assessmentId: string;
  score: number;
}): Promise<AssessmentAttemptRecord> {
  const [row] = await db
    .insert(assessmentAttempts)
    .values({
      studentId: input.studentId,
      assessmentId: input.assessmentId,
      score: input.score,
      answers: [],
      submittedAt: new Date(),
    })
    .returning(attemptColumns);

  return mapAttempt(row);
}

export async function findAttemptById(
  attemptId: string,
): Promise<AssessmentAttemptRecord | null> {
  const [row] = await db
    .select(attemptColumns)
    .from(assessmentAttempts)
    .where(eq(assessmentAttempts.id, attemptId))
    .limit(1);

  return row ? mapAttempt(row) : null;
}

export async function updateAttemptAnswers(
  attemptId: string,
  answers: AssessmentAnswer[],
): Promise<AssessmentAttemptRecord | null> {
  const [row] = await db
    .update(assessmentAttempts)
    .set({ answers })
    .where(
      and(
        eq(assessmentAttempts.id, attemptId),
        isNull(assessmentAttempts.submittedAt),
      ),
    )
    .returning(attemptColumns);

  return row ? mapAttempt(row) : null;
}

export async function submitAttempt(
  attemptId: string,
  input: {
    score: number;
    answers: AssessmentAnswer[];
  },
): Promise<AssessmentAttemptRecord | null> {
  const [row] = await db
    .update(assessmentAttempts)
    .set({
      score: input.score,
      answers: input.answers,
      submittedAt: new Date(),
    })
    .where(
      and(
        eq(assessmentAttempts.id, attemptId),
        isNull(assessmentAttempts.submittedAt),
      ),
    )
    .returning(attemptColumns);

  return row ? mapAttempt(row) : null;
}

export async function listSubmittedAttempts(
  studentId: string,
  assessmentId: string,
): Promise<AssessmentAttemptRecord[]> {
  const rows = await db
    .select(attemptColumns)
    .from(assessmentAttempts)
    .where(
      and(
        eq(assessmentAttempts.studentId, studentId),
        eq(assessmentAttempts.assessmentId, assessmentId),
        sql`${assessmentAttempts.submittedAt} is not null`,
      ),
    )
    .orderBy(desc(assessmentAttempts.submittedAt));

  return rows.map(mapAttempt);
}

export async function getBestSubmittedScore(
  studentId: string,
  assessmentId: string,
): Promise<number> {
  const [row] = await db
    .select({
      bestScore: sql<number>`coalesce(max(${assessmentAttempts.score}), 0)`,
    })
    .from(assessmentAttempts)
    .where(
      and(
        eq(assessmentAttempts.studentId, studentId),
        eq(assessmentAttempts.assessmentId, assessmentId),
        sql`${assessmentAttempts.submittedAt} is not null`,
      ),
    );

  return row?.bestScore ?? 0;
}

export async function countSubmittedAttempts(
  studentId: string,
  assessmentId: string,
): Promise<number> {
  const [row] = await db
    .select({ value: count() })
    .from(assessmentAttempts)
    .where(
      and(
        eq(assessmentAttempts.studentId, studentId),
        eq(assessmentAttempts.assessmentId, assessmentId),
        sql`${assessmentAttempts.submittedAt} is not null`,
      ),
    );

  return row?.value ?? 0;
}

export async function countQuestionsByAssessment(
  assessmentId: string,
): Promise<number> {
  const [row] = await db
    .select({ value: count() })
    .from(questions)
    .where(eq(questions.assessmentId, assessmentId));

  return row?.value ?? 0;
}

export type ModuleAssessmentHubRow = {
  moduleId: string;
  moduleTitle: string;
  moduleOrder: number;
  trainingId: string;
  trainingTitle: string;
  questionCount: number;
};

function buildModuleAssessmentHubSearch(
  search?: string,
  trainingId?: string,
) {
  const conditions = [];

  if (trainingId) {
    conditions.push(eq(trainings.id, trainingId));
  }

  if (search?.trim()) {
    const term = `%${search.trim()}%`;
    conditions.push(
      trainingId
        ? ilike(modules.title, term)
        : or(ilike(trainings.title, term), ilike(modules.title, term)),
    );
  }

  if (conditions.length === 0) {
    return undefined;
  }

  return and(...conditions);
}

export async function listModuleAssessmentHub(query: {
  type: ModuleAssessmentType;
  trainingId?: string;
  search?: string;
  page: number;
  pageSize: number;
}): Promise<{ items: ModuleAssessmentHubRow[]; total: number }> {
  const where = buildModuleAssessmentHubSearch(query.search, query.trainingId);
  const offset = (query.page - 1) * query.pageSize;

  const [rows, totalResult] = await Promise.all([
    db
      .select({
        moduleId: modules.id,
        moduleTitle: modules.title,
        moduleOrder: modules.order,
        trainingId: trainings.id,
        trainingTitle: trainings.title,
        questionCount: sql<number>`cast(count(${questions.id}) as int)`,
      })
      .from(modules)
      .innerJoin(trainings, eq(modules.trainingId, trainings.id))
      .leftJoin(
        assessments,
        and(
          eq(assessments.moduleId, modules.id),
          eq(assessments.type, query.type),
        ),
      )
      .leftJoin(questions, eq(questions.assessmentId, assessments.id))
      .where(where)
      .groupBy(
        modules.id,
        modules.title,
        modules.order,
        trainings.id,
        trainings.title,
      )
      .orderBy(asc(trainings.title), asc(modules.order))
      .limit(query.pageSize)
      .offset(offset),
    db
      .select({ value: count() })
      .from(modules)
      .innerJoin(trainings, eq(modules.trainingId, trainings.id))
      .where(where),
  ]);

  return {
    items: rows.map((row) => ({
      moduleId: row.moduleId,
      moduleTitle: row.moduleTitle,
      moduleOrder: row.moduleOrder,
      trainingId: row.trainingId,
      trainingTitle: row.trainingTitle,
      questionCount: Number(row.questionCount ?? 0),
    })),
    total: totalResult[0]?.value ?? 0,
  };
}

export type StudentModuleAssessmentHubBaseRow = {
  moduleId: string;
  moduleTitle: string;
  moduleOrder: number;
  trainingId: string;
  trainingTitle: string;
  videoConferenceScheduledAt: Date | null;
  questionCount: number;
};

function buildStudentModuleAssessmentHubSearch(
  studentId: string,
  search?: string,
) {
  const conditions = [eq(enrollments.studentId, studentId)];

  if (search?.trim()) {
    const term = `%${search.trim()}%`;
    conditions.push(
      or(ilike(trainings.title, term), ilike(modules.title, term))!,
    );
  }

  return and(...conditions);
}

export async function listStudentModuleAssessmentHub(query: {
  studentId: string;
  type: ModuleAssessmentType;
  search?: string;
  page: number;
  pageSize: number;
}): Promise<{ items: StudentModuleAssessmentHubBaseRow[]; total: number }> {
  const where = buildStudentModuleAssessmentHubSearch(
    query.studentId,
    query.search,
  );
  const offset = (query.page - 1) * query.pageSize;

  const [rows, totalResult] = await Promise.all([
    db
      .select({
        moduleId: modules.id,
        moduleTitle: modules.title,
        moduleOrder: modules.order,
        trainingId: trainings.id,
        trainingTitle: trainings.title,
        videoConferenceScheduledAt: modules.videoConferenceScheduledAt,
        questionCount: sql<number>`cast(count(${questions.id}) as int)`,
      })
      .from(enrollments)
      .innerJoin(trainings, eq(enrollments.trainingId, trainings.id))
      .innerJoin(modules, eq(modules.trainingId, trainings.id))
      .leftJoin(
        assessments,
        and(
          eq(assessments.moduleId, modules.id),
          eq(assessments.type, query.type),
        ),
      )
      .leftJoin(questions, eq(questions.assessmentId, assessments.id))
      .where(where)
      .groupBy(
        modules.id,
        modules.title,
        modules.order,
        modules.videoConferenceScheduledAt,
        trainings.id,
        trainings.title,
      )
      .orderBy(asc(trainings.title), asc(modules.order))
      .limit(query.pageSize)
      .offset(offset),
    db
      .select({ value: count() })
      .from(enrollments)
      .innerJoin(trainings, eq(enrollments.trainingId, trainings.id))
      .innerJoin(modules, eq(modules.trainingId, trainings.id))
      .where(where),
  ]);

  return {
    items: rows.map((row) => ({
      moduleId: row.moduleId,
      moduleTitle: row.moduleTitle,
      moduleOrder: row.moduleOrder,
      trainingId: row.trainingId,
      trainingTitle: row.trainingTitle,
      videoConferenceScheduledAt: row.videoConferenceScheduledAt,
      questionCount: Number(row.questionCount ?? 0),
    })),
    total: totalResult[0]?.value ?? 0,
  };
}

export async function countQuestionsByTrainingIds(
  trainingIds: string[],
  type: TrainingAssessmentType,
): Promise<Record<string, number>> {
  const counts = Object.fromEntries(
    trainingIds.map((trainingId) => [trainingId, 0]),
  );

  if (trainingIds.length === 0) {
    return counts;
  }

  const rows = await db
    .select({
      trainingId: assessments.trainingId,
      questionCount: sql<number>`cast(count(${questions.id}) as int)`,
    })
    .from(assessments)
    .leftJoin(questions, eq(questions.assessmentId, assessments.id))
    .where(
      and(
        isNull(assessments.moduleId),
        eq(assessments.type, type),
        inArray(assessments.trainingId, trainingIds),
      ),
    )
    .groupBy(assessments.trainingId);

  for (const row of rows) {
    counts[row.trainingId] = Number(row.questionCount ?? 0);
  }

  return counts;
}

export async function countModuleQuestionsByTrainingIds(
  trainingIds: string[],
  type: ModuleAssessmentType,
): Promise<Record<string, number>> {
  const counts = Object.fromEntries(
    trainingIds.map((trainingId) => [trainingId, 0]),
  );

  if (trainingIds.length === 0) {
    return counts;
  }

  const rows = await db
    .select({
      trainingId: trainings.id,
      questionCount: sql<number>`cast(count(${questions.id}) as int)`,
    })
    .from(modules)
    .innerJoin(trainings, eq(modules.trainingId, trainings.id))
    .leftJoin(
      assessments,
      and(
        eq(assessments.moduleId, modules.id),
        eq(assessments.type, type),
      ),
    )
    .leftJoin(questions, eq(questions.assessmentId, assessments.id))
    .where(inArray(trainings.id, trainingIds))
    .groupBy(trainings.id);

  for (const row of rows) {
    counts[row.trainingId] = Number(row.questionCount ?? 0);
  }

  return counts;
}

export async function getTrainingPublicationSummaries(
  trainingIds: string[],
): Promise<Record<string, TrainingPublicationSummary>> {
  const summaries: Record<string, TrainingPublicationSummary> =
    Object.fromEntries(
      trainingIds.map((trainingId) => [
        trainingId,
        {
          moduleCount: 0,
          modulesWithContentCount: 0,
          quizQuestionCount: 0,
          modulesWithQuizQuestionsCount: 0,
          latihanQuestionCount: 0,
          modulesWithLatihanQuestionsCount: 0,
          preTestQuestionCount: 0,
          postTestQuestionCount: 0,
          isReadyToPublish: false,
        },
      ]),
    );

  if (trainingIds.length === 0) {
    return summaries;
  }

  const [moduleRows, assessmentRows] = await Promise.all([
    db
      .select({
        trainingId: modules.trainingId,
        moduleId: modules.id,
        contentCount: sql<number>`cast(count(${moduleContents.id}) as int)`,
      })
      .from(modules)
      .leftJoin(moduleContents, eq(moduleContents.moduleId, modules.id))
      .where(inArray(modules.trainingId, trainingIds))
      .groupBy(modules.trainingId, modules.id),
    db
      .select({
        trainingId: assessments.trainingId,
        moduleId: assessments.moduleId,
        type: assessments.type,
        questionCount: sql<number>`cast(count(${questions.id}) as int)`,
      })
      .from(assessments)
      .leftJoin(questions, eq(questions.assessmentId, assessments.id))
      .where(inArray(assessments.trainingId, trainingIds))
      .groupBy(
        assessments.trainingId,
        assessments.moduleId,
        assessments.type,
      ),
  ]);

  for (const row of moduleRows) {
    const summary = summaries[row.trainingId];
    if (!summary) {
      continue;
    }

    summary.moduleCount += 1;
    if (Number(row.contentCount) > 0) {
      summary.modulesWithContentCount += 1;
    }
  }

  for (const row of assessmentRows) {
    const summary = summaries[row.trainingId];
    if (!summary) {
      continue;
    }

    const questionCount = Number(row.questionCount);
    switch (row.type) {
      case "pre_test":
        summary.preTestQuestionCount += questionCount;
        break;
      case "post_test":
        summary.postTestQuestionCount += questionCount;
        break;
      case "quiz":
        summary.quizQuestionCount += questionCount;
        if (row.moduleId && questionCount > 0) {
          summary.modulesWithQuizQuestionsCount += 1;
        }
        break;
      case "latihan":
        summary.latihanQuestionCount += questionCount;
        if (row.moduleId && questionCount > 0) {
          summary.modulesWithLatihanQuestionsCount += 1;
        }
        break;
      default: {
        const _exhaustive: never = row.type;
        throw new Error(`Unsupported assessment type: ${_exhaustive}`);
      }
    }
  }

  for (const summary of Object.values(summaries)) {
    summary.isReadyToPublish =
      summary.moduleCount > 0 &&
      summary.modulesWithContentCount === summary.moduleCount &&
      summary.modulesWithQuizQuestionsCount === summary.moduleCount &&
      summary.modulesWithLatihanQuestionsCount === summary.moduleCount &&
      summary.preTestQuestionCount > 0 &&
      summary.postTestQuestionCount > 0;
  }

  return summaries;
}
