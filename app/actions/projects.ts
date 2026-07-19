"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/application/auth/get-session";
import { deleteStudentProject } from "@/lib/application/projects/delete-project";
import { submitProject } from "@/lib/application/projects/submit-project";
import { ProjectErrorCode } from "@/lib/domain/projects/errors";

export type ProjectActionState = {
  error?: ProjectErrorCode;
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

function parseOptionalNumber(
  value: FormDataEntryValue | null,
): number | undefined {
  const text = String(value ?? "").trim();
  if (!text) {
    return undefined;
  }

  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function revalidateProjectPaths(trainingId: string): void {
  revalidatePath("/student/projects");
  revalidatePath(`/student/projects/${trainingId}`);
  revalidatePath("/trainer/projects");
}

export async function submitProjectFormAction(
  _prevState: ProjectActionState,
  formData: FormData,
): Promise<ProjectActionState> {
  const actor = await getCurrentUser();
  const trainingId = String(formData.get("trainingId") ?? "");

  const result = await submitProject(actor, {
    trainingId,
    projectId: parseOptionalString(formData.get("projectId")),
    title: parseOptionalString(formData.get("title")),
    description: parseOptionalString(formData.get("description")),
    imageUrl: String(formData.get("imageUrl") ?? ""),
    videoUrl: String(formData.get("videoUrl") ?? ""),
    pdfUrl: String(formData.get("pdfUrl") ?? ""),
    pdfFileSize: parseOptionalNumber(formData.get("pdfFileSize")),
  });

  if (!result.success) {
    return { error: result.error, message: result.message, success: false };
  }

  revalidateProjectPaths(trainingId);

  return {
    success: true,
    message: "Project berhasil disimpan.",
    trainingId,
  };
}

export async function deleteProjectFormAction(
  _prevState: ProjectActionState,
  formData: FormData,
): Promise<ProjectActionState> {
  const actor = await getCurrentUser();
  const projectId = String(formData.get("projectId") ?? "");

  const result = await deleteStudentProject(actor, { projectId });

  if (!result.success) {
    return { error: result.error, message: result.message, success: false };
  }

  revalidateProjectPaths(result.data.trainingId);

  return {
    success: true,
    message: "Project berhasil dihapus.",
    trainingId: result.data.trainingId,
  };
}
