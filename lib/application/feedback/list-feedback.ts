import type { SessionUser } from "@/lib/domain/auth/types";
import {
  FeedbackErrorCode,
  feedbackFailure,
  feedbackSuccess,
  type FeedbackResult,
} from "@/lib/domain/feedback/errors";
import {
  getFeedbackStats as getFeedbackStatsFromRepo,
  listFeedback as listFeedbackInRepo,
  type FeedbackListItem,
  type FeedbackStats,
} from "@/lib/infrastructure/db/repositories/feedback-repository";
import { listFeedbackSchema } from "@/lib/validations/feedback-schemas";
import { buildPaginatedResult } from "@/lib/validations/pagination-schemas";

import { assertFeedbackTrainerOrAdmin } from "./assert-access";

export type ListFeedbackResult = {
  items: FeedbackListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export async function listFeedback(
  actor: SessionUser | null,
  input: unknown = {},
): Promise<FeedbackResult<ListFeedbackResult>> {
  const forbidden = assertFeedbackTrainerOrAdmin(actor);
  if (forbidden) {
    return forbidden;
  }

  const parsed = listFeedbackSchema.safeParse(input);
  if (!parsed.success) {
    return feedbackFailure(FeedbackErrorCode.VALIDATION_ERROR);
  }

  const { page, pageSize, search, trainingId } = parsed.data;
  const result = await listFeedbackInRepo({ page, pageSize, search, trainingId });

  return feedbackSuccess(
    buildPaginatedResult(result.items, result.total, page, pageSize),
  );
}

export async function getFeedbackStats(
  actor: SessionUser | null,
  trainingId?: string,
): Promise<FeedbackResult<FeedbackStats>> {
  const forbidden = assertFeedbackTrainerOrAdmin(actor);
  if (forbidden) {
    return forbidden;
  }

  const stats = await getFeedbackStatsFromRepo(trainingId);
  return feedbackSuccess(stats);
}
