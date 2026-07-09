import type { UploadPurpose } from "./types";

export const THUMBNAIL_MAX_BYTES = 2 * 1024 * 1024;
export const DOCUMENT_MAX_BYTES = 1 * 1024 * 1024;

const THUMBNAIL_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const DOCUMENT_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);

const DOCUMENT_EXTENSIONS = new Set([
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
]);

export type FileValidationError = "INVALID_FILE_TYPE" | "FILE_TOO_LARGE";

export type FileValidationResult =
  | { valid: true }
  | { valid: false; error: FileValidationError };

export function getAllowedMimeTypes(purpose: UploadPurpose): Set<string> {
  return purpose === "thumbnail" ? THUMBNAIL_MIME_TYPES : DOCUMENT_MIME_TYPES;
}

export function getMaxFileBytes(purpose: UploadPurpose): number {
  return purpose === "thumbnail" ? THUMBNAIL_MAX_BYTES : DOCUMENT_MAX_BYTES;
}

export function validateUploadFile(
  purpose: UploadPurpose,
  file: { type: string; size: number; name?: string },
): FileValidationResult {
  const allowedTypes = getAllowedMimeTypes(purpose);
  const maxBytes = getMaxFileBytes(purpose);

  const mimeValid =
    allowedTypes.has(file.type) ||
    (purpose === "document" &&
      file.name !== undefined &&
      hasAllowedDocumentExtension(file.name));

  if (!mimeValid) {
    return { valid: false, error: "INVALID_FILE_TYPE" };
  }

  if (file.size > maxBytes) {
    return { valid: false, error: "FILE_TOO_LARGE" };
  }

  return { valid: true };
}

function hasAllowedDocumentExtension(filename: string): boolean {
  const lower = filename.toLowerCase();
  return [...DOCUMENT_EXTENSIONS].some((ext) => lower.endsWith(ext));
}

export function formatMaxFileSize(purpose: UploadPurpose): string {
  const bytes = getMaxFileBytes(purpose);
  const mb = bytes / (1024 * 1024);
  return `${mb}MB`;
}
