import type { CertificateErrorCode } from "@/lib/domain/certificates/errors";

export function certificateErrorHttpStatus(
  error: CertificateErrorCode,
): number {
  switch (error) {
    case "UNAUTHORIZED":
      return 401;
    case "FORBIDDEN":
    case "NOT_ELIGIBLE":
      return 403;
    case "VALIDATION_ERROR":
      return 400;
    case "CERTIFICATE_NOT_FOUND":
      return 404;
    default: {
      const _exhaustive: never = error;
      return _exhaustive;
    }
  }
}
