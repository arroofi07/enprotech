import { z } from "zod";

import type {
  AssessmentType,
  ModuleAssessmentType,
  TrainingAssessmentType,
} from "@/lib/domain/assessments/types";
import { listPaginationQuerySchema } from "@/lib/validations/pagination-schemas";

const moduleAssessmentTypeSchema = z.enum(["quiz", "latihan"]);
const trainingAssessmentTypeSchema = z.enum(["pre_test", "post_test"]);
const assessmentTypeSchema = z.enum(["quiz", "latihan", "pre_test", "post_test"]);

function emptyToUndefined(value: unknown): unknown {
  if (value === "" || value === null || value === undefined) {
    return undefined;
  }

  return value;
}

export const listModuleAssessmentHubSchema = z.object({
  type: moduleAssessmentTypeSchema,
  trainingId: z.preprocess(
    emptyToUndefined,
    z.uuid("ID training tidak valid.").optional(),
  ),
  search: z.preprocess(emptyToUndefined, z.string().trim().optional()),
  page: listPaginationQuerySchema.shape.page,
  pageSize: listPaginationQuerySchema.shape.pageSize,
});

const optionInputSchema = z.object({
  text: z.string().trim().min(1, "Opsi jawaban tidak boleh kosong."),
  isCorrect: z.boolean(),
});

export const moduleAssessmentSchema = z.object({
  moduleId: z.uuid("ID modul tidak valid."),
  type: moduleAssessmentTypeSchema,
});

export const trainingAssessmentSchema = z.object({
  trainingId: z.uuid("ID training tidak valid."),
  type: trainingAssessmentTypeSchema,
});

export const createQuestionSchema = z
  .object({
    assessmentId: z.uuid("ID assessment tidak valid."),
    questionText: z
      .string()
      .trim()
      .min(3, "Pertanyaan minimal 3 karakter.")
      .max(2000, "Pertanyaan terlalu panjang."),
    options: z
      .array(optionInputSchema)
      .length(5, "Harus ada tepat 5 opsi jawaban."),
  })
  .superRefine((value, ctx) => {
    const correctCount = value.options.filter((option) => option.isCorrect).length;
    if (correctCount !== 1) {
      ctx.addIssue({
        code: "custom",
        message: "Harus ada tepat satu jawaban benar.",
        path: ["options"],
      });
    }
  });

export const updateQuestionSchema = z
  .object({
    questionText: z
      .string()
      .trim()
      .min(3, "Pertanyaan minimal 3 karakter.")
      .max(2000, "Pertanyaan terlalu panjang."),
    options: z
      .array(optionInputSchema)
      .length(5, "Harus ada tepat 5 opsi jawaban."),
  })
  .superRefine((value, ctx) => {
    const correctCount = value.options.filter((option) => option.isCorrect).length;
    if (correctCount !== 1) {
      ctx.addIssue({
        code: "custom",
        message: "Harus ada tepat satu jawaban benar.",
        path: ["options"],
      });
    }
  });

export const questionIdSchema = z.object({
  questionId: z.uuid("ID soal tidak valid."),
});

export const assessmentIdSchema = z.object({
  assessmentId: z.uuid("ID assessment tidak valid."),
});

export const attemptIdSchema = z.object({
  attemptId: z.uuid("ID attempt tidak valid."),
});

export const saveAnswersSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.uuid("ID soal tidak valid."),
      selectedOptionId: z.string().min(1, "Opsi jawaban tidak valid."),
    }),
  ),
});

const timeLimitFieldSchema = z.preprocess(
  (value) => {
    if (value === "" || value === null || value === undefined) {
      return null;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : value;
  },
  z.number().int().min(1, "Batas waktu minimal 1 menit.").nullable(),
);

export const updateAssessmentSettingsSchema = z.object({
  assessmentId: z.uuid("ID assessment tidak valid."),
  questionDisplayCount: z.preprocess(
    (value) => {
      if (value === "" || value === null || value === undefined) {
        return null;
      }

      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : value;
    },
    z.number().int().min(1).nullable(),
  ),
  shuffleQuestions: z.preprocess((value) => {
    if (value === "true" || value === true || value === "on") {
      return true;
    }

    return false;
  }, z.boolean()),
  timeLimit: timeLimitFieldSchema,
});

export const updateAssessmentTimeLimitSchema = z.object({
  assessmentId: z.uuid("ID assessment tidak valid."),
  timeLimit: timeLimitFieldSchema,
});

export type ModuleAssessmentInput = z.infer<typeof moduleAssessmentSchema>;
export type TrainingAssessmentInput = z.infer<typeof trainingAssessmentSchema>;
export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>;
export type SaveAnswersInput = z.infer<typeof saveAnswersSchema>;

export function getAssessmentTitle(
  contextTitle: string,
  type: AssessmentType,
): string {
  switch (type) {
    case "quiz":
      return `Quiz — ${contextTitle}`;
    case "latihan":
      return `Latihan — ${contextTitle}`;
    case "pre_test":
      return `Pre-Test — ${contextTitle}`;
    case "post_test":
      return `Post-Test — ${contextTitle}`;
  }
}

export function getTrainingAssessmentTitle(
  trainingTitle: string,
  type: TrainingAssessmentType,
): string {
  return getAssessmentTitle(trainingTitle, type);
}

export function getModuleAssessmentTitle(
  moduleTitle: string,
  type: ModuleAssessmentType,
): string {
  return getAssessmentTitle(moduleTitle, type);
}
