import type { SessionUser } from "@/lib/domain/auth/types";
import {
  ModuleErrorCode,
  moduleFailure,
  moduleSuccess,
  type ModuleResult,
} from "@/lib/domain/modules/errors";
import {
  findModuleById,
  isStudentEnrolledInTraining,
  upsertModuleProgress,
  type ModuleProgressRecord,
} from "@/lib/infrastructure/db/repositories/module-repository";
import { updateModuleProgressSchema } from "@/lib/validations/module-schemas";

import { assertModuleStudent } from "./assert-access";

export async function updateStudentModuleProgress(
  actor: SessionUser | null,
  input: unknown,
): Promise<ModuleResult<ModuleProgressRecord>> {
  const forbidden = assertModuleStudent(actor);
  if (forbidden) {
    return forbidden;
  }

  const parsed = updateModuleProgressSchema.safeParse(input);
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

  const progress = await upsertModuleProgress({
    studentId: actor!.id,
    moduleId: parsed.data.moduleId,
    status: parsed.data.status,
  });

  return moduleSuccess(progress);
}
