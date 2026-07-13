import type { SessionUser } from "@/lib/domain/auth/types";
import {
  FeedbackErrorCode,
  feedbackFailure,
  feedbackSuccess,
  type FeedbackResult,
} from "@/lib/domain/feedback/errors";
import type { TrainingFeedback } from "@/lib/db/schema/training-feedback";
import {
  findFeedbackByStudentAndTraining,
  listFeedbackByStudent,
} from "@/lib/infrastructure/db/repositories/feedback-repository";

import { assertFeedbackStudent } from "./assert-access";

export async function getStudentFeedback(
  actor: SessionUser | null,
  trainingId: string,
): Promise<FeedbackResult<TrainingFeedback | null>> {
  const forbidden = assertFeedbackStudent(actor);
  if (forbidden) {
    return forbidden;
  }

  if (!trainingId) {
    return feedbackFailure(FeedbackErrorCode.VALIDATION_ERROR);
  }

  const feedback = await findFeedbackByStudentAndTraining(
    actor!.id,
    trainingId,
  );
  return feedbackSuccess(feedback);
}

export async function listStudentFeedback(
  actor: SessionUser | null,
): Promise<FeedbackResult<TrainingFeedback[]>> {
  const forbidden = assertFeedbackStudent(actor);
  if (forbidden) {
    return forbidden;
  }

  const feedback = await listFeedbackByStudent(actor!.id);
  return feedbackSuccess(feedback);
}
