import { z } from "zod";

function emptyToUndefined(value: unknown): unknown {
  if (value === "" || value === null || value === undefined) {
    return undefined;
  }

  return value;
}

export const submitFeedbackSchema = z.object({
  trainingId: z.uuid("ID training tidak valid."),
  trainingRating: z.coerce
    .number()
    .int()
    .min(1, "Rating training minimal 1.")
    .max(5, "Rating training maksimal 5."),
  trainerRating: z.coerce
    .number()
    .int()
    .min(1, "Rating trainer minimal 1.")
    .max(5, "Rating trainer maksimal 5."),
  comment: z.preprocess(
    emptyToUndefined,
    z.string().trim().max(2000, "Komentar terlalu panjang.").optional(),
  ),
});

export const listFeedbackSchema = z.object({
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

export type SubmitFeedbackInput = z.infer<typeof submitFeedbackSchema>;
export type ListFeedbackInput = z.infer<typeof listFeedbackSchema>;
