export function buildTrainingCode(trainingTitle: string): string {
  const normalized = trainingTitle
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 12);

  return normalized || "TRAINING";
}

export function buildCertificateNumber(input: {
  trainingTitle: string;
  year: number;
  sequence: number;
}): string {
  const trainingCode = buildTrainingCode(input.trainingTitle);
  const sequence = String(input.sequence).padStart(4, "0");

  return `CERT-${trainingCode}-${input.year}-${sequence}`;
}
