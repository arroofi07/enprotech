import type { SessionUser } from "@/lib/domain/auth/types";
import {
  CertificateErrorCode,
  certificateFailure,
  type CertificateFailure,
} from "@/lib/domain/certificates/errors";
import type { CertificateRow } from "@/lib/infrastructure/db/repositories/certificate-repository";

export function assertCertificateAccess(
  actor: SessionUser | null,
  certificate: CertificateRow,
): CertificateFailure | null {
  if (!actor) {
    return certificateFailure(CertificateErrorCode.UNAUTHORIZED);
  }

  if (actor.role === "student" && certificate.studentId === actor.id) {
    return null;
  }

  if (actor.role === "trainer" || actor.role === "admin") {
    return null;
  }

  return certificateFailure(CertificateErrorCode.FORBIDDEN);
}
