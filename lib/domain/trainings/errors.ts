export const TrainingErrorCode = {
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  TRAINING_NOT_FOUND: "TRAINING_NOT_FOUND",
  ENROLLMENT_NOT_FOUND: "ENROLLMENT_NOT_FOUND",
  STUDENT_NOT_FOUND: "STUDENT_NOT_FOUND",
  INVALID_STATUS_TRANSITION: "INVALID_STATUS_TRANSITION",
  ALREADY_ENROLLED: "ALREADY_ENROLLED",
  MODULES_NOT_READY: "MODULES_NOT_READY",
  TRAINING_NOT_READY: "TRAINING_NOT_READY",
  PRETEST_ALREADY_ACTIVE: "PRETEST_ALREADY_ACTIVE",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  PRETEST_NO_QUESTIONS: "PRETEST_NO_QUESTIONS",
} as const;

export type TrainingErrorCode =
  (typeof TrainingErrorCode)[keyof typeof TrainingErrorCode];

const TRAINING_ERROR_MESSAGES: Record<TrainingErrorCode, string> = {
  [TrainingErrorCode.UNAUTHORIZED]: "Anda harus login terlebih dahulu.",
  [TrainingErrorCode.FORBIDDEN]:
    "Anda tidak memiliki akses untuk tindakan ini.",
  [TrainingErrorCode.TRAINING_NOT_FOUND]: "Training tidak ditemukan.",
  [TrainingErrorCode.ENROLLMENT_NOT_FOUND]: "Enrollment tidak ditemukan.",
  [TrainingErrorCode.STUDENT_NOT_FOUND]: "Peserta tidak ditemukan.",
  [TrainingErrorCode.INVALID_STATUS_TRANSITION]:
    "Perubahan status training tidak diizinkan.",
  [TrainingErrorCode.ALREADY_ENROLLED]:
    "Peserta sudah terdaftar di training ini.",
  [TrainingErrorCode.MODULES_NOT_READY]:
    "Semua modul harus memiliki materi sebelum pre-test diaktifkan.",
  [TrainingErrorCode.TRAINING_NOT_READY]:
    "Lengkapi materi, soal quiz dan latihan di setiap modul, serta soal pre-test dan post-test sebelum training dipublikasikan.",
  [TrainingErrorCode.PRETEST_ALREADY_ACTIVE]: "Pre-test sudah aktif.",
  [TrainingErrorCode.VALIDATION_ERROR]: "Data yang dimasukkan tidak valid.",
  [TrainingErrorCode.PRETEST_NO_QUESTIONS]:
    "Tambahkan minimal satu soal pre-test sebelum aktivasi.",
};

export function getTrainingErrorMessage(code: TrainingErrorCode): string {
  return TRAINING_ERROR_MESSAGES[code];
}

export type TrainingSuccess<T> = { success: true; data: T };
export type TrainingFailure = {
  success: false;
  error: TrainingErrorCode;
  message: string;
};
export type TrainingResult<T> = TrainingSuccess<T> | TrainingFailure;

export function trainingSuccess<T>(data: T): TrainingSuccess<T> {
  return { success: true, data };
}

export function trainingFailure(error: TrainingErrorCode): TrainingFailure {
  return {
    success: false,
    error,
    message: getTrainingErrorMessage(error),
  };
}
