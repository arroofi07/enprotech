"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/application/auth/get-session";
import { createModule } from "@/lib/application/modules/create-module";
import { createModuleContent } from "@/lib/application/modules/create-module-content";
import { deleteModule } from "@/lib/application/modules/delete-module";
import { deleteModuleContent } from "@/lib/application/modules/delete-module-content";
import { reorderModuleContents } from "@/lib/application/modules/reorder-module-contents";
import { reorderModules } from "@/lib/application/modules/reorder-modules";
import { updateModule } from "@/lib/application/modules/update-module";
import { updateModuleVideoConference } from "@/lib/application/modules/update-module-video-conference";
import { endModuleVideoConference } from "@/lib/application/modules/end-module-video-conference";
import { updateModuleContent } from "@/lib/application/modules/update-module-content";
import { updateStudentModuleProgress } from "@/lib/application/modules/update-student-module-progress";
import { ModuleErrorCode } from "@/lib/domain/modules/errors";

export type ModuleActionState = {
  error?: ModuleErrorCode;
  message?: string;
  success?: boolean;
  moduleId?: string;
  trainingId?: string;
};

function revalidateModulePaths(trainingId: string, moduleId?: string) {
  revalidatePath(`/trainer/trainings/${trainingId}/modules`);
  revalidatePath(`/trainer/trainings/${trainingId}/edit`);
  revalidatePath(`/student/trainings/${trainingId}`);

  if (moduleId) {
    revalidatePath(`/student/trainings/${trainingId}/modules/${moduleId}`);
  }

  revalidatePath("/student/trainings");
}

function parseOptionalString(value: FormDataEntryValue | null): string | undefined {
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

export async function createModuleAction(
  _prevState: ModuleActionState,
  formData: FormData,
): Promise<ModuleActionState> {
  const actor = await getCurrentUser();
  const trainingId = String(formData.get("trainingId") ?? "");

  const result = await createModule(actor, {
    trainingId,
    title: String(formData.get("title") ?? ""),
    description: parseOptionalString(formData.get("description")),
    thumbnail: parseOptionalString(formData.get("thumbnail")),
    videoConferenceLink: parseOptionalString(
      formData.get("videoConferenceLink"),
    ),
    order: parseOptionalNumber(formData.get("order")),
    videoUrl: parseOptionalString(formData.get("videoUrl")),
    pptUrl: parseOptionalString(formData.get("pptUrl")),
    materialUrl: parseOptionalString(formData.get("materialUrl")),
    materialSize: parseOptionalNumber(formData.get("materialSize")),
  });

  if (!result.success) {
    return { error: result.error, message: result.message, success: false };
  }

  revalidateModulePaths(trainingId, result.data.id);
  return {
    success: true,
    message: "Modul berhasil dibuat.",
    moduleId: result.data.id,
    trainingId,
  };
}

export async function updateModuleAction(
  _prevState: ModuleActionState,
  formData: FormData,
): Promise<ModuleActionState> {
  const actor = await getCurrentUser();
  const moduleId = String(formData.get("moduleId") ?? "");
  const trainingId = String(formData.get("trainingId") ?? "");

  const result = await updateModule(actor, {
    moduleId,
    title: parseOptionalString(formData.get("title")),
    description:
      formData.get("description") === ""
        ? null
        : parseOptionalString(formData.get("description")),
    thumbnail:
      formData.get("thumbnail") === ""
        ? null
        : parseOptionalString(formData.get("thumbnail")),
    order: parseOptionalNumber(formData.get("order")),
  });

  if (!result.success) {
    return { error: result.error, message: result.message, success: false };
  }

  revalidateModulePaths(trainingId, moduleId);
  return { success: true, message: "Modul berhasil diperbarui.", moduleId, trainingId };
}

export async function deleteModuleAction(
  _prevState: ModuleActionState,
  formData: FormData,
): Promise<ModuleActionState> {
  const actor = await getCurrentUser();
  const moduleId = String(formData.get("moduleId") ?? "");
  const trainingId = String(formData.get("trainingId") ?? "");

  const result = await deleteModule(actor, { moduleId });

  if (!result.success) {
    return { error: result.error, message: result.message, success: false };
  }

  revalidateModulePaths(trainingId);
  return { success: true, message: "Modul berhasil dihapus.", trainingId };
}

export async function reorderModulesAction(
  _prevState: ModuleActionState,
  formData: FormData,
): Promise<ModuleActionState> {
  const actor = await getCurrentUser();
  const trainingId = String(formData.get("trainingId") ?? "");
  const moduleIds = formData
    .getAll("moduleIds")
    .map((value) => String(value))
    .filter(Boolean);

  const result = await reorderModules(actor, { trainingId, moduleIds });

  if (!result.success) {
    return { error: result.error, message: result.message, success: false };
  }

  revalidateModulePaths(trainingId);
  return { success: true, message: "Urutan modul berhasil disimpan.", trainingId };
}

export async function createModuleContentAction(
  _prevState: ModuleActionState,
  formData: FormData,
): Promise<ModuleActionState> {
  const actor = await getCurrentUser();
  const moduleId = String(formData.get("moduleId") ?? "");
  const trainingId = String(formData.get("trainingId") ?? "");
  const fileSizeRaw = formData.get("fileSize");

  const result = await createModuleContent(actor, {
    moduleId,
    type: String(formData.get("type") ?? ""),
    title: String(formData.get("title") ?? ""),
    url: String(formData.get("url") ?? ""),
    ...(fileSizeRaw ? { fileSize: fileSizeRaw } : {}),
  });

  if (!result.success) {
    return { error: result.error, message: result.message, success: false };
  }

  revalidateModulePaths(trainingId, moduleId);
  return { success: true, message: "Konten berhasil ditambahkan.", moduleId, trainingId };
}

export async function deleteModuleContentAction(
  _prevState: ModuleActionState,
  formData: FormData,
): Promise<ModuleActionState> {
  const actor = await getCurrentUser();
  const contentId = String(formData.get("contentId") ?? "");
  const moduleId = String(formData.get("moduleId") ?? "");
  const trainingId = String(formData.get("trainingId") ?? "");

  const result = await deleteModuleContent(actor, { contentId });

  if (!result.success) {
    return { error: result.error, message: result.message, success: false };
  }

  revalidateModulePaths(trainingId, moduleId);
  return { success: true, message: "Konten berhasil dihapus.", moduleId, trainingId };
}

export async function reorderModuleContentsAction(
  _prevState: ModuleActionState,
  formData: FormData,
): Promise<ModuleActionState> {
  const actor = await getCurrentUser();
  const moduleId = String(formData.get("moduleId") ?? "");
  const trainingId = String(formData.get("trainingId") ?? "");
  const contentIds = formData
    .getAll("contentIds")
    .map((value) => String(value))
    .filter(Boolean);

  const result = await reorderModuleContents(actor, { moduleId, contentIds });

  if (!result.success) {
    return { error: result.error, message: result.message, success: false };
  }

  revalidateModulePaths(trainingId, moduleId);
  return { success: true, message: "Urutan konten berhasil disimpan.", moduleId, trainingId };
}

export async function markModuleCompleteAction(
  _prevState: ModuleActionState,
  formData: FormData,
): Promise<ModuleActionState> {
  const actor = await getCurrentUser();
  const moduleId = String(formData.get("moduleId") ?? "");
  const trainingId = String(formData.get("trainingId") ?? "");

  const result = await updateStudentModuleProgress(actor, {
    moduleId,
    status: "completed",
  });

  if (!result.success) {
    return { error: result.error, message: result.message, success: false };
  }

  revalidateModulePaths(trainingId, moduleId);
  return { success: true, message: "Modul ditandai selesai.", moduleId, trainingId };
}

function parseOptionalDateTime(
  value: FormDataEntryValue | null,
): Date | null | undefined {
  const text = String(value ?? "").trim();
  if (!text) {
    return null;
  }

  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

export async function updateModuleVideoConferenceAction(
  _prevState: ModuleActionState,
  formData: FormData,
): Promise<ModuleActionState> {
  const actor = await getCurrentUser();
  const moduleId = String(formData.get("moduleId") ?? "");
  const trainingId = String(formData.get("trainingId") ?? "");
  const linkRaw = String(formData.get("videoConferenceLink") ?? "").trim();
  const scheduledAt = parseOptionalDateTime(
    formData.get("videoConferenceScheduledAt"),
  );

  if (scheduledAt === undefined) {
    return {
      error: ModuleErrorCode.VALIDATION_ERROR,
      message: "Jadwal video conference tidak valid.",
      success: false,
    };
  }

  const result = await updateModuleVideoConference(actor, {
    moduleId,
    trainingId,
    videoConferenceLink: linkRaw || null,
    videoConferenceScheduledAt: scheduledAt,
  });

  if (!result.success) {
    return { error: result.error, message: result.message, success: false };
  }

  revalidateModulePaths(trainingId, moduleId);
  revalidatePath("/trainer/video-conference");
  revalidatePath(`/trainer/video-conference/${trainingId}`);
  revalidatePath("/student/video-conference");

  return {
    success: true,
    message: linkRaw
      ? "Jadwal video conference berhasil disimpan."
      : "Jadwal video conference berhasil dihapus.",
    moduleId,
    trainingId,
  };
}

export async function endModuleVideoConferenceAction(
  _prevState: ModuleActionState,
  formData: FormData,
): Promise<ModuleActionState> {
  const actor = await getCurrentUser();
  const moduleId = String(formData.get("moduleId") ?? "");
  const trainingId = String(formData.get("trainingId") ?? "");

  const result = await endModuleVideoConference(actor, {
    moduleId,
    trainingId,
  });

  if (!result.success) {
    return { error: result.error, message: result.message, success: false };
  }

  revalidateModulePaths(trainingId, moduleId);
  revalidatePath("/trainer/video-conference");
  revalidatePath(`/trainer/video-conference/${trainingId}`);
  revalidatePath("/student/video-conference");

  return {
    success: true,
    message: "Video conference berhasil diakhiri.",
    moduleId,
    trainingId,
  };
}
