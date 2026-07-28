import {
  COMMUNITY_MEETING_DESCRIPTION_MAX_LENGTH,
  COMMUNITY_MEETING_TITLE_MAX_LENGTH,
  COMMUNITY_MESSAGE_MAX_LENGTH,
} from "./types";

export function normalizeMessageBody(body: string): string | null {
  const trimmed = body.trim();
  if (trimmed.length === 0) {
    return null;
  }
  if (trimmed.length > COMMUNITY_MESSAGE_MAX_LENGTH) {
    return null;
  }
  return trimmed;
}

export function isValidMeetLink(value: string): boolean {
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function normalizeMeetingTitle(title: string): string | null {
  const trimmed = title.trim();
  if (trimmed.length === 0) {
    return null;
  }
  if (trimmed.length > COMMUNITY_MEETING_TITLE_MAX_LENGTH) {
    return null;
  }
  return trimmed;
}

export function normalizeMeetingDescription(
  description: string | null | undefined,
): string | null {
  if (description == null) {
    return null;
  }
  const trimmed = description.trim();
  if (trimmed.length === 0) {
    return null;
  }
  if (trimmed.length > COMMUNITY_MEETING_DESCRIPTION_MAX_LENGTH) {
    return null;
  }
  return trimmed;
}

export function canManageMeeting(input: {
  actorId: string;
  creatorId: string;
}): boolean {
  return input.actorId === input.creatorId;
}
