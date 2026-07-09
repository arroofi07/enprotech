import { z } from "zod";

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

export const createModuleSchema = z.object({
  trainingId: z.uuid("ID training tidak valid."),
  title: z
    .string()
    .trim()
    .min(3, "Judul minimal 3 karakter.")
    .max(200, "Judul maksimal 200 karakter."),
  description: z.preprocess(
    emptyToUndefined,
    z.string().trim().max(5000, "Deskripsi terlalu panjang.").optional(),
  ),
  videoConferenceLink: z.preprocess(
    emptyToUndefined,
    z.string().url("URL video conference tidak valid.").optional(),
  ),
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

export type CreateModuleInput = z.infer<typeof createModuleSchema>;
export type UpdateModuleInput = z.infer<typeof updateModuleSchema>;
export type CreateModuleContentInput = z.infer<typeof createModuleContentSchema>;
