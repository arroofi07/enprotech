export const CertificateErrorCode = {
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  CERTIFICATE_NOT_FOUND: "CERTIFICATE_NOT_FOUND",
  NOT_ELIGIBLE: "NOT_ELIGIBLE",
} as const;

export type CertificateErrorCode =
  (typeof CertificateErrorCode)[keyof typeof CertificateErrorCode];

const CERTIFICATE_ERROR_MESSAGES: Record<CertificateErrorCode, string> = {
  [CertificateErrorCode.UNAUTHORIZED]: "Anda harus login terlebih dahulu.",
  [CertificateErrorCode.FORBIDDEN]:
    "Anda tidak memiliki akses untuk tindakan ini.",
  [CertificateErrorCode.VALIDATION_ERROR]: "Data yang dimasukkan tidak valid.",
  [CertificateErrorCode.CERTIFICATE_NOT_FOUND]: "Sertifikat tidak ditemukan.",
  [CertificateErrorCode.NOT_ELIGIBLE]:
    "Anda belum memenuhi syarat untuk mendapatkan sertifikat.",
};

export function getCertificateErrorMessage(
  code: CertificateErrorCode,
): string {
  return CERTIFICATE_ERROR_MESSAGES[code];
}

export type CertificateSuccess<T> = { success: true; data: T };
export type CertificateFailure = {
  success: false;
  error: CertificateErrorCode;
  message: string;
};
export type CertificateResult<T> =
  | CertificateSuccess<T>
  | CertificateFailure;

export function certificateSuccess<T>(data: T): CertificateSuccess<T> {
  return { success: true, data };
}

export function certificateFailure(
  error: CertificateErrorCode,
): CertificateFailure {
  return {
    success: false,
    error,
    message: getCertificateErrorMessage(error),
  };
}
