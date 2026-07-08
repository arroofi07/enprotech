export const UserErrorCode = {
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  USER_NOT_FOUND: "USER_NOT_FOUND",
  INVALID_STATUS_TRANSITION: "INVALID_STATUS_TRANSITION",
  CANNOT_MODIFY_SELF: "CANNOT_MODIFY_SELF",
  LAST_ADMIN_PROTECTED: "LAST_ADMIN_PROTECTED",
  VALIDATION_ERROR: "VALIDATION_ERROR",
} as const;

export type UserErrorCode =
  (typeof UserErrorCode)[keyof typeof UserErrorCode];

const USER_ERROR_MESSAGES: Record<UserErrorCode, string> = {
  [UserErrorCode.UNAUTHORIZED]: "Anda harus login terlebih dahulu.",
  [UserErrorCode.FORBIDDEN]: "Anda tidak memiliki akses untuk tindakan ini.",
  [UserErrorCode.USER_NOT_FOUND]: "Pengguna tidak ditemukan.",
  [UserErrorCode.INVALID_STATUS_TRANSITION]:
    "Perubahan status tidak diizinkan.",
  [UserErrorCode.CANNOT_MODIFY_SELF]:
    "Anda tidak dapat mengubah akun Anda sendiri.",
  [UserErrorCode.LAST_ADMIN_PROTECTED]:
    "Tidak dapat mengubah admin aktif terakhir.",
  [UserErrorCode.VALIDATION_ERROR]: "Data yang dimasukkan tidak valid.",
};

export function getUserErrorMessage(code: UserErrorCode): string {
  return USER_ERROR_MESSAGES[code];
}

export type UserSuccess<T> = { success: true; data: T };
export type UserFailure = {
  success: false;
  error: UserErrorCode;
  message: string;
};
export type UserResult<T> = UserSuccess<T> | UserFailure;

export function userSuccess<T>(data: T): UserSuccess<T> {
  return { success: true, data };
}

export function userFailure(error: UserErrorCode): UserFailure {
  return {
    success: false,
    error,
    message: getUserErrorMessage(error),
  };
}
