import type { SessionUser } from "@/lib/domain/auth/types";
import {
  ModuleErrorCode,
  moduleFailure,
  moduleSuccess,
  type ModuleResult,
} from "@/lib/domain/modules/errors";
import {
  findModuleById,
  listModulesByTraining,
  reorderModules as reorderModulesInRepo,
  type ModuleRecord,
} from "@/lib/infrastructure/db/repositories/module-repository";
import { reorderModulesSchema } from "@/lib/validations/module-schemas";

import { assertModuleTrainerOrAdmin } from "./assert-access";

export async function reorderModules(
  actor: SessionUser | null,
  input: unknown,
): Promise<ModuleResult<ModuleRecord[]>> {
  const forbidden = assertModuleTrainerOrAdmin(actor);
  if (forbidden) {
    return forbidden;
  }

  const parsed = reorderModulesSchema.safeParse(input);
  if (!parsed.success) {
    return moduleFailure(ModuleErrorCode.VALIDATION_ERROR);
  }

  const reordered = await reorderModulesInRepo(
    parsed.data.trainingId,
    parsed.data.moduleIds,
  );

  if (reordered.length === 0) {
    const items = await listModulesByTraining(parsed.data.trainingId);
    if (items.length === 0) {
      return moduleFailure(ModuleErrorCode.TRAINING_NOT_FOUND);
    }
    return moduleFailure(ModuleErrorCode.VALIDATION_ERROR);
  }

  return moduleSuccess(reordered);
}

export async function getModule(
  actor: SessionUser | null,
  input: unknown,
): Promise<ModuleResult<Awaited<ReturnType<typeof findModuleById>>>> {
  const forbidden = assertModuleTrainerOrAdmin(actor);
  if (forbidden) {
    return forbidden;
  }

  const moduleId =
    input && typeof input === "object" && "moduleId" in input
      ? String((input as { moduleId: string }).moduleId)
      : "";

  const module = await findModuleById(moduleId);
  if (!module) {
    return moduleFailure(ModuleErrorCode.MODULE_NOT_FOUND);
  }

  return moduleSuccess(module);
}
