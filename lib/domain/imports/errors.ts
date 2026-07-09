export const ImportErrorCode = {
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  FILE_ERROR: "FILE_ERROR",
  ASSESSMENT_NOT_FOUND: "ASSESSMENT_NOT_FOUND",
  TRAINING_NOT_FOUND: "TRAINING_NOT_FOUND",
  NO_VALID_ROWS: "NO_VALID_ROWS",
} as const;

export type ImportErrorCode =
  (typeof ImportErrorCode)[keyof typeof ImportErrorCode];

const IMPORT_ERROR_MESSAGES: Record<ImportErrorCode, string> = {
  [ImportErrorCode.UNAUTHORIZED]: "Anda harus login terlebih dahulu.",
  [ImportErrorCode.FORBIDDEN]:
    "Anda tidak memiliki akses untuk tindakan ini.",
  [ImportErrorCode.VALIDATION_ERROR]: "Data yang dimasukkan tidak valid.",
  [ImportErrorCode.FILE_ERROR]: "File Excel tidak valid atau tidak terbaca.",
  [ImportErrorCode.ASSESSMENT_NOT_FOUND]: "Assessment tidak ditemukan.",
  [ImportErrorCode.TRAINING_NOT_FOUND]: "Training tidak ditemukan.",
  [ImportErrorCode.NO_VALID_ROWS]: "Tidak ada baris valid untuk diimport.",
};

export function getImportErrorMessage(code: ImportErrorCode): string {
  return IMPORT_ERROR_MESSAGES[code];
}

export type ImportSuccess<T> = { success: true; data: T };
export type ImportFailure = {
  success: false;
  error: ImportErrorCode;
  message: string;
};
export type ImportResult<T> = ImportSuccess<T> | ImportFailure;

export function importSuccess<T>(data: T): ImportSuccess<T> {
  return { success: true, data };
}

export function importFailure(error: ImportErrorCode): ImportFailure {
  return {
    success: false,
    error,
    message: getImportErrorMessage(error),
  };
}
