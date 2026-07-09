import { describe, expect, it } from "vitest";

import { verifyCertificate } from "@/lib/application/certificates/verify-certificate";

describe("verifyCertificate", () => {
  it("rejects invalid certificate number format", async () => {
    const result = await verifyCertificate({ certificateNumber: "abc" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("VALIDATION_ERROR");
    }
  });

  it("returns not found for unknown certificate number", async () => {
    const result = await verifyCertificate({
      certificateNumber: "CERT-NOT-FOUND-2026-9999",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("CERTIFICATE_NOT_FOUND");
    }
  });
});
