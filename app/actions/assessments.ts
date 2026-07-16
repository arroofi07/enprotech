"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/application/auth/get-session";
import { createQuestionUseCase } from "@/lib/application/assessments/create-question";
import { deleteQuestionUseCase } from "@/lib/application/assessments/delete-question";
import { importQuestionsUseCase } from "@/lib/application/assessments/import-questions";
import { updateAssessmentSettingsUseCase } from "@/lib/application/assessments/update-assessment-settings";
import { updateAssessmentTimeLimitUseCase } from "@/lib/application/assessments/update-assessment-time-limit";
import { updateQuestionUseCase } from "@/lib/application/assessments/update-question";
import { updateTrainingQuestionWeightsUseCase } from "@/lib/application/assessments/update-training-question-weights";
import type { AssessmentErrorCode } from "@/lib/domain/assessments/errors";
import type { AssessmentType } from "@/lib/domain/assessments/types";

export type AssessmentActionState = {
  error?: AssessmentErrorCode;
  message?: string;
  success?: boolean;
};

function revalidateAssessmentPaths(
  trainingId: string,
  type: AssessmentType,
  moduleId?: string,
) {
  if (moduleId) {
    revalidatePath(
      `/trainer/trainings/${trainingId}/modules/${moduleId}/${type}`,
    );
    revalidatePath(
      `/student/trainings/${trainingId}/modules/${moduleId}/${type}`,
    );
    revalidatePath(`/student/trainings/${trainingId}/modules/${moduleId}`);
    return;
  }

  const trainingPath = type === "pre_test" ? "pre-test" : "post-test";
  revalidatePath(`/trainer/trainings/${trainingId}/${trainingPath}`);
  revalidatePath(`/student/trainings/${trainingId}/${trainingPath}`);
  revalidatePath(`/student/trainings/${trainingId}`);
  revalidatePath(`/trainer/pre-test`);
  revalidatePath(`/trainer/post-test`);
  revalidatePath(`/student/pre-test`);
  revalidatePath(`/student/post-test`);
}

function parseOptions(formData: FormData) {
  return ["A", "B", "C", "D", "E"].map((label) => ({
    text: String(formData.get(`option_${label}`) ?? "").trim(),
    isCorrect: formData.get("correctAnswer") === label,
  }));
}

export async function createQuestionAction(
  _prevState: AssessmentActionState,
  formData: FormData,
): Promise<AssessmentActionState> {
  const actor = await getCurrentUser();
  const result = await createQuestionUseCase(actor, {
    assessmentId: String(formData.get("assessmentId") ?? ""),
    questionText: String(formData.get("questionText") ?? ""),
    options: parseOptions(formData),
  });

  if (!result.success) {
    return { error: result.error, message: result.message, success: false };
  }

  const trainingId = String(formData.get("trainingId") ?? "");
  const moduleId = String(formData.get("moduleId") ?? "") || undefined;
  const type = String(formData.get("type") ?? "quiz") as AssessmentType;

  revalidateAssessmentPaths(trainingId, type, moduleId);
  return { success: true, message: "Soal berhasil ditambahkan." };
}

export async function updateQuestionAction(
  _prevState: AssessmentActionState,
  formData: FormData,
): Promise<AssessmentActionState> {
  const actor = await getCurrentUser();
  const questionId = String(formData.get("questionId") ?? "");

  const result = await updateQuestionUseCase(actor, questionId, {
    questionText: String(formData.get("questionText") ?? ""),
    options: parseOptions(formData),
  });

  if (!result.success) {
    return { error: result.error, message: result.message, success: false };
  }

  const trainingId = String(formData.get("trainingId") ?? "");
  const moduleId = String(formData.get("moduleId") ?? "") || undefined;
  const type = String(formData.get("type") ?? "quiz") as AssessmentType;

  revalidateAssessmentPaths(trainingId, type, moduleId);
  return { success: true, message: "Soal berhasil diperbarui." };
}

export async function deleteQuestionAction(
  _prevState: AssessmentActionState,
  formData: FormData,
): Promise<AssessmentActionState> {
  const actor = await getCurrentUser();
  const result = await deleteQuestionUseCase(actor, {
    questionId: String(formData.get("questionId") ?? ""),
  });

  if (!result.success) {
    return { error: result.error, message: result.message, success: false };
  }

  const trainingId = String(formData.get("trainingId") ?? "");
  const moduleId = String(formData.get("moduleId") ?? "") || undefined;
  const type = String(formData.get("type") ?? "quiz") as AssessmentType;

  revalidateAssessmentPaths(trainingId, type, moduleId);
  return { success: true, message: "Soal berhasil dihapus." };
}

export async function importQuestionsAction(
  _prevState: AssessmentActionState,
  formData: FormData,
): Promise<AssessmentActionState> {
  const actor = await getCurrentUser();
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return {
      error: "VALIDATION_ERROR",
      message: "File Excel wajib diunggah.",
      success: false,
    };
  }

  const buffer = await file.arrayBuffer();
  const result = await importQuestionsUseCase(
    actor,
    String(formData.get("assessmentId") ?? ""),
    buffer,
  );

  if (!result.success) {
    return { error: result.error, message: result.message, success: false };
  }

  const trainingId = String(formData.get("trainingId") ?? "");
  const moduleId = String(formData.get("moduleId") ?? "") || undefined;
  const type = String(formData.get("type") ?? "quiz") as AssessmentType;

  revalidateAssessmentPaths(trainingId, type, moduleId);
  return {
    success: true,
    message: `${result.data.length} soal berhasil diimpor.`,
  };
}

export async function updateAssessmentSettingsAction(
  _prevState: AssessmentActionState,
  formData: FormData,
): Promise<AssessmentActionState> {
  const actor = await getCurrentUser();
  const result = await updateAssessmentSettingsUseCase(actor, {
    assessmentId: String(formData.get("assessmentId") ?? ""),
    questionDisplayCount: formData.get("questionDisplayCount"),
    shuffleQuestions: formData.get("shuffleQuestions"),
    timeLimit: formData.get("timeLimit"),
  });

  if (!result.success) {
    return { error: result.error, message: result.message, success: false };
  }

  const trainingId = String(formData.get("trainingId") ?? "");
  const moduleId = String(formData.get("moduleId") ?? "") || undefined;
  const type = String(formData.get("type") ?? "quiz") as AssessmentType;

  revalidateAssessmentPaths(trainingId, type, moduleId);
  return { success: true, message: "Pengaturan assessment berhasil disimpan." };
}

export async function updateAssessmentTimeLimitAction(
  _prevState: AssessmentActionState,
  formData: FormData,
): Promise<AssessmentActionState> {
  const actor = await getCurrentUser();
  const result = await updateAssessmentTimeLimitUseCase(actor, {
    assessmentId: String(formData.get("assessmentId") ?? ""),
    timeLimit: formData.get("timeLimit"),
  });

  if (!result.success) {
    return { error: result.error, message: result.message, success: false };
  }

  const trainingId = String(formData.get("trainingId") ?? "");
  const moduleId = String(formData.get("moduleId") ?? "") || undefined;
  const type = String(formData.get("type") ?? "quiz") as AssessmentType;

  revalidateAssessmentPaths(trainingId, type, moduleId);
  revalidatePath(`/trainer/trainings/${trainingId}/waktu-ujian`);
  return { success: true, message: "Batas waktu berhasil disimpan." };
}

export async function updateTrainingQuestionWeightsAction(
  _prevState: AssessmentActionState,
  formData: FormData,
): Promise<AssessmentActionState> {
  const actor = await getCurrentUser();
  const trainingId = String(formData.get("trainingId") ?? "");

  const weights = formData.getAll("assessmentId").map((value) => {
    const assessmentId = String(value);

    return {
      assessmentId,
      questionWeight: formData.get(`weight_${assessmentId}`),
    };
  });

  const result = await updateTrainingQuestionWeightsUseCase(actor, {
    trainingId,
    weights,
  });

  if (!result.success) {
    return { error: result.error, message: result.message, success: false };
  }

  revalidatePath(`/trainer/trainings/${trainingId}/bobot-soal`);
  revalidatePath("/trainer/bobot-soal");

  return {
    success: true,
    message: `Bobot untuk ${result.data.updatedCount} assessment berhasil disimpan.`,
  };
}
