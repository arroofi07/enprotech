import { z } from "zod";

import type { SessionUser } from "@/lib/domain/auth/types";
import {
  AssessmentErrorCode,
  assessmentFailure,
  assessmentSuccess,
  type AssessmentResult,
} from "@/lib/domain/assessments/errors";
import { getAssessmentTypeLabel } from "@/lib/domain/assessments/labels";
import type {
  AssessmentType,
  ModuleAssessmentType,
  TrainingAssessmentType,
} from "@/lib/domain/assessments/types";
import {
  countQuestionsByAssessment,
  createTrainingAssessment,
  findAssessmentByTrainingAndType,
  type AssessmentRecord,
} from "@/lib/infrastructure/db/repositories/assessment-repository";
import { listModulesByTraining } from "@/lib/infrastructure/db/repositories/module-repository";
import { findTrainingById } from "@/lib/infrastructure/db/repositories/training-repository";
import { getAssessmentTitle } from "@/lib/validations/assessment-schemas";

import { assertAssessmentTrainerOrAdmin } from "./assert-access";
import { getOrCreateAssessmentRecord } from "./get-or-create-assessment";

export type TrainingTimeLimitRow = {
  assessmentId: string;
  type: AssessmentType;
  label: string;
  moduleId: string | null;
  moduleTitle: string | null;
  questionCount: number;
  timeLimit: number | null;
};

export type TrainingTimeLimitsData = {
  trainingId: string;
  trainingTitle: string;
  rows: TrainingTimeLimitRow[];
};

const inputSchema = z.object({
  trainingId: z.uuid("ID training tidak valid."),
});

async function getOrCreateTrainingLevelAssessment(
  trainingId: string,
  type: TrainingAssessmentType,
  trainingTitle: string,
): Promise<AssessmentRecord> {
  const existing = await findAssessmentByTrainingAndType(trainingId, type);
  if (existing) {
    return existing;
  }

  return createTrainingAssessment({
    trainingId,
    type,
    title: getAssessmentTitle(trainingTitle, type),
  });
}

async function buildTrainingLevelRow(
  trainingId: string,
  type: TrainingAssessmentType,
  trainingTitle: string,
): Promise<TrainingTimeLimitRow> {
  const assessment = await getOrCreateTrainingLevelAssessment(
    trainingId,
    type,
    trainingTitle,
  );
  const questionCount = await countQuestionsByAssessment(assessment.id);

  return {
    assessmentId: assessment.id,
    type,
    label: getAssessmentTypeLabel(type),
    moduleId: null,
    moduleTitle: null,
    questionCount,
    timeLimit: assessment.timeLimit,
  };
}

async function buildModuleLevelRow(
  moduleId: string,
  moduleTitle: string,
  type: ModuleAssessmentType,
): Promise<TrainingTimeLimitRow | null> {
  const result = await getOrCreateAssessmentRecord(moduleId, type);
  if (!result.success) {
    return null;
  }

  const questionCount = await countQuestionsByAssessment(result.data.id);

  return {
    assessmentId: result.data.id,
    type,
    label: `${getAssessmentTypeLabel(type)} — ${moduleTitle}`,
    moduleId,
    moduleTitle,
    questionCount,
    timeLimit: result.data.timeLimit,
  };
}

export async function listTrainingTimeLimits(
  actor: SessionUser | null,
  input: unknown,
): Promise<AssessmentResult<TrainingTimeLimitsData>> {
  const forbidden = assertAssessmentTrainerOrAdmin(actor);
  if (forbidden) {
    return forbidden;
  }

  const parsed = inputSchema.safeParse(input);
  if (!parsed.success) {
    return assessmentFailure(AssessmentErrorCode.VALIDATION_ERROR);
  }

  const { trainingId } = parsed.data;
  const training = await findTrainingById(trainingId);
  if (!training) {
    return assessmentFailure(AssessmentErrorCode.TRAINING_NOT_FOUND);
  }

  const modules = await listModulesByTraining(trainingId);

  const [preTest, postTest, moduleRows] = await Promise.all([
    buildTrainingLevelRow(trainingId, "pre_test", training.title),
    buildTrainingLevelRow(trainingId, "post_test", training.title),
    Promise.all(
      modules.flatMap((module) => [
        buildModuleLevelRow(module.id, module.title, "quiz"),
        buildModuleLevelRow(module.id, module.title, "latihan"),
      ]),
    ),
  ]);

  const rows: TrainingTimeLimitRow[] = [
    preTest,
    postTest,
    ...moduleRows.filter((row): row is TrainingTimeLimitRow => row !== null),
  ];

  return assessmentSuccess({
    trainingId,
    trainingTitle: training.title,
    rows,
  });
}
