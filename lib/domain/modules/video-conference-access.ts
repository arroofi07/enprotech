export type QuizScheduleState = "not_scheduled" | "locked" | "open";

export type VideoConferenceState =
  | "not_scheduled"
  | "scheduled"
  | "live"
  | "ended";

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
 * Full lifecycle state for a module's video conference session.
 *
 * - `not_scheduled`: no link or schedule configured.
 * - `scheduled`: link and schedule exist, but the start time has not arrived.
 * - `live`: the session is active and students can join.
 * - `ended`: the trainer/admin has ended the session.
 */
export function getVideoConferenceState(
  scheduledAt: Date | null | undefined,
  endedAt: Date | null | undefined,
  now: Date,
): VideoConferenceState {
  if (!scheduledAt) {
    return "not_scheduled";
  }

  if (endedAt && now.getTime() >= endedAt.getTime()) {
    return "ended";
  }

  if (now.getTime() >= scheduledAt.getTime()) {
    return "live";
  }

  return "scheduled";
}

/**
 * Whether the video conference link is joinable at `now`. Requires a schedule,
 * the scheduled start time to have passed, and the session not to be ended.
 */
export function isVideoConferenceStarted(
  scheduledAt: Date | null | undefined,
  now: Date,
  endedAt?: Date | null | undefined,
): boolean {
  return (
    getVideoConferenceState(scheduledAt, endedAt ?? null, now) === "live"
  );
}

export function getVideoConferenceStatusLabel(state: VideoConferenceState): string {
  switch (state) {
    case "not_scheduled":
      return "Belum dijadwalkan";
    case "scheduled":
      return "Terjadwal";
    case "live":
      return "Berlangsung";
    case "ended":
      return "Selesai";
  }
}
