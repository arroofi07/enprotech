"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/application/auth/get-session";
import { submitFeedback } from "@/lib/application/feedback/submit-feedback";
import { FeedbackErrorCode } from "@/lib/domain/feedback/errors";

export type FeedbackActionState = {
  error?: FeedbackErrorCode;
  message?: string;
  success?: boolean;
  trainingId?: string;
};

function parseOptionalString(
  value: FormDataEntryValue | null,
): string | undefined {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : undefined;
}

export async function submitFeedbackFormAction(
  _prevState: FeedbackActionState,
  formData: FormData,
): Promise<FeedbackActionState> {
  const actor = await getCurrentUser();
  const trainingId = String(formData.get("trainingId") ?? "");

  const result = await submitFeedback(actor, {
    trainingId,
    trainingRating: formData.get("trainingRating"),
    trainerRating: formData.get("trainerRating"),
    comment: parseOptionalString(formData.get("comment")),
  });

  if (!result.success) {
    return { error: result.error, message: result.message, success: false };
  }

  revalidatePath("/student/feedback");
  revalidatePath(`/student/feedback/${trainingId}`);
  revalidatePath("/trainer/feedback");

  return {
    success: true,
    message: "Feedback berhasil disimpan.",
    trainingId,
  };
}
