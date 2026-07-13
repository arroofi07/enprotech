import { z } from "zod";

function emptyToUndefined(value: unknown): unknown {
  if (value === "" || value === null || value === undefined) {
    return undefined;
  }

  return value;
}

export const submitProjectSchema = z.object({
  trainingId: z.uuid("ID training tidak valid."),
  title: z.preprocess(
    emptyToUndefined,
    z.string().trim().max(200, "Judul maksimal 200 karakter.").optional(),
  ),
  description: z.preprocess(
    emptyToUndefined,
    z.string().trim().max(5000, "Deskripsi terlalu panjang.").optional(),
  ),
  imageUrl: z.string().url("URL gambar tidak valid."),
  videoUrl: z.string().url("URL video tidak valid."),
  pdfUrl: z.string().url("URL PDF tidak valid."),
  pdfFileSize: z.coerce.number().int().min(0).optional(),
});

export const listProjectsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  search: z.preprocess(
    emptyToUndefined,
    z.string().trim().max(200).optional(),
  ),
  trainingId: z.preprocess(
    emptyToUndefined,
    z.uuid("ID training tidak valid.").optional(),
  ),
});

export const uploadProjectFileSchema = z.object({
  kind: z.enum(["image", "pdf"]),
});

export type SubmitProjectInput = z.infer<typeof submitProjectSchema>;
export type ListProjectsInput = z.infer<typeof listProjectsSchema>;
