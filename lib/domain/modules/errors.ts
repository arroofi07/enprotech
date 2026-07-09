export const ModuleErrorCode = {
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  TRAINING_NOT_FOUND: "TRAINING_NOT_FOUND",
  MODULE_NOT_FOUND: "MODULE_NOT_FOUND",
  CONTENT_NOT_FOUND: "CONTENT_NOT_FOUND",
  NOT_ENROLLED: "NOT_ENROLLED",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INVALID_FILE_TYPE: "INVALID_FILE_TYPE",
  FILE_TOO_LARGE: "FILE_TOO_LARGE",
  UPLOAD_FAILED: "UPLOAD_FAILED",
  PRETEST_REQUIRED: "PRETEST_REQUIRED",
} as const;

export type ModuleErrorCode =
  (typeof ModuleErrorCode)[keyof typeof ModuleErrorCode];

const MODULE_ERROR_MESSAGES: Record<ModuleErrorCode, string> = {
  [ModuleErrorCode.UNAUTHORIZED]: "Anda harus login terlebih dahulu.",
  [ModuleErrorCode.FORBIDDEN]: "Anda tidak memiliki akses untuk tindakan ini.",
  [ModuleErrorCode.TRAINING_NOT_FOUND]: "Training tidak ditemukan.",
  [ModuleErrorCode.MODULE_NOT_FOUND]: "Modul tidak ditemukan.",
  [ModuleErrorCode.CONTENT_NOT_FOUND]: "Konten modul tidak ditemukan.",
  [ModuleErrorCode.NOT_ENROLLED]:
    "Anda belum terdaftar di training ini.",
  [ModuleErrorCode.VALIDATION_ERROR]: "Data yang dimasukkan tidak valid.",
  [ModuleErrorCode.INVALID_FILE_TYPE]:
    "Format file tidak didukung.",
  [ModuleErrorCode.FILE_TOO_LARGE]: "Ukuran file melebihi batas yang diizinkan.",
  [ModuleErrorCode.UPLOAD_FAILED]: "Gagal mengunggah file.",
  [ModuleErrorCode.PRETEST_REQUIRED]:
    "Selesaikan pre-test terlebih dahulu sebelum mengakses modul.",
};

export function getModuleErrorMessage(code: ModuleErrorCode): string {
  return MODULE_ERROR_MESSAGES[code];
}

export type ModuleSuccess<T> = { success: true; data: T };
export type ModuleFailure = {
  success: false;
  error: ModuleErrorCode;
  message: string;
};
export type ModuleResult<T> = ModuleSuccess<T> | ModuleFailure;

export function moduleSuccess<T>(data: T): ModuleSuccess<T> {
  return { success: true, data };
}

export function moduleFailure(error: ModuleErrorCode): ModuleFailure {
  return {
    success: false,
    error,
    message: getModuleErrorMessage(error),
  };
}
