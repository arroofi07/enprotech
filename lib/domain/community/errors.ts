export const CommunityErrorCode = {
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  TRAINING_NOT_FOUND: "TRAINING_NOT_FOUND",
  NOT_ENROLLED: "NOT_ENROLLED",
  MESSAGE_NOT_FOUND: "MESSAGE_NOT_FOUND",
  MEETING_NOT_FOUND: "MEETING_NOT_FOUND",
  VALIDATION_ERROR: "VALIDATION_ERROR",
} as const;

export type CommunityErrorCode =
  (typeof CommunityErrorCode)[keyof typeof CommunityErrorCode];

const COMMUNITY_ERROR_MESSAGES: Record<CommunityErrorCode, string> = {
  [CommunityErrorCode.UNAUTHORIZED]: "Anda harus login terlebih dahulu.",
  [CommunityErrorCode.FORBIDDEN]:
    "Anda tidak memiliki akses untuk tindakan ini.",
  [CommunityErrorCode.TRAINING_NOT_FOUND]: "Training tidak ditemukan.",
  [CommunityErrorCode.NOT_ENROLLED]:
    "Anda belum terdaftar di training ini.",
  [CommunityErrorCode.MESSAGE_NOT_FOUND]: "Pesan tidak ditemukan.",
  [CommunityErrorCode.MEETING_NOT_FOUND]: "Jadwal meeting tidak ditemukan.",
  [CommunityErrorCode.VALIDATION_ERROR]: "Data yang dimasukkan tidak valid.",
};

export function getCommunityErrorMessage(code: CommunityErrorCode): string {
  return COMMUNITY_ERROR_MESSAGES[code];
}

export type CommunitySuccess<T> = { success: true; data: T };
export type CommunityFailure = {
  success: false;
  error: CommunityErrorCode;
  message: string;
};
export type CommunityResult<T> = CommunitySuccess<T> | CommunityFailure;

export function communitySuccess<T>(data: T): CommunitySuccess<T> {
  return { success: true, data };
}

export function communityFailure(error: CommunityErrorCode): CommunityFailure {
  return {
    success: false,
    error,
    message: getCommunityErrorMessage(error),
  };
}

export function communityValidationFailure(message: string): CommunityFailure {
  return {
    success: false,
    error: CommunityErrorCode.VALIDATION_ERROR,
    message,
  };
}
