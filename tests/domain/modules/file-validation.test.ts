import { describe, expect, it } from "vitest";

import {
  DOCUMENT_MAX_BYTES,
  THUMBNAIL_MAX_BYTES,
  validateUploadFile,
} from "@/lib/domain/modules/file-validation";

describe("validateUploadFile", () => {
  it("accepts valid thumbnail images under 1MB", () => {
    const result = validateUploadFile("thumbnail", {
      type: "image/png",
      size: THUMBNAIL_MAX_BYTES,
    });

    expect(result).toEqual({ valid: true });
  });

  it("rejects thumbnail over 1MB", () => {
    const result = validateUploadFile("thumbnail", {
      type: "image/jpeg",
      size: THUMBNAIL_MAX_BYTES + 1,
    });

    expect(result).toEqual({ valid: false, error: "FILE_TOO_LARGE" });
  });

  it("rejects invalid thumbnail mime type", () => {
    const result = validateUploadFile("thumbnail", {
      type: "application/pdf",
      size: 1024,
    });

    expect(result).toEqual({ valid: false, error: "INVALID_FILE_TYPE" });
  });

  it("accepts valid PDF documents at the max size", () => {
    const result = validateUploadFile("document", {
      type: "application/pdf",
      size: DOCUMENT_MAX_BYTES,
      name: "materi.pdf",
    });

    expect(result).toEqual({ valid: true });
  });

  it("accepts office documents by extension when mime is generic", () => {
    const result = validateUploadFile("document", {
      type: "application/octet-stream",
      size: 512_000,
      name: "materi.docx",
    });

    expect(result).toEqual({ valid: true });
  });

  it("rejects documents over the max size", () => {
    const result = validateUploadFile("document", {
      type: "application/pdf",
      size: DOCUMENT_MAX_BYTES + 1,
      name: "materi.pdf",
    });

    expect(result).toEqual({ valid: false, error: "FILE_TOO_LARGE" });
  });

  it("rejects unsupported document types", () => {
    const result = validateUploadFile("document", {
      type: "image/png",
      size: 1024,
      name: "materi.png",
    });

    expect(result).toEqual({ valid: false, error: "INVALID_FILE_TYPE" });
  });
});
