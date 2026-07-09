import type { SessionUser } from "@/lib/domain/auth/types";
import {
  ModuleErrorCode,
  moduleFailure,
  moduleSuccess,
  type ModuleResult,
} from "@/lib/domain/modules/errors";
import {
  createModuleContent as createContentInRepo,
  findModuleById,
  type ModuleContentRecord,
} from "@/lib/infrastructure/db/repositories/module-repository";
import { createModuleContentSchema } from "@/lib/validations/module-schemas";

import { assertModuleTrainerOrAdmin } from "./assert-access";

export async function createModuleContent(
  actor: SessionUser | null,
  input: unknown,
): Promise<ModuleResult<ModuleContentRecord>> {
  const forbidden = assertModuleTrainerOrAdmin(actor);
  if (forbidden) {
    return forbidden;
  }

  const parsed = createModuleContentSchema.safeParse(input);
  if (!parsed.success) {
    return moduleFailure(ModuleErrorCode.VALIDATION_ERROR);
  }

  const module = await findModuleById(parsed.data.moduleId);
  if (!module) {
    return moduleFailure(ModuleErrorCode.MODULE_NOT_FOUND);
  }

  const content = await createContentInRepo(parsed.data);
  return moduleSuccess(content);
}
