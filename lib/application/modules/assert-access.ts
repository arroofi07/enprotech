import type { SessionUser } from "@/lib/domain/auth/types";
import {
  ModuleErrorCode,
  moduleFailure,
  type ModuleFailure,
} from "@/lib/domain/modules/errors";

export function assertModuleTrainerOrAdmin(
  actor: SessionUser | null,
): ModuleFailure | null {
  if (!actor) {
    return moduleFailure(ModuleErrorCode.UNAUTHORIZED);
  }

  if (actor.role !== "admin" && actor.role !== "trainer") {
    return moduleFailure(ModuleErrorCode.FORBIDDEN);
  }

  return null;
}

export function assertModuleStudent(
  actor: SessionUser | null,
): ModuleFailure | null {
  if (!actor) {
    return moduleFailure(ModuleErrorCode.UNAUTHORIZED);
  }

  if (actor.role !== "student") {
    return moduleFailure(ModuleErrorCode.FORBIDDEN);
  }

  return null;
}
