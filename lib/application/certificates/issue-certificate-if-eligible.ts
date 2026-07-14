import { getStudentTrainingFlowState } from "@/lib/application/training-flow/get-student-training-flow-state";
import { buildCertificateNumber } from "@/lib/domain/certificates/build-certificate-number";
import { computeFinalGrade } from "@/lib/domain/certificates/compute-final-grade";
import {
  countSubmittedAttempts,
  findAssessmentByTrainingAndType,
  getBestSubmittedScore,
} from "@/lib/infrastructure/db/repositories/assessment-repository";
import {
  countCertificatesForCodeYear,
  createCertificate,
  findCertificateByStudentAndTraining,
  type CertificateRow,
} from "@/lib/infrastructure/db/repositories/certificate-repository";
import { findTrainingById } from "@/lib/infrastructure/db/repositories/training-repository";
import { notifyCertificateIssued } from "@/lib/application/notifications/notify-certificate-issued";
import { issueCertificateSchema } from "@/lib/validations/certificate-schemas";

export async function issueCertificateIfEligible(
  input: unknown,
): Promise<CertificateRow | null> {
  const parsed = issueCertificateSchema.safeParse(input);
  if (!parsed.success) {
    return null;
  }

  const { studentId, trainingId } = parsed.data;

  const existing = await findCertificateByStudentAndTraining(
    studentId,
    trainingId,
  );
  if (existing) {
    return existing;
  }

  const flow = await getStudentTrainingFlowState(studentId, trainingId);
  if (!flow?.canAccessCertificate) {
    return null;
  }

  const training = await findTrainingById(trainingId);
  if (!training) {
    return null;
  }

  const [preTest, postTest] = await Promise.all([
    findAssessmentByTrainingAndType(trainingId, "pre_test"),
    findAssessmentByTrainingAndType(trainingId, "post_test"),
  ]);

  if (!postTest) {
    return null;
  }

  let preTestScore = 0;
  if (preTest) {
    const preTestAttempts = await countSubmittedAttempts(studentId, preTest.id);
    if (preTestAttempts > 0) {
      preTestScore = await getBestSubmittedScore(studentId, preTest.id);
    }
  }

  const postTestScore = await getBestSubmittedScore(studentId, postTest.id);
  const finalGrade = computeFinalGrade(preTestScore, postTestScore);

  const year = new Date().getUTCFullYear();
  const sequence =
    (await countCertificatesForCodeYear(training.title, year)) + 1;
  const certificateNumber = buildCertificateNumber({
    trainingTitle: training.title,
    year,
    sequence,
  });

  const certificate = await createCertificate({
    certificateNumber,
    studentId,
    trainingId,
    preTestScore,
    postTestScore,
    finalGrade,
  });

  await notifyCertificateIssued({
    studentId,
    trainingId,
    certificateId: certificate.id,
  });

  return certificate;
}
