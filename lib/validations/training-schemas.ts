import { z } from "zod";

import { listPaginationQuerySchema } from "@/lib/validations/pagination-schemas";

const trainingStatusSchema = z.enum([
  "draft",
  "active",
  "completed",
  "archived",
]);

function emptyToUndefined(value: unknown): unknown {
  if (value === "" || value === null || value === undefined) {
    return undefined;
  }

  return value;
}

function optionalDate(value: unknown): unknown {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  return value;
}

export const createTrainingSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Judul minimal 3 karakter.")
    .max(200, "Judul maksimal 200 karakter."),
  description: z.preprocess(
    emptyToUndefined,
    z.string().trim().max(5000, "Deskripsi terlalu panjang.").optional(),
  ),
  thumbnail: z.preprocess(
    emptyToUndefined,
    z.string().url("URL thumbnail tidak valid.").optional(),
  ),
  passingGrade: z.coerce
    .number()
    .int("Passing grade harus bilangan bulat.")
    .min(0, "Passing grade minimal 0.")
    .max(100, "Passing grade maksimal 100.")
    .default(70),
  deadline: z.preprocess(
    optionalDate,
    z.coerce.date().nullable().optional(),
  ),
});

export const updateTrainingSchema = createTrainingSchema
  .partial()
  .extend({
    status: trainingStatusSchema.optional(),
    isPretestActive: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "Minimal satu field harus diisi.",
  });

export const listTrainingsQuerySchema = z.object({
  search: z.preprocess(emptyToUndefined, z.string().trim().optional()),
  status: z.preprocess(emptyToUndefined, trainingStatusSchema.optional()),
  page: listPaginationQuerySchema.shape.page,
  pageSize: listPaginationQuerySchema.shape.pageSize,
});

export const listEnrolledTrainingsQuerySchema = listPaginationQuerySchema;

export const getTrainingSchema = z.object({
  trainingId: z.uuid("ID training tidak valid."),
});

export const enrollStudentsSchema = z.object({
  trainingId: z.uuid("ID training tidak valid."),
  studentIds: z
    .array(z.uuid("ID student tidak valid."))
    .min(1, "Pilih minimal satu student."),
});

export const removeEnrollmentSchema = z.object({
  enrollmentId: z.uuid("ID enrollment tidak valid."),
});

export const activatePretestSchema = z.object({
  trainingId: z.uuid("ID training tidak valid."),
});

export type CreateTrainingInput = z.infer<typeof createTrainingSchema>;
export type UpdateTrainingInput = z.infer<typeof updateTrainingSchema>;
export type ListTrainingsQueryInput = z.infer<typeof listTrainingsQuerySchema>;
export type ListEnrolledTrainingsQueryInput = z.infer<
  typeof listEnrolledTrainingsQuerySchema
>;
export type GetTrainingInput = z.infer<typeof getTrainingSchema>;
export type EnrollStudentsInput = z.infer<typeof enrollStudentsSchema>;
export type RemoveEnrollmentInput = z.infer<typeof removeEnrollmentSchema>;
export type ActivatePretestInput = z.infer<typeof activatePretestSchema>;
