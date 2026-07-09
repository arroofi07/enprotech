import { describe, expect, it } from "vitest";

import {
  buildCertificateNumber,
  buildTrainingCode,
} from "@/lib/domain/certificates/build-certificate-number";

describe("buildTrainingCode", () => {
  it("normalizes training title into a short code", () => {
    expect(buildTrainingCode("Leadership 101")).toBe("LEADERSHIP-1");
    expect(buildTrainingCode("!!!")).toBe("TRAINING");
  });
});

describe("buildCertificateNumber", () => {
  it("builds certificate number with expected format", () => {
    expect(
      buildCertificateNumber({
        trainingTitle: "Leadership 101",
        year: 2026,
        sequence: 7,
      }),
    ).toBe("CERT-LEADERSHIP-1-2026-0007");
  });
});
