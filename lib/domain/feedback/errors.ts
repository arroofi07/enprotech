export const FeedbackErrorCode = {
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_ENROLLED: "NOT_ENROLLED",
  FEEDBACK_NOT_FOUND: "FEEDBACK_NOT_FOUND",
  VALIDATION_ERROR: "VALIDATION_ERROR",
} as const;

export type FeedbackErrorCode =
  (typeof FeedbackErrorCode)[keyof typeof FeedbackErrorCode];

const FEEDBACK_ERROR_MESSAGES: Record<FeedbackErrorCode, string> = {
  [FeedbackErrorCode.UNAUTHORIZED]: "Anda harus login terlebih dahulu.",
  [FeedbackErrorCode.FORBIDDEN]: "Anda tidak memiliki akses untuk tindakan ini.",
  [FeedbackErrorCode.NOT_ENROLLED]: "Anda belum terdaftar di training ini.",
  [FeedbackErrorCode.FEEDBACK_NOT_FOUND]: "Feedback tidak ditemukan.",
  [FeedbackErrorCode.VALIDATION_ERROR]: "Data yang dimasukkan tidak valid.",
};

export function getFeedbackErrorMessage(code: FeedbackErrorCode): string {
  return FEEDBACK_ERROR_MESSAGES[code];
}

export type FeedbackSuccess<T> = { success: true; data: T };
export type FeedbackFailure = {
  success: false;
  error: FeedbackErrorCode;
  message: string;
};
export type FeedbackResult<T> = FeedbackSuccess<T> | FeedbackFailure;

export function feedbackSuccess<T>(data: T): FeedbackSuccess<T> {
  return { success: true, data };
}

export function feedbackFailure(error: FeedbackErrorCode): FeedbackFailure {
  return {
    success: false,
    error,
    message: getFeedbackErrorMessage(error),
  };
}
