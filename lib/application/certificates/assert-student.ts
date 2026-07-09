import type { SessionUser } from "@/lib/domain/auth/types";
import {
  CertificateErrorCode,
  certificateFailure,
  type CertificateFailure,
} from "@/lib/domain/certificates/errors";

export function assertCertificateStudent(
  actor: SessionUser | null,
): CertificateFailure | null {
  if (!actor) {
    return certificateFailure(CertificateErrorCode.UNAUTHORIZED);
  }

  if (actor.role !== "student") {
    return certificateFailure(CertificateErrorCode.FORBIDDEN);
  }

  return null;
}
