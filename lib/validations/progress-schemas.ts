import { z } from "zod";

export const getTrainingProgressSchema = z.object({
  trainingId: z.string().uuid(),
});
