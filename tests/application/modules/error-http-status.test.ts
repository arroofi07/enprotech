import { describe, expect, it } from "vitest";

import { moduleErrorHttpStatus } from "@/lib/application/modules/error-http-status";
import { ModuleErrorCode } from "@/lib/domain/modules/errors";

describe("moduleErrorHttpStatus", () => {
  it("maps module errors to HTTP status codes", () => {
    expect(moduleErrorHttpStatus(ModuleErrorCode.UNAUTHORIZED)).toBe(401);
    expect(moduleErrorHttpStatus(ModuleErrorCode.FORBIDDEN)).toBe(403);
    expect(moduleErrorHttpStatus(ModuleErrorCode.NOT_ENROLLED)).toBe(403);
    expect(moduleErrorHttpStatus(ModuleErrorCode.MODULE_NOT_FOUND)).toBe(404);
    expect(moduleErrorHttpStatus(ModuleErrorCode.INVALID_FILE_TYPE)).toBe(400);
    expect(moduleErrorHttpStatus(ModuleErrorCode.FILE_TOO_LARGE)).toBe(400);
    expect(moduleErrorHttpStatus(ModuleErrorCode.UPLOAD_FAILED)).toBe(500);
  });
});
