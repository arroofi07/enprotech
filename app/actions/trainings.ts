"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/application/auth/get-session";
import { activatePretest } from "@/lib/application/trainings/activate-pretest";
import { archiveTraining } from "@/lib/application/trainings/archive-training";
import { createTraining } from "@/lib/application/trainings/create-training";
import { enrollStudents } from "@/lib/application/trainings/enroll-students";
import { removeEnrollment } from "@/lib/application/trainings/remove-enrollment";
import { updateTraining } from "@/lib/application/trainings/update-training";
import type { TrainingErrorCode } from "@/lib/domain/trainings/errors";

export type TrainingActionState = {
  error?: TrainingErrorCode;
  message?: string;
  success?: boolean;
  trainingId?: string;
};

const TRAINING_PATHS = [
  "/trainer/modules",
  "/trainer/dashboard",
  "/trainer/trainings/new",
];

function revalidateTrainingPaths(trainingId?: string) {
  for (const path of TRAINING_PATHS) {
    revalidatePath(path);
  }

  if (trainingId) {
    revalidatePath(`/trainer/trainings/${trainingId}/edit`);
  }

  revalidatePath("/student/trainings");
}

function parseOptionalString(value: FormDataEntryValue | null): string | undefined {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : undefined;
}

function parseDeadline(value: FormDataEntryValue | null): Date | null | undefined {
  const text = String(value ?? "").trim();
  if (!text) {
    return null;
  }

  return new Date(text);
}

export async function createTrainingFormAction(formData: FormData): Promise<void> {
  const actor = await getCurrentUser();
  const result = await createTraining(actor, {
    title: String(formData.get("title") ?? ""),
    description: parseOptionalString(formData.get("description")),
    thumbnail: parseOptionalString(formData.get("thumbnail")),
    passingGrade: formData.get("passingGrade"),
    deadline: parseDeadline(formData.get("deadline")),
  });

  if (!result.success) {
    redirect(
      `/trainer/trainings/new?error=${encodeURIComponent(result.error)}`,
    );
  }

  revalidateTrainingPaths();
  redirect(`/trainer/trainings/${result.data.id}/edit`);
}

export async function updateTrainingAction(
  _prevState: TrainingActionState,
  formData: FormData,
): Promise<TrainingActionState> {
  const actor = await getCurrentUser();
  const trainingId = String(formData.get("trainingId") ?? "");
  const status = parseOptionalString(formData.get("status"));

  const result = await updateTraining(actor, {
    trainingId,
    title: parseOptionalString(formData.get("title")),
    description:
      formData.get("description") === ""
        ? null
        : parseOptionalString(formData.get("description")),
    thumbnail:
      formData.get("thumbnail") === ""
        ? null
        : parseOptionalString(formData.get("thumbnail")),
    passingGrade: formData.has("passingGrade")
      ? formData.get("passingGrade")
      : undefined,
    deadline: formData.has("deadline")
      ? parseDeadline(formData.get("deadline"))
      : undefined,
    ...(status ? { status } : {}),
  });

  if (!result.success) {
    return { error: result.error, message: result.message, success: false };
  }

  revalidateTrainingPaths(trainingId);
  return { success: true, message: "Training berhasil diperbarui.", trainingId };
}

export async function archiveTrainingAction(
  _prevState: TrainingActionState,
  formData: FormData,
): Promise<TrainingActionState> {
  const actor = await getCurrentUser();
  const trainingId = String(formData.get("trainingId") ?? "");
  const result = await archiveTraining(actor, {
    trainingId,
  });

  if (!result.success) {
    return { error: result.error, message: result.message, success: false };
  }

  revalidateTrainingPaths(trainingId);
  return { success: true, message: "Training berhasil diarsipkan." };
}

export async function enrollStudentsAction(
  _prevState: TrainingActionState,
  formData: FormData,
): Promise<TrainingActionState> {
  const actor = await getCurrentUser();
  const trainingId = String(formData.get("trainingId") ?? "");
  const studentIds = formData
    .getAll("studentIds")
    .map((value) => String(value))
    .filter(Boolean);

  const result = await enrollStudents(actor, { trainingId, studentIds });

  if (!result.success) {
    return { error: result.error, message: result.message, success: false };
  }

  revalidateTrainingPaths(trainingId);
  return {
    success: true,
    message: `${result.data.length} peserta berhasil di-enroll.`,
    trainingId,
  };
}

export async function removeEnrollmentAction(
  _prevState: TrainingActionState,
  formData: FormData,
): Promise<TrainingActionState> {
  const actor = await getCurrentUser();
  const trainingId = String(formData.get("trainingId") ?? "");
  const result = await removeEnrollment(actor, {
    enrollmentId: String(formData.get("enrollmentId") ?? ""),
  });

  if (!result.success) {
    return { error: result.error, message: result.message, success: false };
  }

  revalidateTrainingPaths(trainingId);
  return { success: true, message: "Peserta berhasil dihapus dari training." };
}

export async function activatePretestAction(
  _prevState: TrainingActionState,
  formData: FormData,
): Promise<TrainingActionState> {
  const actor = await getCurrentUser();
  const trainingId = String(formData.get("trainingId") ?? "");
  const result = await activatePretest(actor, { trainingId });

  if (!result.success) {
    return { error: result.error, message: result.message, success: false };
  }

  revalidateTrainingPaths(trainingId);
  return { success: true, message: "Pre-test berhasil diaktifkan." };
}

export async function publishTrainingAction(
  _prevState: TrainingActionState,
  formData: FormData,
): Promise<TrainingActionState> {
  const actor = await getCurrentUser();
  const trainingId = String(formData.get("trainingId") ?? "");
  const result = await updateTraining(actor, {
    trainingId,
    status: "active",
  });

  if (!result.success) {
    return { error: result.error, message: result.message, success: false };
  }

  revalidateTrainingPaths(trainingId);
  return { success: true, message: "Training berhasil dipublikasikan." };
}
