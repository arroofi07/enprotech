export const ProjectErrorCode = {
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  TRAINING_NOT_FOUND: "TRAINING_NOT_FOUND",
  NOT_ENROLLED: "NOT_ENROLLED",
  PROJECT_LOCKED: "PROJECT_LOCKED",
  PROJECT_NOT_FOUND: "PROJECT_NOT_FOUND",
  PROJECT_LIMIT_REACHED: "PROJECT_LIMIT_REACHED",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INVALID_FILE_TYPE: "INVALID_FILE_TYPE",
  FILE_TOO_LARGE: "FILE_TOO_LARGE",
  UPLOAD_FAILED: "UPLOAD_FAILED",
} as const;

export type ProjectErrorCode =
  (typeof ProjectErrorCode)[keyof typeof ProjectErrorCode];

const PROJECT_ERROR_MESSAGES: Record<ProjectErrorCode, string> = {
  [ProjectErrorCode.UNAUTHORIZED]: "Anda harus login terlebih dahulu.",
  [ProjectErrorCode.FORBIDDEN]: "Anda tidak memiliki akses untuk tindakan ini.",
  [ProjectErrorCode.TRAINING_NOT_FOUND]: "Training tidak ditemukan.",
  [ProjectErrorCode.NOT_ENROLLED]: "Anda belum terdaftar di training ini.",
  [ProjectErrorCode.PROJECT_LOCKED]:
    "Selesaikan seluruh modul dan lulus post-test sebelum mengunggah project.",
  [ProjectErrorCode.PROJECT_NOT_FOUND]: "Project tidak ditemukan.",
  [ProjectErrorCode.PROJECT_LIMIT_REACHED]:
    "Anda sudah mengunggah maksimal 4 project untuk training ini.",
  [ProjectErrorCode.VALIDATION_ERROR]: "Data yang dimasukkan tidak valid.",
  [ProjectErrorCode.INVALID_FILE_TYPE]: "Format file tidak didukung.",
  [ProjectErrorCode.FILE_TOO_LARGE]:
    "Ukuran file melebihi batas yang diizinkan.",
  [ProjectErrorCode.UPLOAD_FAILED]: "Gagal mengunggah file.",
};

export function getProjectErrorMessage(code: ProjectErrorCode): string {
  return PROJECT_ERROR_MESSAGES[code];
}

export type ProjectSuccess<T> = { success: true; data: T };
export type ProjectFailure = {
  success: false;
  error: ProjectErrorCode;
  message: string;
};
export type ProjectResult<T> = ProjectSuccess<T> | ProjectFailure;

export function projectSuccess<T>(data: T): ProjectSuccess<T> {
  return { success: true, data };
}

export function projectFailure(error: ProjectErrorCode): ProjectFailure {
  return {
    success: false,
    error,
    message: getProjectErrorMessage(error),
  };
}
