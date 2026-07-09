import { z } from "zod";

function emptyToUndefined(value: unknown): unknown {
  if (value === "" || value === null || value === undefined) {
    return undefined;
  }

  return value;
}

function parseDateBoundary(value: unknown, endOfDay: boolean): Date | undefined {
  if (value === "" || value === null || value === undefined) {
    return undefined;
  }

  const raw = String(value).trim();
  const date = new Date(`${raw}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  if (endOfDay) {
    date.setUTCHours(23, 59, 59, 999);
  }

  return date;
}

const reportFilterFields = {
  studentId: z.preprocess(
    emptyToUndefined,
    z.string().uuid("Student tidak valid.").optional(),
  ),
  trainingId: z.preprocess(
    emptyToUndefined,
    z.string().uuid("Training tidak valid.").optional(),
  ),
  moduleId: z.preprocess(
    emptyToUndefined,
    z.string().uuid("Modul tidak valid.").optional(),
  ),
  search: z.preprocess(
    emptyToUndefined,
    z.string().trim().max(200, "Pencarian terlalu panjang.").optional(),
  ),
  dateFrom: z.preprocess(
    (value) => parseDateBoundary(value, false),
    z.date().optional(),
  ),
  dateTo: z.preprocess(
    (value) => parseDateBoundary(value, true),
    z.date().optional(),
  ),
};

export const listTrainingReportQuerySchema = z
  .object({
    ...reportFilterFields,
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(10),
  })
  .refine(
    (value) =>
      !value.dateFrom ||
      !value.dateTo ||
      value.dateFrom.getTime() <= value.dateTo.getTime(),
    {
      message: "Tanggal mulai harus sebelum tanggal akhir.",
      path: ["dateTo"],
    },
  );

export const exportTrainingReportQuerySchema = z
  .object({
    ...reportFilterFields,
    format: z.enum(["xlsx", "pdf"]),
  })
  .refine(
    (value) =>
      !value.dateFrom ||
      !value.dateTo ||
      value.dateFrom.getTime() <= value.dateTo.getTime(),
    {
      message: "Tanggal mulai harus sebelum tanggal akhir.",
      path: ["dateTo"],
    },
  );

export const getStudentReportDetailSchema = z.object({
  studentId: z.string().uuid("Student tidak valid."),
  trainingId: z.string().uuid("Training tidak valid."),
});
