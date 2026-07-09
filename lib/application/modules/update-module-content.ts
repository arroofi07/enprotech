import type { SessionUser } from "@/lib/domain/auth/types";
import {
  ModuleErrorCode,
  moduleFailure,
  moduleSuccess,
  type ModuleResult,
} from "@/lib/domain/modules/errors";
import {
  findModuleContentById,
  updateModuleContent as updateContentInRepo,
  type ModuleContentRecord,
} from "@/lib/infrastructure/db/repositories/module-repository";
import { updateModuleContentSchema } from "@/lib/validations/module-schemas";

import { assertModuleTrainerOrAdmin } from "./assert-access";

export async function updateModuleContent(
  actor: SessionUser | null,
  input: unknown,
): Promise<ModuleResult<ModuleContentRecord>> {
  const forbidden = assertModuleTrainerOrAdmin(actor);
  if (forbidden) {
    return forbidden;
  }

  const parsed = updateModuleContentSchema.safeParse(input);
  if (!parsed.success) {
    return moduleFailure(ModuleErrorCode.VALIDATION_ERROR);
  }

  const existing = await findModuleContentById(parsed.data.contentId);
  if (!existing) {
    return moduleFailure(ModuleErrorCode.CONTENT_NOT_FOUND);
  }

  const { contentId, ...updates } = parsed.data;
  const updated = await updateContentInRepo(contentId, updates);
  if (!updated) {
    return moduleFailure(ModuleErrorCode.CONTENT_NOT_FOUND);
  }

  return moduleSuccess(updated);
}
