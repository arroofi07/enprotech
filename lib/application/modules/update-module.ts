import type { SessionUser } from "@/lib/domain/auth/types";
import {
  ModuleErrorCode,
  moduleFailure,
  moduleSuccess,
  type ModuleResult,
} from "@/lib/domain/modules/errors";
import {
  findModuleById,
  updateModule as updateModuleInRepo,
  type ModuleRecord,
} from "@/lib/infrastructure/db/repositories/module-repository";
import { updateModuleSchema } from "@/lib/validations/module-schemas";

import { assertModuleTrainerOrAdmin } from "./assert-access";

export async function updateModule(
  actor: SessionUser | null,
  input: unknown,
): Promise<ModuleResult<ModuleRecord>> {
  const forbidden = assertModuleTrainerOrAdmin(actor);
  if (forbidden) {
    return forbidden;
  }

  const parsed = updateModuleSchema.safeParse(input);
  if (!parsed.success) {
    return moduleFailure(ModuleErrorCode.VALIDATION_ERROR);
  }

  const existing = await findModuleById(parsed.data.moduleId);
  if (!existing) {
    return moduleFailure(ModuleErrorCode.MODULE_NOT_FOUND);
  }

  const { moduleId, order, ...updates } = parsed.data;

  const repoUpdates = {
    ...updates,
    ...(order !== undefined ? { order: order - 1 } : {}),
  };

  const updated = await updateModuleInRepo(moduleId, repoUpdates);
  if (!updated) {
    return moduleFailure(ModuleErrorCode.MODULE_NOT_FOUND);
  }

  return moduleSuccess(updated);
}
