import type { ModuleProgressStatus } from "@/lib/domain/modules/types";
import type { EnrollmentStatus } from "@/lib/domain/trainings/types";

const MODULE_STATUS_LABELS: Record<ModuleProgressStatus, string> = {
  not_started: "Belum Mulai",
  in_progress: "Sedang Berjalan",
  completed: "Selesai",
};

const ENROLLMENT_STATUS_LABELS: Record<EnrollmentStatus, string> = {
  enrolled: "Terdaftar",
  in_progress: "Sedang Berjalan",
  completed: "Selesai",
};

const ASSESSMENT_TYPE_LABELS = {
  pre_test: "Pre Test",
  quiz: "Quiz",
  latihan: "Latihan",
  post_test: "Post Test",
} as const;

export function formatModuleStatus(status: ModuleProgressStatus): string {
  return MODULE_STATUS_LABELS[status];
}

export function formatEnrollmentStatus(status: EnrollmentStatus): string {
  return ENROLLMENT_STATUS_LABELS[status];
}

export function formatAssessmentType(
  type: keyof typeof ASSESSMENT_TYPE_LABELS,
): string {
  return ASSESSMENT_TYPE_LABELS[type];
}

export function formatScore(score: number | null): string {
  if (score === null) {
    return "-";
  }

  return String(score);
}

export function formatDateTime(value: string | Date | null): string {
  if (!value) {
    return "-";
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
