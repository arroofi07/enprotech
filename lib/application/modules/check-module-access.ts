import { notifyModuleCompleted } from "@/lib/application/notifications/notify-module-completed";
import {
  canAccessModuleByOrder,
  isAssessmentRequirementMet,
  isModuleProgressionComplete,
  type ModuleAssessmentRequirement,
} from "@/lib/domain/modules/module-progression";
import type { ModuleAssessmentType } from "@/lib/domain/assessments/types";
import {
  countQuestionsByAssessment,
  countSubmittedAttempts,
  findAssessmentByModuleAndType,
} from "@/lib/infrastructure/db/repositories/assessment-repository";
import {
  findModuleById,
  getModuleProgress,
  listModulesByTraining,
  upsertModuleProgress,
} from "@/lib/infrastructure/db/repositories/module-repository";

export type ModuleProgressionState = {
  progressionCompleteByModuleId: Record<string, boolean>;
  lockedByModuleId: Record<string, boolean>;
};

async function getModuleAssessmentRequirement(
  studentId: string,
  moduleId: string,
  type: ModuleAssessmentType,
): Promise<ModuleAssessmentRequirement> {
  const assessment = await findAssessmentByModuleAndType(moduleId, type);
  if (!assessment) {
    return { submittedCount: 0, questionCount: 0 };
  }

  const [questionCount, submittedCount] = await Promise.all([
    countQuestionsByAssessment(assessment.id),
    countSubmittedAttempts(studentId, assessment.id),
  ]);

  return { submittedCount, questionCount };
}

export async function getModuleProgressionState(
  studentId: string,
  trainingId: string,
): Promise<ModuleProgressionState> {
  const modules = await listModulesByTraining(trainingId);
  const moduleOrderItems = modules.map((module) => ({
    id: module.id,
    order: module.order,
  }));

  const progressionCompleteByModuleId: Record<string, boolean> = {};

  await Promise.all(
    modules.map(async (module) => {
      const [quiz, latihan] = await Promise.all([
        getModuleAssessmentRequirement(studentId, module.id, "quiz"),
        getModuleAssessmentRequirement(studentId, module.id, "latihan"),
      ]);

      progressionCompleteByModuleId[module.id] = isModuleProgressionComplete({
        quiz,
        latihan,
      });
    }),
  );

  const lockedByModuleId: Record<string, boolean> = {};
  for (const module of modules) {
    lockedByModuleId[module.id] = !canAccessModuleByOrder(
      moduleOrderItems,
      module.id,
      progressionCompleteByModuleId,
    );
  }

  return { progressionCompleteByModuleId, lockedByModuleId };
}

/**
 * Whether the module's quiz counts as "done" for the purpose of unlocking the
 * latihan — i.e. the student has submitted at least one quiz attempt (or the
 * quiz has no questions to answer). Mirrors the progression rule so the latihan
 * gate stays consistent with module completion.
 */
export async function isModuleQuizCompleted(
  studentId: string,
  moduleId: string,
): Promise<boolean> {
  const quiz = await getModuleAssessmentRequirement(studentId, moduleId, "quiz");
  return isAssessmentRequirementMet(quiz.submittedCount, quiz.questionCount);
}

export async function canStudentAccessModule(
  studentId: string,
  trainingId: string,
  moduleId: string,
): Promise<boolean> {
  const { lockedByModuleId } = await getModuleProgressionState(
    studentId,
    trainingId,
  );

  return !lockedByModuleId[moduleId];
}

export async function tryAutoCompleteModuleAfterAssessmentSubmit(
  studentId: string,
  moduleId: string,
): Promise<void> {
  const [quiz, latihan, previousProgress, module] = await Promise.all([
    getModuleAssessmentRequirement(studentId, moduleId, "quiz"),
    getModuleAssessmentRequirement(studentId, moduleId, "latihan"),
    getModuleProgress(studentId, moduleId),
    findModuleById(moduleId),
  ]);

  if (!module || !isModuleProgressionComplete({ quiz, latihan })) {
    return;
  }

  if (previousProgress?.status === "completed") {
    return;
  }

  await upsertModuleProgress({
    studentId,
    moduleId,
    status: "completed",
  });

  await notifyModuleCompleted({
    studentId,
    moduleId,
    moduleName: module.title,
    trainingId: module.trainingId,
  });
}
