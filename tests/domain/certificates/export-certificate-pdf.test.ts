import { describe, expect, it } from "vitest";

import { buildCertificatePdfBuffer } from "@/lib/domain/certificates/export-certificate-pdf";

describe("buildCertificatePdfBuffer", () => {
  it("creates a non-empty PDF buffer", () => {
    const buffer = buildCertificatePdfBuffer({
      certificateNumber: "CERT-LEADERSHIP-1-2026-0001",
      studentName: "Budi Santoso",
      trainingTitle: "Leadership 101",
      issuedAt: "2026-07-09T10:00:00.000Z",
      preTestScore: 80,
      postTestScore: 90,
      finalGrade: 85,
    });

    expect(buffer.byteLength).toBeGreaterThan(1000);
  });
});
