export const NotificationErrorCode = {
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  NOTIFICATION_NOT_FOUND: "NOTIFICATION_NOT_FOUND",
} as const;

export type NotificationErrorCode =
  (typeof NotificationErrorCode)[keyof typeof NotificationErrorCode];

const NOTIFICATION_ERROR_MESSAGES: Record<NotificationErrorCode, string> = {
  [NotificationErrorCode.UNAUTHORIZED]: "Anda harus login terlebih dahulu.",
  [NotificationErrorCode.FORBIDDEN]:
    "Anda tidak memiliki akses untuk tindakan ini.",
  [NotificationErrorCode.VALIDATION_ERROR]: "Data yang dimasukkan tidak valid.",
  [NotificationErrorCode.NOTIFICATION_NOT_FOUND]: "Notifikasi tidak ditemukan.",
};

export function getNotificationErrorMessage(
  code: NotificationErrorCode,
): string {
  return NOTIFICATION_ERROR_MESSAGES[code];
}

export type NotificationSuccess<T> = { success: true; data: T };
export type NotificationFailure = {
  success: false;
  error: NotificationErrorCode;
  message: string;
};
export type NotificationResult<T> =
  | NotificationSuccess<T>
  | NotificationFailure;

export function notificationSuccess<T>(data: T): NotificationSuccess<T> {
  return { success: true, data };
}

export function notificationFailure(
  error: NotificationErrorCode,
): NotificationFailure {
  return {
    success: false,
    error,
    message: getNotificationErrorMessage(error),
  };
}
