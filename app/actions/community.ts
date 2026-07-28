"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/application/auth/get-session";
import { createMeeting } from "@/lib/application/community/create-meeting";
import { deleteMeeting } from "@/lib/application/community/delete-meeting";
import { updateMeeting } from "@/lib/application/community/update-meeting";
import type { CommunityErrorCode } from "@/lib/domain/community/errors";

export type CommunityMeetingActionState = {
  error?: CommunityErrorCode;
  message?: string;
  success?: boolean;
  trainingId?: string;
  meetingId?: string;
};

function parseOptionalString(
  value: FormDataEntryValue | null,
): string | undefined {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : undefined;
}

export async function createCommunityMeetingAction(
  _prevState: CommunityMeetingActionState,
  formData: FormData,
): Promise<CommunityMeetingActionState> {
  const actor = await getCurrentUser();
  const trainingId = String(formData.get("trainingId") ?? "");

  const result = await createMeeting(actor, trainingId, {
    title: formData.get("title"),
    description: parseOptionalString(formData.get("description")),
    scheduledAt: String(formData.get("scheduledAt") ?? ""),
    meetLink: String(formData.get("meetLink") ?? ""),
  });

  if (!result.success) {
    return { error: result.error, message: result.message, success: false };
  }

  revalidatePath("/student/community");
  revalidatePath(`/student/community/${trainingId}`);

  return {
    success: true,
    message: "Jadwal meeting berhasil dibuat.",
    trainingId,
    meetingId: result.data.id,
  };
}

export async function updateCommunityMeetingAction(
  _prevState: CommunityMeetingActionState,
  formData: FormData,
): Promise<CommunityMeetingActionState> {
  const actor = await getCurrentUser();
  const meetingId = String(formData.get("meetingId") ?? "");
  const trainingId = String(formData.get("trainingId") ?? "");

  const result = await updateMeeting(actor, meetingId, {
    title: formData.get("title"),
    description: parseOptionalString(formData.get("description")),
    scheduledAt: String(formData.get("scheduledAt") ?? ""),
    meetLink: String(formData.get("meetLink") ?? ""),
  });

  if (!result.success) {
    return { error: result.error, message: result.message, success: false };
  }

  revalidatePath("/student/community");
  revalidatePath(`/student/community/${trainingId || result.data.trainingId}`);

  return {
    success: true,
    message: "Jadwal meeting berhasil diperbarui.",
    trainingId: result.data.trainingId,
    meetingId: result.data.id,
  };
}

export async function deleteCommunityMeetingAction(
  _prevState: CommunityMeetingActionState,
  formData: FormData,
): Promise<CommunityMeetingActionState> {
  const actor = await getCurrentUser();
  const meetingId = String(formData.get("meetingId") ?? "");
  const trainingId = String(formData.get("trainingId") ?? "");

  const result = await deleteMeeting(actor, meetingId);

  if (!result.success) {
    return { error: result.error, message: result.message, success: false };
  }

  revalidatePath("/student/community");
  if (trainingId) {
    revalidatePath(`/student/community/${trainingId}`);
  }

  return {
    success: true,
    message: "Jadwal meeting berhasil dihapus.",
    trainingId,
    meetingId,
  };
}
