export const AuthErrorCode = {
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  PENDING_APPROVAL: "PENDING_APPROVAL",
  ACCOUNT_INACTIVE: "ACCOUNT_INACTIVE",
  EMAIL_EXISTS: "EMAIL_EXISTS",
  SESSION_EXPIRED: "SESSION_EXPIRED",
  VALIDATION_ERROR: "VALIDATION_ERROR",
} as const;

export type AuthErrorCode =
  (typeof AuthErrorCode)[keyof typeof AuthErrorCode];

const AUTH_ERROR_MESSAGES: Record<AuthErrorCode, string> = {
  [AuthErrorCode.INVALID_CREDENTIALS]: "Email atau password salah.",
  [AuthErrorCode.PENDING_APPROVAL]:
    "Akun Anda menunggu persetujuan Admin.",
  [AuthErrorCode.ACCOUNT_INACTIVE]: "Akun Anda tidak aktif.",
  [AuthErrorCode.EMAIL_EXISTS]: "Email sudah terdaftar.",
  [AuthErrorCode.SESSION_EXPIRED]:
    "Sesi Anda telah berakhir. Silakan login kembali.",
  [AuthErrorCode.VALIDATION_ERROR]: "Data yang dimasukkan tidak valid.",
};

export function getAuthErrorMessage(code: AuthErrorCode): string {
  return AUTH_ERROR_MESSAGES[code];
}

export type AuthSuccess<T> = { success: true; data: T };
export type AuthFailure = {
  success: false;
  error: AuthErrorCode;
  message: string;
};
export type AuthResult<T> = AuthSuccess<T> | AuthFailure;

export function authSuccess<T>(data: T): AuthSuccess<T> {
  return { success: true, data };
}

export function authFailure(error: AuthErrorCode): AuthFailure {
  return {
    success: false,
    error,
    message: getAuthErrorMessage(error),
  };
}
