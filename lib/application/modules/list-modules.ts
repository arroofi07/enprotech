import type { SessionUser } from "@/lib/domain/auth/types";
import {
  ModuleErrorCode,
  moduleFailure,
  moduleSuccess,
  type ModuleResult,
} from "@/lib/domain/modules/errors";
import {
  findTrainingByIdForModule,
  listModulesByTraining,
  type ModuleWithContents,
} from "@/lib/infrastructure/db/repositories/module-repository";
import { listModulesSchema } from "@/lib/validations/module-schemas";

import { assertModuleTrainerOrAdmin } from "./assert-access";

export async function listModules(
  actor: SessionUser | null,
  input: unknown,
): Promise<ModuleResult<ModuleWithContents[]>> {
  const forbidden = assertModuleTrainerOrAdmin(actor);
  if (forbidden) {
    return forbidden;
  }

  const parsed = listModulesSchema.safeParse(input);
  if (!parsed.success) {
    return moduleFailure(ModuleErrorCode.VALIDATION_ERROR);
  }

  const training = await findTrainingByIdForModule(parsed.data.trainingId);
  if (!training) {
    return moduleFailure(ModuleErrorCode.TRAINING_NOT_FOUND);
  }

  const items = await listModulesByTraining(parsed.data.trainingId);
  return moduleSuccess(items);
}
