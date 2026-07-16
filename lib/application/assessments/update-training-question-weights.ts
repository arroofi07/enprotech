import type { SessionUser } from "@/lib/domain/auth/types";
import {
  AssessmentErrorCode,
  assessmentFailure,
  assessmentSuccess,
  type AssessmentResult,
} from "@/lib/domain/assessments/errors";
import {
  findAssessmentById,
  updateAssessmentSettings,
} from "@/lib/infrastructure/db/repositories/assessment-repository";
import { findTrainingById } from "@/lib/infrastructure/db/repositories/training-repository";
import { updateTrainingQuestionWeightsSchema } from "@/lib/validations/assessment-schemas";

import { assertAssessmentTrainerOrAdmin } from "./assert-access";

export type UpdateTrainingQuestionWeightsResult = {
  trainingId: string;
  updatedCount: number;
};

export async function updateTrainingQuestionWeightsUseCase(
  actor: SessionUser | null,
  input: unknown,
): Promise<AssessmentResult<UpdateTrainingQuestionWeightsResult>> {
  const forbidden = assertAssessmentTrainerOrAdmin(actor);
  if (forbidden) {
    return forbidden;
  }

  const parsed = updateTrainingQuestionWeightsSchema.safeParse(input);
  if (!parsed.success) {
    return assessmentFailure(
      AssessmentErrorCode.VALIDATION_ERROR,
      parsed.error.issues[0]?.message,
    );
  }

  const { trainingId, weights } = parsed.data;

  const training = await findTrainingById(trainingId);
  if (!training) {
    return assessmentFailure(AssessmentErrorCode.TRAINING_NOT_FOUND);
  }

  // assessmentId datang dari form, jadi tiap baris harus dipastikan memang milik
  // training ini — kalau tidak, id apa pun bisa dititipkan untuk menulis bobot
  // assessment milik training lain.
  const assessments = await Promise.all(
    weights.map((weight) => findAssessmentById(weight.assessmentId)),
  );

  for (const assessment of assessments) {
    if (!assessment) {
      return assessmentFailure(AssessmentErrorCode.ASSESSMENT_NOT_FOUND);
    }

    if (assessment.trainingId !== trainingId) {
      return assessmentFailure(AssessmentErrorCode.FORBIDDEN);
    }
  }

  // Semua baris divalidasi lebih dulu di atas, supaya satu baris yang gagal tidak
  // meninggalkan sebagian bobot tersimpan dan sebagian tidak.
  const updated = await Promise.all(
    weights.map((weight) =>
      updateAssessmentSettings(weight.assessmentId, {
        questionWeight: weight.questionWeight,
      }),
    ),
  );

  if (updated.some((row) => row === null)) {
    return assessmentFailure(AssessmentErrorCode.ASSESSMENT_NOT_FOUND);
  }

  return assessmentSuccess({ trainingId, updatedCount: updated.length });
}
