import { randomUUID } from "node:crypto";

export function buildTrainingCode(trainingTitle: string): string {
  const normalized = trainingTitle
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 12);

  return normalized || "TRAINING";
}

/** Short, collision-resistant token appended to guarantee global uniqueness. */
function buildUniqueSuffix(): string {
  return randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();
}

export function buildCertificateNumber(input: {
  trainingTitle: string;
  year: number;
  sequence: number;
}): string {
  const trainingCode = buildTrainingCode(input.trainingTitle);
  const sequence = String(input.sequence).padStart(4, "0");
  const unique = buildUniqueSuffix();

  return `CERT-${trainingCode}-${input.year}-${sequence}-${unique}`;
}
