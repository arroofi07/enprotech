import type { SessionUser } from "@/lib/domain/auth/types";
import {
  ModuleErrorCode,
  moduleFailure,
  moduleSuccess,
  type ModuleResult,
} from "@/lib/domain/modules/errors";
import {
  createModule as createModuleInRepo,
  findTrainingByIdForModule,
  type ModuleRecord,
} from "@/lib/infrastructure/db/repositories/module-repository";
import { createModuleSchema } from "@/lib/validations/module-schemas";

import { assertModuleTrainerOrAdmin } from "./assert-access";

export async function createModule(
  actor: SessionUser | null,
  input: unknown,
): Promise<ModuleResult<ModuleRecord>> {
  const forbidden = assertModuleTrainerOrAdmin(actor);
  if (forbidden) {
    return forbidden;
  }

  const parsed = createModuleSchema.safeParse(input);
  if (!parsed.success) {
    return moduleFailure(ModuleErrorCode.VALIDATION_ERROR);
  }

  const training = await findTrainingByIdForModule(parsed.data.trainingId);
  if (!training) {
    return moduleFailure(ModuleErrorCode.TRAINING_NOT_FOUND);
  }

  const module = await createModuleInRepo(parsed.data);
  return moduleSuccess(module);
}
