import type { SessionUser } from "@/lib/domain/auth/types";
import {
  CertificateErrorCode,
  certificateFailure,
  certificateSuccess,
  type CertificateResult,
} from "@/lib/domain/certificates/errors";
import type { CertificateSummary } from "@/lib/domain/certificates/types";
import { listCertificatesByStudent } from "@/lib/infrastructure/db/repositories/certificate-repository";
import { buildPaginatedResult } from "@/lib/validations/pagination-schemas";
import { listCertificatesQuerySchema } from "@/lib/validations/certificate-schemas";

import { assertCertificateStudent } from "./assert-student";
import { toCertificateSummary } from "./certificate-view";

export type ListStudentCertificatesResult = {
  items: CertificateSummary[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export async function listStudentCertificates(
  actor: SessionUser | null,
  input: unknown,
): Promise<CertificateResult<ListStudentCertificatesResult>> {
  const forbidden = assertCertificateStudent(actor);
  if (forbidden) {
    return forbidden;
  }

  const parsed = listCertificatesQuerySchema.safeParse(input);
  if (!parsed.success) {
    return certificateFailure(CertificateErrorCode.VALIDATION_ERROR);
  }

  const { page, pageSize, trainingId } = parsed.data;
  const result = await listCertificatesByStudent(actor!.id, {
    page,
    pageSize,
    trainingId,
  });

  return certificateSuccess(
    buildPaginatedResult(
      result.items.map(toCertificateSummary),
      result.total,
      page,
      pageSize,
    ),
  );
}
