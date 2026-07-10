import { z } from "zod";

import { listPaginationQuerySchema } from "@/lib/validations/pagination-schemas";

function emptyToUndefined(value: unknown): unknown {
  if (value === "" || value === null || value === undefined) {
    return undefined;
  }

  return value;
}

export const certificateIdSchema = z.object({
  certificateId: z.string().uuid("ID sertifikat tidak valid."),
});

export const verifyCertificateSchema = z.object({
  certificateNumber: z
    .string()
    .trim()
    .min(8, "Nomor sertifikat tidak valid.")
    .max(80, "Nomor sertifikat terlalu panjang."),
});

export const issueCertificateSchema = z.object({
  studentId: z.string().uuid("Student tidak valid."),
  trainingId: z.string().uuid("Training tidak valid."),
});

export const listCertificatesQuerySchema = z.object({
  trainingId: z.preprocess(
    emptyToUndefined,
    z.string().uuid("Training tidak valid.").optional(),
  ),
  page: listPaginationQuerySchema.shape.page,
  pageSize: listPaginationQuerySchema.shape.pageSize,
});

export const listTrainerCertificatesQuerySchema = z.object({
  search: z.preprocess(
    emptyToUndefined,
    z.string().trim().max(120, "Kata kunci terlalu panjang.").optional(),
  ),
  studentId: z.preprocess(
    emptyToUndefined,
    z.string().uuid("Student tidak valid.").optional(),
  ),
  trainingId: z.preprocess(
    emptyToUndefined,
    z.string().uuid("Training tidak valid.").optional(),
  ),
  page: listPaginationQuerySchema.shape.page,
  pageSize: listPaginationQuerySchema.shape.pageSize,
});
