import type { SessionUser } from "@/lib/domain/auth/types";
import {
  AssessmentErrorCode,
  assessmentFailure,
  assessmentSuccess,
  type AssessmentResult,
} from "@/lib/domain/assessments/errors";
import { formatVideoConferenceSchedule } from "@/lib/domain/modules/format-video-conference-schedule";
import { getQuizScheduleState } from "@/lib/domain/modules/video-conference-access";
import type { ModuleAssessmentType } from "@/lib/domain/assessments/types";
import type {
  AssessmentProgressItem,
  AssessmentProgressStatus,
} from "@/lib/domain/trainings/progress-types";
import {
  listStudentModuleAssessmentHub,
  type StudentModuleAssessmentHubBaseRow,
} from "@/lib/infrastructure/db/repositories/assessment-repository";
import { buildPaginatedResult } from "@/lib/validations/pagination-schemas";
import { listModuleAssessmentHubSchema } from "@/lib/validations/assessment-schemas";

import { getStudentTrainingProgress } from "../progress/get-student-training-progress";
import { getStudentTrainingFlowState } from "../training-flow/get-student-training-flow-state";
import { assertAssessmentStudent } from "./assert-access";

export type StudentModuleAssessmentHubRow = StudentModuleAssessmentHubBaseRow & {
  statusLabel: string;
  progressStatus: AssessmentProgressStatus;
  canOpen: boolean;
  bestScore: number | null;
  passingGrade: number | null;
};

export type ListStudentModuleAssessmentHubResult = {
  items: StudentModuleAssessmentHubRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

function formatAssessmentStatusLabel(
  progress: AssessmentProgressItem,
): string {
  switch (progress.status) {
    case "not_started":
      return "Belum dikerjakan";
    case "in_progress":
      return "Sedang dikerjakan";
    case "submitted":
      return progress.bestScore !== null
        ? `Sudah submit · ${progress.bestScore}%`
        : "Sudah submit";
    case "passed":
      return progress.bestScore !== null
        ? `Selesai · ${progress.bestScore}%`
        : "Selesai";
    case "locked":
      return "Terkunci";
  }
}

function isLatihanUnlocked(quiz: AssessmentProgressItem): boolean {
  return (
    quiz.assessmentId === null ||
    quiz.status === "submitted" ||
    quiz.status === "passed"
  );
}

function buildStudentModuleAssessmentHubRow(
  base: StudentModuleAssessmentHubBaseRow,
  type: ModuleAssessmentType,
  canAccessModules: boolean,
  moduleProgress: {
    isLocked: boolean;
    quiz: AssessmentProgressItem;
    latihan: AssessmentProgressItem;
  } | null,
  now: Date,
): StudentModuleAssessmentHubRow {
  const assessmentProgress =
    type === "quiz"
      ? (moduleProgress?.quiz ?? null)
      : (moduleProgress?.latihan ?? null);

  const lockedRow = (
    statusLabel: string,
    progressStatus: AssessmentProgressStatus = "locked",
  ): StudentModuleAssessmentHubRow => ({
    ...base,
    statusLabel,
    progressStatus,
    canOpen: false,
    bestScore: assessmentProgress?.bestScore ?? null,
    passingGrade: assessmentProgress?.passingGrade ?? null,
  });

  if (!canAccessModules) {
    return lockedRow("Selesaikan pre-test");
  }

  if (!moduleProgress || moduleProgress.isLocked) {
    return lockedRow("Modul terkunci");
  }

  if (!assessmentProgress?.assessmentId || base.questionCount === 0) {
    return lockedRow("Belum tersedia");
  }

  if (type === "quiz") {
    const scheduleState = getQuizScheduleState(
      base.videoConferenceScheduledAt,
      now,
    );

    if (scheduleState === "not_scheduled") {
      return lockedRow(
        "Menunggu jadwal video conference",
        assessmentProgress.status,
      );
    }

    if (scheduleState === "locked" && base.videoConferenceScheduledAt) {
      return lockedRow(
        `Terbuka ${formatVideoConferenceSchedule(base.videoConferenceScheduledAt)}`,
        assessmentProgress.status,
      );
    }
  }

  if (type === "latihan" && !isLatihanUnlocked(moduleProgress.quiz)) {
    return lockedRow(
      "Selesaikan quiz terlebih dahulu",
      assessmentProgress.status,
    );
  }

  return {
    ...base,
    statusLabel: formatAssessmentStatusLabel(assessmentProgress),
    progressStatus: assessmentProgress.status,
    canOpen: true,
    bestScore: assessmentProgress.bestScore,
    passingGrade: assessmentProgress.passingGrade,
  };
}

export async function listStudentModuleAssessmentHubItems(
  actor: SessionUser | null,
  input: unknown,
): Promise<AssessmentResult<ListStudentModuleAssessmentHubResult>> {
  const forbidden = assertAssessmentStudent(actor);
  if (forbidden) {
    return forbidden;
  }

  const parsed = listModuleAssessmentHubSchema.safeParse(input);
  if (!parsed.success) {
    return assessmentFailure(AssessmentErrorCode.VALIDATION_ERROR);
  }

  const { page, pageSize, search, type } = parsed.data;
  const result = await listStudentModuleAssessmentHub({
    studentId: actor!.id,
    type: type as ModuleAssessmentType,
    search,
    page,
    pageSize,
  });

  const trainingIds = [...new Set(result.items.map((item) => item.trainingId))];
  const now = new Date();

  const trainingContext = new Map<
    string,
    {
      canAccessModules: boolean;
      modulesById: Map<
        string,
        {
          isLocked: boolean;
          quiz: AssessmentProgressItem;
          latihan: AssessmentProgressItem;
        }
      >;
    }
  >();

  await Promise.all(
    trainingIds.map(async (trainingId) => {
      const [flow, progress] = await Promise.all([
        getStudentTrainingFlowState(actor!.id, trainingId),
        getStudentTrainingProgress(actor, { trainingId }),
      ]);

      const modulesById = new Map(
        (progress.success ? progress.data.modules : []).map((module) => [
          module.id,
          {
            isLocked: module.isLocked,
            quiz: module.quiz,
            latihan: module.latihan,
          },
        ]),
      );

      trainingContext.set(trainingId, {
        canAccessModules: flow?.canAccessModules ?? false,
        modulesById,
      });
    }),
  );

  const items = result.items.map((item) => {
    const context = trainingContext.get(item.trainingId);
    const moduleProgress = context?.modulesById.get(item.moduleId) ?? null;

    return buildStudentModuleAssessmentHubRow(
      item,
      type as ModuleAssessmentType,
      context?.canAccessModules ?? false,
      moduleProgress,
      now,
    );
  });

  return assessmentSuccess(
    buildPaginatedResult(items, result.total, page, pageSize),
  );
}
