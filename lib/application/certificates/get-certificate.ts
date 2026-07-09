import type { SessionUser } from "@/lib/domain/auth/types";
import {
  CertificateErrorCode,
  certificateFailure,
  certificateSuccess,
  type CertificateResult,
} from "@/lib/domain/certificates/errors";
import type { CertificateRecord } from "@/lib/domain/certificates/types";
import { findCertificateById } from "@/lib/infrastructure/db/repositories/certificate-repository";
import { certificateIdSchema } from "@/lib/validations/certificate-schemas";

import { assertCertificateStudent } from "./assert-student";
import { toCertificateRecord } from "./certificate-view";

export async function getCertificate(
  actor: SessionUser | null,
  input: unknown,
): Promise<CertificateResult<CertificateRecord>> {
  const forbidden = assertCertificateStudent(actor);
  if (forbidden) {
    return forbidden;
  }

  const parsed = certificateIdSchema.safeParse(input);
  if (!parsed.success) {
    return certificateFailure(CertificateErrorCode.VALIDATION_ERROR);
  }

  const row = await findCertificateById(parsed.data.certificateId);
  if (!row) {
    return certificateFailure(CertificateErrorCode.CERTIFICATE_NOT_FOUND);
  }

  if (row.studentId !== actor!.id) {
    return certificateFailure(CertificateErrorCode.FORBIDDEN);
  }

  return certificateSuccess(toCertificateRecord(row));
}
