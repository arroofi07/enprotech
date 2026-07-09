import type { SessionUser } from "@/lib/domain/auth/types";
import {
  ModuleErrorCode,
  moduleFailure,
  moduleSuccess,
  type ModuleResult,
} from "@/lib/domain/modules/errors";
import {
  deleteModule as deleteModuleInRepo,
  findModuleById,
} from "@/lib/infrastructure/db/repositories/module-repository";
import { deleteModuleSchema } from "@/lib/validations/module-schemas";

import { assertModuleTrainerOrAdmin } from "./assert-access";

export async function deleteModule(
  actor: SessionUser | null,
  input: unknown,
): Promise<ModuleResult<{ moduleId: string }>> {
  const forbidden = assertModuleTrainerOrAdmin(actor);
  if (forbidden) {
    return forbidden;
  }

  const parsed = deleteModuleSchema.safeParse(input);
  if (!parsed.success) {
    return moduleFailure(ModuleErrorCode.VALIDATION_ERROR);
  }

  const existing = await findModuleById(parsed.data.moduleId);
  if (!existing) {
    return moduleFailure(ModuleErrorCode.MODULE_NOT_FOUND);
  }

  const deleted = await deleteModuleInRepo(parsed.data.moduleId);
  if (!deleted) {
    return moduleFailure(ModuleErrorCode.MODULE_NOT_FOUND);
  }

  return moduleSuccess({ moduleId: parsed.data.moduleId });
}
