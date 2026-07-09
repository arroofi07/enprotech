import type { SessionUser } from "@/lib/domain/auth/types";
import {
  ModuleErrorCode,
  moduleFailure,
  moduleSuccess,
  type ModuleResult,
} from "@/lib/domain/modules/errors";
import {
  deleteModuleContent as deleteContentInRepo,
  findModuleContentById,
} from "@/lib/infrastructure/db/repositories/module-repository";
import { deleteModuleContentSchema } from "@/lib/validations/module-schemas";

import { assertModuleTrainerOrAdmin } from "./assert-access";

export async function deleteModuleContent(
  actor: SessionUser | null,
  input: unknown,
): Promise<ModuleResult<{ contentId: string }>> {
  const forbidden = assertModuleTrainerOrAdmin(actor);
  if (forbidden) {
    return forbidden;
  }

  const parsed = deleteModuleContentSchema.safeParse(input);
  if (!parsed.success) {
    return moduleFailure(ModuleErrorCode.VALIDATION_ERROR);
  }

  const existing = await findModuleContentById(parsed.data.contentId);
  if (!existing) {
    return moduleFailure(ModuleErrorCode.CONTENT_NOT_FOUND);
  }

  const deleted = await deleteContentInRepo(parsed.data.contentId);
  if (!deleted) {
    return moduleFailure(ModuleErrorCode.CONTENT_NOT_FOUND);
  }

  return moduleSuccess({ contentId: parsed.data.contentId });
}
