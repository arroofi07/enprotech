export type CanRetryInput = {
  submittedAttemptCount: number;
  maxRetry: number | null;
  bestScore: number;
  passingGrade: number;
  blockRetryAfterPassing?: boolean;
};

export function canRetry(input: CanRetryInput): boolean {
  const blockRetryAfterPassing = input.blockRetryAfterPassing ?? true;

  if (
    input.maxRetry !== null &&
    input.submittedAttemptCount >= input.maxRetry
  ) {
    return false;
  }

  if (blockRetryAfterPassing && input.bestScore >= input.passingGrade) {
    return false;
  }

  return true;
}
