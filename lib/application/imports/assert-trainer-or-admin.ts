import type { SessionUser } from "@/lib/domain/auth/types";
import {
  ImportErrorCode,
  importFailure,
  type ImportFailure,
} from "@/lib/domain/imports/errors";

export function assertImportTrainerOrAdmin(
  actor: SessionUser | null,
): ImportFailure | null {
  if (!actor) {
    return importFailure(ImportErrorCode.UNAUTHORIZED);
  }

  if (actor.role !== "admin" && actor.role !== "trainer") {
    return importFailure(ImportErrorCode.FORBIDDEN);
  }

  return null;
}
