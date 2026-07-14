import type { SessionUser } from "@/lib/domain/auth/types";
import {
  FeedbackErrorCode,
  feedbackFailure,
  feedbackSuccess,
  type FeedbackResult,
} from "@/lib/domain/feedback/errors";
import type { TrainingFeedback } from "@/lib/db/schema/training-feedback";
import { issueCertificateIfEligible } from "@/lib/application/certificates/issue-certificate-if-eligible";
import { notifyFeedbackSubmitted } from "@/lib/application/notifications/notify-feedback-submitted";
import { isStudentEnrolled } from "@/lib/infrastructure/db/repositories/report-repository";
import { upsertFeedback } from "@/lib/infrastructure/db/repositories/feedback-repository";
import { submitFeedbackSchema } from "@/lib/validations/feedback-schemas";

import { assertFeedbackStudent } from "./assert-access";

export async function submitFeedback(
  actor: SessionUser | null,
  input: unknown,
): Promise<FeedbackResult<TrainingFeedback>> {
  const forbidden = assertFeedbackStudent(actor);
  if (forbidden) {
    return forbidden;
  }

  const parsed = submitFeedbackSchema.safeParse(input);
  if (!parsed.success) {
    return feedbackFailure(FeedbackErrorCode.VALIDATION_ERROR);
  }

  const enrolled = await isStudentEnrolled(actor!.id, parsed.data.trainingId);
  if (!enrolled) {
    return feedbackFailure(FeedbackErrorCode.NOT_ENROLLED);
  }

  const feedback = await upsertFeedback({
    studentId: actor!.id,
    trainingId: parsed.data.trainingId,
    trainingRating: parsed.data.trainingRating,
    trainerRating: parsed.data.trainerRating,
    comment: parsed.data.comment,
  });

  await notifyFeedbackSubmitted({
    studentId: actor!.id,
    trainingId: parsed.data.trainingId,
  });

  await issueCertificateIfEligible({
    studentId: actor!.id,
    trainingId: parsed.data.trainingId,
  });

  return feedbackSuccess(feedback);
}
