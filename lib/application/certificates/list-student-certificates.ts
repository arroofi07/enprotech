import type { SessionUser } from "@/lib/domain/auth/types";
import {
  CertificateErrorCode,
  certificateFailure,
  certificateSuccess,
  type CertificateResult,
} from "@/lib/domain/certificates/errors";
import type { CertificateSummary } from "@/lib/domain/certificates/types";
import { listCertificatesByStudent } from "@/lib/infrastructure/db/repositories/certificate-repository";
import { listCertificatesQuerySchema } from "@/lib/validations/certificate-schemas";

import { assertCertificateStudent } from "./assert-student";
import { toCertificateSummary } from "./certificate-view";

export async function listStudentCertificates(
  actor: SessionUser | null,
  input: unknown,
): Promise<CertificateResult<CertificateSummary[]>> {
  const forbidden = assertCertificateStudent(actor);
  if (forbidden) {
    return forbidden;
  }

  const parsed = listCertificatesQuerySchema.safeParse(input);
  if (!parsed.success) {
    return certificateFailure(CertificateErrorCode.VALIDATION_ERROR);
  }

  const rows = await listCertificatesByStudent(actor!.id);
  const filtered = parsed.data.trainingId
    ? rows.filter((row) => row.trainingId === parsed.data.trainingId)
    : rows;

  return certificateSuccess(filtered.map(toCertificateSummary));
}
