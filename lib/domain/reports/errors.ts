export const ReportErrorCode = {
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  STUDENT_NOT_FOUND: "STUDENT_NOT_FOUND",
  TRAINING_NOT_FOUND: "TRAINING_NOT_FOUND",
  ENROLLMENT_NOT_FOUND: "ENROLLMENT_NOT_FOUND",
} as const;

export type ReportErrorCode =
  (typeof ReportErrorCode)[keyof typeof ReportErrorCode];

const REPORT_ERROR_MESSAGES: Record<ReportErrorCode, string> = {
  [ReportErrorCode.UNAUTHORIZED]: "Anda harus login terlebih dahulu.",
  [ReportErrorCode.FORBIDDEN]:
    "Anda tidak memiliki akses untuk tindakan ini.",
  [ReportErrorCode.VALIDATION_ERROR]: "Data yang dimasukkan tidak valid.",
  [ReportErrorCode.STUDENT_NOT_FOUND]: "Student tidak ditemukan.",
  [ReportErrorCode.TRAINING_NOT_FOUND]: "Training tidak ditemukan.",
  [ReportErrorCode.ENROLLMENT_NOT_FOUND]: "Enrollment tidak ditemukan.",
};

export function getReportErrorMessage(code: ReportErrorCode): string {
  return REPORT_ERROR_MESSAGES[code];
}

export type ReportSuccess<T> = { success: true; data: T };
export type ReportFailure = {
  success: false;
  error: ReportErrorCode;
  message: string;
};
export type ReportResult<T> = ReportSuccess<T> | ReportFailure;

export function reportSuccess<T>(data: T): ReportSuccess<T> {
  return { success: true, data };
}

export function reportFailure(error: ReportErrorCode): ReportFailure {
  return {
    success: false,
    error,
    message: getReportErrorMessage(error),
  };
}
