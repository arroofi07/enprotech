import { z } from "zod";

export const importQuestionsBodySchema = z.object({
  assessmentId: z.string().uuid("Assessment tidak valid."),
});

export const importFileSchema = z.object({
  buffer: z.instanceof(ArrayBuffer),
});
