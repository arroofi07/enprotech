import type { ProjectFileKind } from "./types";

export const PROJECT_IMAGE_MAX_BYTES = 2 * 1024 * 1024;
export const PROJECT_PDF_MAX_BYTES = 10 * 1024 * 1024;

const IMAGE_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const PDF_MIME_TYPES = new Set(["application/pdf"]);

export type FileValidationError = "INVALID_FILE_TYPE" | "FILE_TOO_LARGE";

export type FileValidationResult =
  | { valid: true }
  | { valid: false; error: FileValidationError };

export function getProjectAllowedMimeTypes(
  kind: ProjectFileKind,
): Set<string> {
  return kind === "image" ? IMAGE_MIME_TYPES : PDF_MIME_TYPES;
}

export function getProjectMaxFileBytes(kind: ProjectFileKind): number {
  return kind === "image" ? PROJECT_IMAGE_MAX_BYTES : PROJECT_PDF_MAX_BYTES;
}

export function validateProjectFile(
  kind: ProjectFileKind,
  file: { type: string; size: number; name?: string },
): FileValidationResult {
  const allowedTypes = getProjectAllowedMimeTypes(kind);
  const maxBytes = getProjectMaxFileBytes(kind);

  const mimeValid =
    allowedTypes.has(file.type) ||
    (kind === "pdf" &&
      file.name !== undefined &&
      file.name.toLowerCase().endsWith(".pdf"));

  if (!mimeValid) {
    return { valid: false, error: "INVALID_FILE_TYPE" };
  }

  if (file.size > maxBytes) {
    return { valid: false, error: "FILE_TOO_LARGE" };
  }

  return { valid: true };
}

export function formatProjectMaxFileSize(kind: ProjectFileKind): string {
  const bytes = getProjectMaxFileBytes(kind);
  const mb = bytes / (1024 * 1024);
  return `${mb}MB`;
}
