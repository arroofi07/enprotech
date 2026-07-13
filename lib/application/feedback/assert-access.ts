import type { SessionUser } from "@/lib/domain/auth/types";
import {
  FeedbackErrorCode,
  feedbackFailure,
  type FeedbackFailure,
} from "@/lib/domain/feedback/errors";

export function assertFeedbackStudent(
  actor: SessionUser | null,
): FeedbackFailure | null {
  if (!actor) {
    return feedbackFailure(FeedbackErrorCode.UNAUTHORIZED);
  }

  if (actor.role !== "student") {
    return feedbackFailure(FeedbackErrorCode.FORBIDDEN);
  }

  return null;
}

export function assertFeedbackTrainerOrAdmin(
  actor: SessionUser | null,
): FeedbackFailure | null {
  if (!actor) {
    return feedbackFailure(FeedbackErrorCode.UNAUTHORIZED);
  }

  if (actor.role !== "admin" && actor.role !== "trainer") {
    return feedbackFailure(FeedbackErrorCode.FORBIDDEN);
  }

  return null;
}
