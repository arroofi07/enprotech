export type CanRetryInput = {
  bestScore: number;
  passingGrade: number;
  blockRetryAfterPassing?: boolean;
};

export function canRetry(input: CanRetryInput): boolean {
  const blockRetryAfterPassing = input.blockRetryAfterPassing ?? true;

  if (blockRetryAfterPassing && input.bestScore >= input.passingGrade) {
    return false;
  }

  return true;
}
