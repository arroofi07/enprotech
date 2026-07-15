import { z } from "zod";

import { parseWibDateTimeLocal } from "@/lib/domain/modules/format-video-conference-schedule";

const moduleContentTypeSchema = z.enum([
  "document",
  "video_link",
  "download_link",
]);

function emptyToUndefined(value: unknown): unknown {
  if (value === "" || value === null || value === undefined) {
    return undefined;
  }

  return value;
}

function emptyToNull(value: unknown): unknown {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  return value;
}

function preprocessWibDateTime(value: unknown): unknown {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "string") {
    return parseWibDateTimeLocal(value) ?? value;
  }

  return value;
}

const scoreRequirementSchema = z.coerce
  .number()
  .int("Nilai harus bilangan bulat.")
  .min(0, "Nilai minimal 0%.")
  .max(100, "Nilai maksimal 100%.");

export const createModuleSchema = z.object({
  trainingId: z.uuid("ID training tidak valid."),
  title: z
    .string()
    .trim()
    .min(3, "Nama modul minimal 3 karakter.")
    .max(200, "Nama modul maksimal 200 karakter."),
  description: z.preprocess(
    emptyToUndefined,
    z.string().trim().max(5000, "Target pelatihan terlalu panjang.").optional(),
  ),
  thumbnail: z.preprocess(
    emptyToUndefined,
    z.string().url("URL thumbnail tidak valid.").optional(),
  ),
  videoConferenceLink: z.preprocess(
    emptyToUndefined,
    z.string().url("URL video conference tidak valid.").optional(),
  ),
  order: z.coerce
    .number()
    .int("Urutan harus bilangan bulat.")
    .min(1, "Urutan minimal 1.")
    .optional(),
  minQuizScore: scoreRequirementSchema.optional(),
  minLatihanScore: scoreRequirementSchema.optional(),
  minAttendance: scoreRequirementSchema.optional(),
  videoUrl: z.preprocess(
    emptyToUndefined,
    z.string().url("URL video tidak valid.").optional(),
  ),
  pptUrl: z.preprocess(
    emptyToUndefined,
    z.string().url("URL PPT tidak valid.").optional(),
  ),
  materialUrl: z.preprocess(
    emptyToUndefined,
    z.string().url("URL materi tidak valid.").optional(),
  ),
  materialSize: z.coerce.number().int().min(0).optional(),
});

export const updateModuleSchema = z
  .object({
    moduleId: z.uuid("ID modul tidak valid."),
    title: z
      .string()
      .trim()
      .min(3, "Judul minimal 3 karakter.")
      .max(200, "Judul maksimal 200 karakter.")
      .optional(),
    description: z.preprocess(
      emptyToNull,
      z.string().trim().max(5000, "Deskripsi terlalu panjang.").nullable().optional(),
    ),
    thumbnail: z.preprocess(
      emptyToNull,
      z.string().url("URL thumbnail tidak valid.").nullable().optional(),
    ),
    videoConferenceLink: z.preprocess(
      emptyToNull,
      z.string().url("URL video conference tidak valid.").nullable().optional(),
    ),
    minQuizScore: scoreRequirementSchema.optional(),
    minLatihanScore: scoreRequirementSchema.optional(),
    minAttendance: scoreRequirementSchema.optional(),
    order: z.coerce
      .number()
      .int("Urutan harus bilangan bulat.")
      .min(1, "Urutan minimal 1.")
      .optional(),
  })
  .refine((value) => Object.keys(value).length > 1, {
    message: "Minimal satu field harus diisi.",
  });

export const deleteModuleSchema = z.object({
  moduleId: z.uuid("ID modul tidak valid."),
});

export const listModulesSchema = z.object({
  trainingId: z.uuid("ID training tidak valid."),
});

export const getModuleSchema = z.object({
  moduleId: z.uuid("ID modul tidak valid."),
});

export const reorderModulesSchema = z.object({
  trainingId: z.uuid("ID training tidak valid."),
  moduleIds: z
    .array(z.uuid("ID modul tidak valid."))
    .min(1, "Minimal satu modul."),
});

export const createModuleContentSchema = z.object({
  moduleId: z.uuid("ID modul tidak valid."),
  type: moduleContentTypeSchema,
  title: z
    .string()
    .trim()
    .min(1, "Judul konten wajib diisi.")
    .max(200, "Judul maksimal 200 karakter."),
  url: z.string().url("URL tidak valid."),
  fileSize: z.coerce.number().int().min(0).optional(),
});

export const updateModuleContentSchema = z
  .object({
    contentId: z.uuid("ID konten tidak valid."),
    title: z
      .string()
      .trim()
      .min(1, "Judul konten wajib diisi.")
      .max(200, "Judul maksimal 200 karakter.")
      .optional(),
    url: z.string().url("URL tidak valid.").optional(),
    fileSize: z.coerce.number().int().min(0).nullable().optional(),
  })
  .refine((value) => Object.keys(value).length > 1, {
    message: "Minimal satu field harus diisi.",
  });

export const deleteModuleContentSchema = z.object({
  contentId: z.uuid("ID konten tidak valid."),
});

export const reorderModuleContentsSchema = z.object({
  moduleId: z.uuid("ID modul tidak valid."),
  contentIds: z
    .array(z.uuid("ID konten tidak valid."))
    .min(1, "Minimal satu konten."),
});

export const uploadFileSchema = z.object({
  purpose: z.enum(["thumbnail", "document"]),
});

export const updateModuleProgressSchema = z.object({
  moduleId: z.uuid("ID modul tidak valid."),
  status: z.enum(["in_progress", "completed"]),
});

export const updateModuleVideoConferenceSchema = z
  .object({
    moduleId: z.uuid("ID modul tidak valid."),
    trainingId: z.uuid("ID training tidak valid."),
    videoConferenceLink: z.preprocess(
      emptyToNull,
      z.string().url("URL video conference tidak valid.").nullable(),
    ),
    videoConferenceScheduledAt: z.preprocess(
      preprocessWibDateTime,
      z.date({ message: "Jadwal tidak valid." }).nullable(),
    ),
  })
  .superRefine((value, context) => {
    const hasLink = Boolean(value.videoConferenceLink);
    const hasSchedule = value.videoConferenceScheduledAt instanceof Date;

    if (hasLink && !hasSchedule) {
      context.addIssue({
        code: "custom",
        message: "Jadwal video conference wajib diisi.",
        path: ["videoConferenceScheduledAt"],
      });
    }

    if (!hasLink && hasSchedule) {
      context.addIssue({
        code: "custom",
        message: "Link video conference wajib diisi.",
        path: ["videoConferenceLink"],
      });
    }
  });

export const endModuleVideoConferenceSchema = z.object({
  moduleId: z.uuid("ID modul tidak valid."),
  trainingId: z.uuid("ID training tidak valid."),
});

export type CreateModuleInput = z.infer<typeof createModuleSchema>;
export type UpdateModuleInput = z.infer<typeof updateModuleSchema>;
export type CreateModuleContentInput = z.infer<typeof createModuleContentSchema>;
