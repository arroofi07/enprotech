export type TimedOutAttempt = {
  startedAt: Date;
};

export type TimedOutAssessment = {
  timeLimit: number | null;
};

const CLOCK_SKEW_GRACE_MS = 5_000;

export function isAttemptTimedOut(
  attempt: TimedOutAttempt,
  assessment: TimedOutAssessment,
  now: Date = new Date(),
): boolean {
  if (assessment.timeLimit === null || assessment.timeLimit <= 0) {
    return false;
  }

  const deadlineMs =
    attempt.startedAt.getTime() + assessment.timeLimit * 60_000;

  return now.getTime() + CLOCK_SKEW_GRACE_MS >= deadlineMs;
}
