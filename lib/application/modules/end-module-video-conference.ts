import type { SessionUser } from "@/lib/domain/auth/types";
import {
  ModuleErrorCode,
  moduleFailure,
  moduleSuccess,
  type ModuleResult,
} from "@/lib/domain/modules/errors";
import { getVideoConferenceState } from "@/lib/domain/modules/video-conference-access";
import {
  findModuleById,
  updateModule as updateModuleInRepo,
  type ModuleRecord,
} from "@/lib/infrastructure/db/repositories/module-repository";
import { endModuleVideoConferenceSchema } from "@/lib/validations/module-schemas";

import { assertModuleTrainerOrAdmin } from "./assert-access";

export async function endModuleVideoConference(
  actor: SessionUser | null,
  input: unknown,
): Promise<ModuleResult<ModuleRecord>> {
  const forbidden = assertModuleTrainerOrAdmin(actor);
  if (forbidden) {
    return forbidden;
  }

  const parsed = endModuleVideoConferenceSchema.safeParse(input);
  if (!parsed.success) {
    return moduleFailure(ModuleErrorCode.VALIDATION_ERROR);
  }

  const existing = await findModuleById(parsed.data.moduleId);
  if (!existing || existing.trainingId !== parsed.data.trainingId) {
    return moduleFailure(ModuleErrorCode.MODULE_NOT_FOUND);
  }

  const state = getVideoConferenceState(
    existing.videoConferenceScheduledAt,
    existing.videoConferenceEndedAt,
    new Date(),
  );

  if (state !== "live") {
    return {
      success: false,
      error: ModuleErrorCode.VALIDATION_ERROR,
      message: "Video conference hanya bisa diakhiri saat sedang berlangsung.",
    };
  }

  const updated = await updateModuleInRepo(parsed.data.moduleId, {
    videoConferenceEndedAt: new Date(),
  });

  if (!updated) {
    return moduleFailure(ModuleErrorCode.MODULE_NOT_FOUND);
  }

  return moduleSuccess(updated);
}
