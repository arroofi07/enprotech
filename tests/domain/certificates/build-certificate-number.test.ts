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
  it("builds certificate number with expected prefix and unique suffix", () => {
    const number = buildCertificateNumber({
      trainingTitle: "Leadership 101",
      year: 2026,
      sequence: 7,
    });

    expect(number).toMatch(/^CERT-LEADERSHIP-1-2026-0007-[0-9A-F]{8}$/);
  });

  it("produces a distinct number on every call", () => {
    const input = { trainingTitle: "Leadership 101", year: 2026, sequence: 7 };
    const numbers = new Set(
      Array.from({ length: 50 }, () => buildCertificateNumber(input)),
    );

    expect(numbers.size).toBe(50);
  });
});
