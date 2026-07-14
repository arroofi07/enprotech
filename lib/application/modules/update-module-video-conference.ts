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
import { updateModuleVideoConferenceSchema } from "@/lib/validations/module-schemas";

import { notifyVideoConferenceScheduled } from "@/lib/application/notifications/notify-video-conference-scheduled";

import { assertModuleTrainerOrAdmin } from "./assert-access";

export async function updateModuleVideoConference(
  actor: SessionUser | null,
  input: unknown,
): Promise<ModuleResult<ModuleRecord>> {
  const forbidden = assertModuleTrainerOrAdmin(actor);
  if (forbidden) {
    return forbidden;
  }

  const parsed = updateModuleVideoConferenceSchema.safeParse(input);
  if (!parsed.success) {
    return moduleFailure(ModuleErrorCode.VALIDATION_ERROR);
  }

  const existing = await findModuleById(parsed.data.moduleId);
  if (!existing || existing.trainingId !== parsed.data.trainingId) {
    return moduleFailure(ModuleErrorCode.MODULE_NOT_FOUND);
  }

  const updated = await updateModuleInRepo(parsed.data.moduleId, {
    videoConferenceLink: parsed.data.videoConferenceLink,
    videoConferenceScheduledAt: parsed.data.videoConferenceScheduledAt,
    videoConferenceEndedAt: null,
  });

  if (!updated) {
    return moduleFailure(ModuleErrorCode.MODULE_NOT_FOUND);
  }

  if (parsed.data.videoConferenceScheduledAt instanceof Date) {
    await notifyVideoConferenceScheduled({
      trainingId: updated.trainingId,
      moduleId: updated.id,
      moduleName: updated.title,
      scheduledAt: parsed.data.videoConferenceScheduledAt,
    });
  }

  return moduleSuccess(updated);
}
