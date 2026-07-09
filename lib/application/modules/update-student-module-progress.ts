import type { SessionUser } from "@/lib/domain/auth/types";
import {
  ModuleErrorCode,
  moduleFailure,
  moduleSuccess,
  type ModuleResult,
} from "@/lib/domain/modules/errors";
import {
  findModuleById,
  getModuleProgress,
  isStudentEnrolledInTraining,
  upsertModuleProgress,
  type ModuleProgressRecord,
} from "@/lib/infrastructure/db/repositories/module-repository";
import { updateModuleProgressSchema } from "@/lib/validations/module-schemas";

import { notifyModuleCompleted } from "@/lib/application/notifications/notify-module-completed";

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

  const previousProgress = await getModuleProgress(
    actor!.id,
    parsed.data.moduleId,
  );

  const progress = await upsertModuleProgress({
    studentId: actor!.id,
    moduleId: parsed.data.moduleId,
    status: parsed.data.status,
  });

  const becameCompleted =
    parsed.data.status === "completed" &&
    previousProgress?.status !== "completed";

  if (becameCompleted) {
    await notifyModuleCompleted({
      studentId: actor!.id,
      moduleId: module.id,
      moduleName: module.title,
      trainingId: module.trainingId,
    });
  }

  return moduleSuccess(progress);
}
