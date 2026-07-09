import type { SessionUser } from "@/lib/domain/auth/types";
import { buildCertificatePdfBuffer } from "@/lib/domain/certificates/export-certificate-pdf";
import {
  CertificateErrorCode,
  certificateFailure,
  certificateSuccess,
  type CertificateResult,
} from "@/lib/domain/certificates/errors";
import { findCertificateById } from "@/lib/infrastructure/db/repositories/certificate-repository";
import { certificateIdSchema } from "@/lib/validations/certificate-schemas";

import { assertCertificateStudent } from "./assert-student";

export type DownloadCertificateResult = {
  buffer: ArrayBuffer;
  filename: string;
  contentType: string;
};

export async function downloadCertificate(
  actor: SessionUser | null,
  input: unknown,
): Promise<CertificateResult<DownloadCertificateResult>> {
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

  const buffer = buildCertificatePdfBuffer({
    certificateNumber: row.certificateNumber,
    studentName: row.studentName,
    trainingTitle: row.trainingTitle,
    issuedAt: row.issuedAt.toISOString(),
    preTestScore: row.preTestScore,
    postTestScore: row.postTestScore,
    finalGrade: row.finalGrade,
  });

  return certificateSuccess({
    buffer,
    filename: `${row.certificateNumber}.pdf`,
    contentType: "application/pdf",
  });
}
