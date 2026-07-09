import {
  CertificateErrorCode,
  certificateFailure,
  certificateSuccess,
  type CertificateResult,
} from "@/lib/domain/certificates/errors";
import type { VerifiedCertificate } from "@/lib/domain/certificates/types";
import { findCertificateByNumber } from "@/lib/infrastructure/db/repositories/certificate-repository";
import { verifyCertificateSchema } from "@/lib/validations/certificate-schemas";

import { toVerifiedCertificate } from "./certificate-view";

export async function verifyCertificate(
  input: unknown,
): Promise<CertificateResult<VerifiedCertificate>> {
  const parsed = verifyCertificateSchema.safeParse(input);
  if (!parsed.success) {
    return certificateFailure(CertificateErrorCode.VALIDATION_ERROR);
  }

  const row = await findCertificateByNumber(parsed.data.certificateNumber);
  if (!row) {
    return certificateFailure(CertificateErrorCode.CERTIFICATE_NOT_FOUND);
  }

  return certificateSuccess(toVerifiedCertificate(row));
}
