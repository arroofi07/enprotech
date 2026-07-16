export const AssessmentErrorCode = {
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  MODULE_NOT_FOUND: "MODULE_NOT_FOUND",
  ASSESSMENT_NOT_FOUND: "ASSESSMENT_NOT_FOUND",
  QUESTION_NOT_FOUND: "QUESTION_NOT_FOUND",
  ATTEMPT_NOT_FOUND: "ATTEMPT_NOT_FOUND",
  NOT_ENROLLED: "NOT_ENROLLED",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  NO_QUESTIONS: "NO_QUESTIONS",
  INCOMPLETE_ANSWERS: "INCOMPLETE_ANSWERS",
  ALREADY_PASSED: "ALREADY_PASSED",
  ATTEMPT_ALREADY_SUBMITTED: "ATTEMPT_ALREADY_SUBMITTED",
  IMPORT_ERROR: "IMPORT_ERROR",
  PRETEST_NOT_ACTIVE: "PRETEST_NOT_ACTIVE",
  PRETEST_REQUIRED: "PRETEST_REQUIRED",
  POSTTEST_LOCKED: "POSTTEST_LOCKED",
  MODULE_LOCKED: "MODULE_LOCKED",
  QUIZ_NOT_SCHEDULED: "QUIZ_NOT_SCHEDULED",
  QUIZ_NOT_STARTED: "QUIZ_NOT_STARTED",
  LATIHAN_LOCKED: "LATIHAN_LOCKED",
  TRAINING_NOT_FOUND: "TRAINING_NOT_FOUND",
} as const;

export type AssessmentErrorCode =
  (typeof AssessmentErrorCode)[keyof typeof AssessmentErrorCode];

const ASSESSMENT_ERROR_MESSAGES: Record<AssessmentErrorCode, string> = {
  [AssessmentErrorCode.UNAUTHORIZED]: "Anda harus login terlebih dahulu.",
  [AssessmentErrorCode.FORBIDDEN]: "Anda tidak memiliki akses untuk tindakan ini.",
  [AssessmentErrorCode.MODULE_NOT_FOUND]: "Modul tidak ditemukan.",
  [AssessmentErrorCode.ASSESSMENT_NOT_FOUND]: "Assessment tidak ditemukan.",
  [AssessmentErrorCode.QUESTION_NOT_FOUND]: "Soal tidak ditemukan.",
  [AssessmentErrorCode.ATTEMPT_NOT_FOUND]: "Attempt tidak ditemukan.",
  [AssessmentErrorCode.NOT_ENROLLED]:
    "Anda belum terdaftar di training ini.",
  [AssessmentErrorCode.VALIDATION_ERROR]: "Data yang dimasukkan tidak valid.",
  [AssessmentErrorCode.NO_QUESTIONS]:
    "Belum ada soal. Trainer harus menambahkan soal terlebih dahulu.",
  [AssessmentErrorCode.INCOMPLETE_ANSWERS]:
    "Semua soal harus dijawab sebelum jawaban dapat disubmit.",
  [AssessmentErrorCode.ALREADY_PASSED]:
    "Anda sudah mencapai passing grade. Tidak dapat mencoba lagi.",
  [AssessmentErrorCode.ATTEMPT_ALREADY_SUBMITTED]:
    "Attempt ini sudah disubmit.",
  [AssessmentErrorCode.IMPORT_ERROR]:
    "Gagal mengimpor soal dari Excel. Periksa format file.",
  [AssessmentErrorCode.PRETEST_NOT_ACTIVE]:
    "Pre-test belum diaktifkan oleh trainer.",
  [AssessmentErrorCode.PRETEST_REQUIRED]:
    "Kerjakan pre-test terlebih dahulu sebelum mengakses modul.",
  [AssessmentErrorCode.POSTTEST_LOCKED]:
    "Selesaikan semua modul terlebih dahulu sebelum mengerjakan post-test.",
  [AssessmentErrorCode.MODULE_LOCKED]:
    "Selesaikan modul sebelumnya terlebih dahulu.",
  [AssessmentErrorCode.QUIZ_NOT_SCHEDULED]:
    "Quiz belum dapat diakses. Trainer belum menetapkan jadwal video conference untuk modul ini.",
  [AssessmentErrorCode.QUIZ_NOT_STARTED]:
    "Quiz baru dapat diakses saat jadwal video conference dimulai.",
  [AssessmentErrorCode.LATIHAN_LOCKED]:
    "Selesaikan quiz modul ini terlebih dahulu sebelum mengerjakan latihan.",
  [AssessmentErrorCode.TRAINING_NOT_FOUND]: "Training tidak ditemukan.",
};

export function getAssessmentErrorMessage(code: AssessmentErrorCode): string {
  return ASSESSMENT_ERROR_MESSAGES[code];
}

export type AssessmentSuccess<T> = { success: true; data: T };
export type AssessmentFailure = {
  success: false;
  error: AssessmentErrorCode;
  message: string;
};
export type AssessmentResult<T> = AssessmentSuccess<T> | AssessmentFailure;

export function assessmentSuccess<T>(data: T): AssessmentSuccess<T> {
  return { success: true, data };
}

export function assessmentFailure(
  error: AssessmentErrorCode,
  message?: string,
): AssessmentFailure {
  return {
    success: false,
    error,
    message: message ?? getAssessmentErrorMessage(error),
  };
}
