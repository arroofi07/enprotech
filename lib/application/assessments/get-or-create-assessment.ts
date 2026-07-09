import type { SessionUser } from "@/lib/domain/auth/types";
import {
  AssessmentErrorCode,
  assessmentFailure,
  assessmentSuccess,
  type AssessmentResult,
} from "@/lib/domain/assessments/errors";
import type { ModuleAssessmentType } from "@/lib/domain/assessments/types";
import {
  createAssessment,
  findAssessmentByModuleAndType,
  findModuleContextById,
  listQuestionsByAssessment,
  type AssessmentRecord,
  type QuestionRecord,
} from "@/lib/infrastructure/db/repositories/assessment-repository";
import {
  getAssessmentTitle,
  moduleAssessmentSchema,
} from "@/lib/validations/assessment-schemas";

import { assertAssessmentTrainerOrAdmin } from "./assert-access";

export type AssessmentWithQuestions = AssessmentRecord & {
  questions: QuestionRecord[];
};

async function getOrCreateAssessmentRecord(
  moduleId: string,
  type: ModuleAssessmentType,
): Promise<AssessmentResult<AssessmentRecord>> {
  const module = await findModuleContextById(moduleId);
  if (!module) {
    return assessmentFailure(AssessmentErrorCode.MODULE_NOT_FOUND);
  }

  const existing = await findAssessmentByModuleAndType(moduleId, type);
  if (existing) {
    return assessmentSuccess(existing);
  }

  const assessment = await createAssessment({
    trainingId: module.trainingId,
    moduleId,
    type,
    title: getAssessmentTitle(module.title, type),
  });

  return assessmentSuccess(assessment);
}

export async function getOrCreateAssessment(
  actor: SessionUser | null,
  input: unknown,
): Promise<AssessmentResult<AssessmentWithQuestions>> {
  const forbidden = assertAssessmentTrainerOrAdmin(actor);
  if (forbidden) {
    return forbidden;
  }

  const parsed = moduleAssessmentSchema.safeParse(input);
  if (!parsed.success) {
    return assessmentFailure(AssessmentErrorCode.VALIDATION_ERROR);
  }

  const assessmentResult = await getOrCreateAssessmentRecord(
    parsed.data.moduleId,
    parsed.data.type,
  );
  if (!assessmentResult.success) {
    return assessmentResult;
  }

  const questions = await listQuestionsByAssessment(assessmentResult.data.id);

  return assessmentSuccess({
    ...assessmentResult.data,
    questions,
  });
}

