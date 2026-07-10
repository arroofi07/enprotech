import { and, count, desc, eq, ilike } from "drizzle-orm";

import { db } from "@/lib/db";
import { certificates } from "@/lib/db/schema/certificates";
import { trainings } from "@/lib/db/schema/trainings";
import { users } from "@/lib/db/schema/users";
import { buildTrainingCode } from "@/lib/domain/certificates/build-certificate-number";

export type CertificateRow = {
  id: string;
  certificateNumber: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  trainingId: string;
  trainingTitle: string;
  issuedAt: Date;
  preTestScore: number;
  postTestScore: number;
  finalGrade: number;
};

export type CreateCertificateInput = {
  certificateNumber: string;
  studentId: string;
  trainingId: string;
  preTestScore: number;
  postTestScore: number;
  finalGrade: number;
};

function mapCertificateRow(row: {
  id: string;
  certificateNumber: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  trainingId: string;
  trainingTitle: string;
  issuedAt: Date;
  preTestScore: number;
  postTestScore: number;
  finalGrade: number;
}): CertificateRow {
  return {
    id: row.id,
    certificateNumber: row.certificateNumber,
    studentId: row.studentId,
    studentName: row.studentName,
    studentEmail: row.studentEmail,
    trainingId: row.trainingId,
    trainingTitle: row.trainingTitle,
    issuedAt: row.issuedAt,
    preTestScore: row.preTestScore,
    postTestScore: row.postTestScore,
    finalGrade: row.finalGrade,
  };
}

const certificateSelect = {
  id: certificates.id,
  certificateNumber: certificates.certificateNumber,
  studentId: certificates.studentId,
  studentName: users.name,
  studentEmail: users.email,
  trainingId: certificates.trainingId,
  trainingTitle: trainings.title,
  issuedAt: certificates.issuedAt,
  preTestScore: certificates.preTestScore,
  postTestScore: certificates.postTestScore,
  finalGrade: certificates.finalGrade,
};

function buildCertificateQuery() {
  return db
    .select(certificateSelect)
    .from(certificates)
    .innerJoin(users, eq(certificates.studentId, users.id))
    .innerJoin(trainings, eq(certificates.trainingId, trainings.id));
}

export async function createCertificate(
  input: CreateCertificateInput,
): Promise<CertificateRow> {
  const [row] = await db
    .insert(certificates)
    .values({
      certificateNumber: input.certificateNumber,
      studentId: input.studentId,
      trainingId: input.trainingId,
      preTestScore: input.preTestScore,
      postTestScore: input.postTestScore,
      finalGrade: input.finalGrade,
    })
    .returning({
      id: certificates.id,
      certificateNumber: certificates.certificateNumber,
      studentId: certificates.studentId,
      trainingId: certificates.trainingId,
      issuedAt: certificates.issuedAt,
      preTestScore: certificates.preTestScore,
      postTestScore: certificates.postTestScore,
      finalGrade: certificates.finalGrade,
    });

  const [enriched] = await buildCertificateQuery()
    .where(eq(certificates.id, row.id))
    .limit(1);

  if (!enriched) {
    throw new Error("Failed to load created certificate.");
  }

  return mapCertificateRow(enriched);
}

export async function findCertificateById(
  certificateId: string,
): Promise<CertificateRow | null> {
  const [row] = await buildCertificateQuery()
    .where(eq(certificates.id, certificateId))
    .limit(1);

  return row ? mapCertificateRow(row) : null;
}

export async function findCertificateByNumber(
  certificateNumber: string,
): Promise<CertificateRow | null> {
  const [row] = await buildCertificateQuery()
    .where(eq(certificates.certificateNumber, certificateNumber))
    .limit(1);

  return row ? mapCertificateRow(row) : null;
}

export async function findCertificateByStudentAndTraining(
  studentId: string,
  trainingId: string,
): Promise<CertificateRow | null> {
  const [row] = await buildCertificateQuery()
    .where(
      and(
        eq(certificates.studentId, studentId),
        eq(certificates.trainingId, trainingId),
      ),
    )
    .limit(1);

  return row ? mapCertificateRow(row) : null;
}

export async function listCertificatesByStudent(
  studentId: string,
  query: { page: number; pageSize: number; trainingId?: string },
): Promise<{ items: CertificateRow[]; total: number }> {
  const filters = [eq(certificates.studentId, studentId)];
  if (query.trainingId) {
    filters.push(eq(certificates.trainingId, query.trainingId));
  }

  const where = and(...filters);
  const offset = (query.page - 1) * query.pageSize;

  const [rows, totalResult] = await Promise.all([
    buildCertificateQuery()
      .where(where)
      .orderBy(desc(certificates.issuedAt))
      .limit(query.pageSize)
      .offset(offset),
    db.select({ value: count() }).from(certificates).where(where),
  ]);

  return {
    items: rows.map(mapCertificateRow),
    total: totalResult[0]?.value ?? 0,
  };
}

export async function countCertificatesForCodeYear(
  trainingTitle: string,
  year: number,
): Promise<number> {
  const trainingCode = buildTrainingCode(trainingTitle);
  const prefix = `CERT-${trainingCode}-${year}-`;

  const [row] = await db
    .select({ value: count() })
    .from(certificates)
    .where(ilike(certificates.certificateNumber, `${prefix}%`));

  return Number(row?.value ?? 0);
}
