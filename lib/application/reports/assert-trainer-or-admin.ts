import type { SessionUser } from "@/lib/domain/auth/types";
import {
  ReportErrorCode,
  reportFailure,
  type ReportFailure,
} from "@/lib/domain/reports/errors";

export function assertReportTrainerOrAdmin(
  actor: SessionUser | null,
): ReportFailure | null {
  if (!actor) {
    return reportFailure(ReportErrorCode.UNAUTHORIZED);
  }

  if (actor.role !== "admin" && actor.role !== "trainer") {
    return reportFailure(ReportErrorCode.FORBIDDEN);
  }

  return null;
}
