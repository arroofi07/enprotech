import type { SessionUser } from "@/lib/domain/auth/types";
import {
  CertificateErrorCode,
  certificateFailure,
  certificateSuccess,
  type CertificateResult,
} from "@/lib/domain/certificates/errors";
import type { TrainerCertificateSummary } from "@/lib/domain/certificates/types";
import { listCertificates } from "@/lib/infrastructure/db/repositories/certificate-repository";
import { buildPaginatedResult } from "@/lib/validations/pagination-schemas";
import { listTrainerCertificatesQuerySchema } from "@/lib/validations/certificate-schemas";

import { assertCertificateTrainerOrAdmin } from "./assert-trainer-or-admin";
import { toTrainerCertificateSummary } from "./certificate-view";

export type ListTrainerCertificatesResult = {
  items: TrainerCertificateSummary[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export async function listTrainerCertificates(
  actor: SessionUser | null,
  input: unknown,
): Promise<CertificateResult<ListTrainerCertificatesResult>> {
  const forbidden = assertCertificateTrainerOrAdmin(actor);
  if (forbidden) {
    return forbidden;
  }

  const parsed = listTrainerCertificatesQuerySchema.safeParse(input);
  if (!parsed.success) {
    return certificateFailure(CertificateErrorCode.VALIDATION_ERROR);
  }

  const { page, pageSize, search, studentId, trainingId } = parsed.data;
  const result = await listCertificates({
    page,
    pageSize,
    search,
    studentId,
    trainingId,
  });

  return certificateSuccess(
    buildPaginatedResult(
      result.items.map(toTrainerCertificateSummary),
      result.total,
      page,
      pageSize,
    ),
  );
}
