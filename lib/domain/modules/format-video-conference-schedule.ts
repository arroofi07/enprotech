export const INDONESIA_TIME_ZONE = "Asia/Jakarta";

const DATETIME_LOCAL_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/;

/**
 * Parse a `datetime-local` value as Western Indonesia Time (WIB / UTC+7).
 * The browser never sends a timezone with `datetime-local`, so trainers always
 * enter wall-clock time in WIB regardless of the server or browser locale.
 */
export function parseWibDateTimeLocal(value: string): Date | null {
  const trimmed = value.trim();
  const match = DATETIME_LOCAL_PATTERN.exec(trimmed);
  if (!match) {
    return null;
  }

  const [, year, month, day, hour, minute, second = "00"] = match;
  const isoWithOffset = `${year}-${month}-${day}T${hour}:${minute}:${second}+07:00`;
  const date = new Date(isoWithOffset);

  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Format an instant as a `datetime-local` value in WIB for form inputs.
 */
export function toDateTimeLocalValue(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: INDONESIA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

export function formatVideoConferenceSchedule(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: INDONESIA_TIME_ZONE,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(date);
}
