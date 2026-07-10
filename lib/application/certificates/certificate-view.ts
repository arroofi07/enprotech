import type { CertificateRow } from "@/lib/infrastructure/db/repositories/certificate-repository";
import type {
  CertificateRecord,
  CertificateSummary,
  TrainerCertificateSummary,
  VerifiedCertificate,
} from "@/lib/domain/certificates/types";

export function toCertificateSummary(row: CertificateRow): CertificateSummary {
  return {
    id: row.id,
    certificateNumber: row.certificateNumber,
    trainingId: row.trainingId,
    trainingTitle: row.trainingTitle,
    issuedAt: row.issuedAt.toISOString(),
    preTestScore: row.preTestScore,
    postTestScore: row.postTestScore,
    finalGrade: row.finalGrade,
  };
}

export function toTrainerCertificateSummary(
  row: CertificateRow,
): TrainerCertificateSummary {
  return {
    ...toCertificateSummary(row),
    studentId: row.studentId,
    studentName: row.studentName,
    studentEmail: row.studentEmail,
  };
}

export function toCertificateRecord(row: CertificateRow): CertificateRecord {
  return {
    id: row.id,
    certificateNumber: row.certificateNumber,
    studentId: row.studentId,
    studentName: row.studentName,
    studentEmail: row.studentEmail,
    trainingId: row.trainingId,
    trainingTitle: row.trainingTitle,
    issuedAt: row.issuedAt.toISOString(),
    preTestScore: row.preTestScore,
    postTestScore: row.postTestScore,
    finalGrade: row.finalGrade,
  };
}

export function toVerifiedCertificate(
  row: CertificateRow,
): VerifiedCertificate {
  return {
    certificateNumber: row.certificateNumber,
    studentName: row.studentName,
    trainingTitle: row.trainingTitle,
    issuedAt: row.issuedAt.toISOString(),
    preTestScore: row.preTestScore,
    postTestScore: row.postTestScore,
    finalGrade: row.finalGrade,
    isValid: true,
  };
}
