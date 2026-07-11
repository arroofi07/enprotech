import { resolvePassingGrade } from "@/lib/domain/assessments/resolve-passing-grade";
import {
  buildAssessmentProgressItem,
  buildStudentTrainingProgress,
} from "@/lib/domain/trainings/compute-progress";
import type {
  ModuleProgressItem,
  StudentTrainingProgress,
} from "@/lib/domain/trainings/progress-types";
import {
  findAssessmentForModule,
  findTrainingAssessment,
  getAttemptStats,
  type StudentTrainingProgressRawData,
} from "@/lib/domain/trainings/progress-raw-data";

export function mapStudentTrainingProgress(
  raw: StudentTrainingProgressRawData,
  lockedByModuleId: Record<string, boolean> = {},
): StudentTrainingProgress {
  const trainingPassingGrade = raw.training.passingGrade;
  const preTestAssessment = findTrainingAssessment(raw.assessments, "pre_test");
  const postTestAssessment = findTrainingAssessment(raw.assessments, "post_test");

  const preTestStats = getAttemptStats(
    raw.attemptStatsByAssessmentId,
    preTestAssessment?.id,
  );
  const postTestStats = getAttemptStats(
    raw.attemptStatsByAssessmentId,
    postTestAssessment?.id,
  );

  const allModulesCompleted = raw.modules.every(
    (module) => module.progressStatus === "completed",
  );

  const moduleItems: ModuleProgressItem[] = raw.modules.map((module) => {
    const quizAssessment = findAssessmentForModule(
      raw.assessments,
      module.id,
      "quiz",
    );
    const latihanAssessment = findAssessmentForModule(
      raw.assessments,
      module.id,
      "latihan",
    );

    const quizStats = getAttemptStats(
      raw.attemptStatsByAssessmentId,
      quizAssessment?.id,
    );
    const latihanStats = getAttemptStats(
      raw.attemptStatsByAssessmentId,
      latihanAssessment?.id,
    );

    const quizPassingGrade = resolvePassingGrade({
      type: "quiz",
      assessmentPassingGrade: quizAssessment?.passingGrade ?? null,
      trainingPassingGrade,
    });
    const latihanPassingGrade = resolvePassingGrade({
      type: "latihan",
      assessmentPassingGrade: latihanAssessment?.passingGrade ?? null,
      trainingPassingGrade,
    });
    const isLocked = lockedByModuleId[module.id] ?? false;

    return {
      id: module.id,
      title: module.title,
      order: module.order,
      status: module.progressStatus,
      isLocked,
      quiz: buildAssessmentProgressItem({
        assessmentId: quizAssessment?.id ?? null,
        bestScore: quizStats.submittedCount > 0 ? quizStats.bestScore : null,
        passingGrade: quizPassingGrade,
        submittedCount: quizStats.submittedCount,
        hasInProgressAttempt: quizStats.hasInProgressAttempt,
        locked: isLocked,
        requirePass: false,
      }),
      latihan: buildAssessmentProgressItem({
        assessmentId: latihanAssessment?.id ?? null,
        bestScore:
          latihanStats.submittedCount > 0 ? latihanStats.bestScore : null,
        passingGrade: latihanPassingGrade,
        submittedCount: latihanStats.submittedCount,
        hasInProgressAttempt: latihanStats.hasInProgressAttempt,
        locked: isLocked,
        requirePass: false,
      }),
    };
  });

  const preTestPassingGrade = resolvePassingGrade({
    type: "pre_test",
    assessmentPassingGrade: preTestAssessment?.passingGrade ?? null,
    trainingPassingGrade,
  });
  const postTestPassingGrade = resolvePassingGrade({
    type: "post_test",
    assessmentPassingGrade: postTestAssessment?.passingGrade ?? null,
    trainingPassingGrade,
  });

  const preTest = buildAssessmentProgressItem({
    assessmentId: preTestAssessment?.id ?? null,
    bestScore: preTestStats.submittedCount > 0 ? preTestStats.bestScore : null,
    passingGrade: preTestPassingGrade,
    submittedCount: preTestStats.submittedCount,
    hasInProgressAttempt: preTestStats.hasInProgressAttempt,
    locked: !raw.training.isPretestActive,
    requirePass: false,
  });

  const postTest = buildAssessmentProgressItem({
    assessmentId: postTestAssessment?.id ?? null,
    bestScore: postTestStats.submittedCount > 0 ? postTestStats.bestScore : null,
    passingGrade: postTestPassingGrade,
    submittedCount: postTestStats.submittedCount,
    hasInProgressAttempt: postTestStats.hasInProgressAttempt,
    locked: !allModulesCompleted,
    requirePass: true,
  });

  return buildStudentTrainingProgress({
    trainingId: raw.training.id,
    trainingTitle: raw.training.title,
    deadline: raw.training.deadline,
    isPretestActive: raw.training.isPretestActive,
    modules: moduleItems,
    preTest,
    postTest,
  });
}
