import type { SessionUser } from "@/lib/domain/auth/types";
import {
  ProjectErrorCode,
  projectFailure,
  type ProjectFailure,
} from "@/lib/domain/projects/errors";

export function assertProjectStudent(
  actor: SessionUser | null,
): ProjectFailure | null {
  if (!actor) {
    return projectFailure(ProjectErrorCode.UNAUTHORIZED);
  }

  if (actor.role !== "student") {
    return projectFailure(ProjectErrorCode.FORBIDDEN);
  }

  return null;
}

export function assertProjectTrainerOrAdmin(
  actor: SessionUser | null,
): ProjectFailure | null {
  if (!actor) {
    return projectFailure(ProjectErrorCode.UNAUTHORIZED);
  }

  if (actor.role !== "admin" && actor.role !== "trainer") {
    return projectFailure(ProjectErrorCode.FORBIDDEN);
  }

  return null;
}
