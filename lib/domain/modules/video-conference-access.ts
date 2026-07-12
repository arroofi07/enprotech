export type QuizScheduleState = "not_scheduled" | "locked" | "open";

/**
 * A module's quiz (and its video conference link) only become available once the
 * scheduled video conference time has been reached. Access opens from the
 * scheduled time onward, with no end boundary.
 *
 * - `not_scheduled`: the trainer has not set a schedule yet → quiz stays locked.
 * - `locked`: a schedule exists but the current time is still before it.
 * - `open`: the scheduled time has arrived (now >= scheduledAt).
 */
export function getQuizScheduleState(
  scheduledAt: Date | null | undefined,
  now: Date,
): QuizScheduleState {
  if (!scheduledAt) {
    return "not_scheduled";
  }

  return now.getTime() >= scheduledAt.getTime() ? "open" : "locked";
}

/**
 * Whether the video conference (and the schedule-gated quiz) is joinable at
 * `now`. Requires a schedule to be set and the scheduled time to have passed.
 */
export function isVideoConferenceStarted(
  scheduledAt: Date | null | undefined,
  now: Date,
): boolean {
  return getQuizScheduleState(scheduledAt, now) === "open";
}
