import type { SessionUser } from "@/lib/domain/auth/types";
import {
  ModuleErrorCode,
  moduleFailure,
  moduleSuccess,
  type ModuleResult,
} from "@/lib/domain/modules/errors";
import {
  findModuleById,
  getStudentModuleDetail,
  isStudentEnrolledInTraining,
  listModuleProgressByTraining,
  listModulesByTraining,
  type ModuleProgressRecord,
  type ModuleWithContents,
  type StudentModuleDetail,
} from "@/lib/infrastructure/db/repositories/module-repository";
import { getModuleSchema, listModulesSchema } from "@/lib/validations/module-schemas";

import { assertModuleStudent } from "./assert-access";
import { assertStudentCanAccessModules } from "@/lib/application/training-flow/get-student-training-flow-state";
import { canStudentAccessModule, getModuleProgressionState } from "./check-module-access";

export type StudentModuleListItem = ModuleWithContents & {
  progress: ModuleProgressRecord | null;
  isLocked: boolean;
};

export async function listStudentModules(
  actor: SessionUser | null,
  input: unknown,
): Promise<ModuleResult<StudentModuleListItem[]>> {
  const forbidden = assertModuleStudent(actor);
  if (forbidden) {
    return forbidden;
  }

  const parsed = listModulesSchema.safeParse(input);
  if (!parsed.success) {
    return moduleFailure(ModuleErrorCode.VALIDATION_ERROR);
  }

  const enrolled = await isStudentEnrolledInTraining(
    actor!.id,
    parsed.data.trainingId,
  );
  if (!enrolled) {
    return moduleFailure(ModuleErrorCode.NOT_ENROLLED);
  }

  const [modules, progressMap, progressionState] = await Promise.all([
    listModulesByTraining(parsed.data.trainingId),
    listModuleProgressByTraining(actor!.id, parsed.data.trainingId),
    getModuleProgressionState(actor!.id, parsed.data.trainingId),
  ]);

  return moduleSuccess(
    modules.map((module) => ({
      ...module,
      progress: progressMap.get(module.id) ?? null,
      isLocked: progressionState.lockedByModuleId[module.id] ?? false,
    })),
  );
}

export async function getStudentModule(
  actor: SessionUser | null,
  input: unknown,
): Promise<ModuleResult<StudentModuleDetail>> {
  const forbidden = assertModuleStudent(actor);
  if (forbidden) {
    return forbidden;
  }

  const parsed = getModuleSchema.safeParse(input);
  if (!parsed.success) {
    return moduleFailure(ModuleErrorCode.VALIDATION_ERROR);
  }

  const module = await findModuleById(parsed.data.moduleId);
  if (!module) {
    return moduleFailure(ModuleErrorCode.MODULE_NOT_FOUND);
  }

  const enrolled = await isStudentEnrolledInTraining(
    actor!.id,
    module.trainingId,
  );
  if (!enrolled) {
    return moduleFailure(ModuleErrorCode.NOT_ENROLLED);
  }

  const canAccess = await assertStudentCanAccessModules(
    actor!,
    module.trainingId,
  );
  if (!canAccess) {
    return moduleFailure(ModuleErrorCode.PRETEST_REQUIRED);
  }

  const moduleUnlocked = await canStudentAccessModule(
    actor!.id,
    module.trainingId,
    parsed.data.moduleId,
  );
  if (!moduleUnlocked) {
    return moduleFailure(ModuleErrorCode.MODULE_LOCKED);
  }

  const detail = await getStudentModuleDetail(actor!.id, parsed.data.moduleId);
  if (!detail) {
    return moduleFailure(ModuleErrorCode.MODULE_NOT_FOUND);
  }

  return moduleSuccess(detail);
}
