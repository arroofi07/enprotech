import { mapStudentTrainingProgress } from "@/lib/domain/trainings/map-student-progress";
import type {
  EnrolledTrainingBase,
  EnrolledTrainingRecord,
} from "@/lib/infrastructure/db/repositories/training-repository";
import { getStudentTrainingProgressRawData } from "@/lib/infrastructure/db/repositories/progress-repository";

export async function enrichEnrolledTrainingsWithProgress(
  studentId: string,
  trainings: EnrolledTrainingBase[],
): Promise<EnrolledTrainingRecord[]> {
  return Promise.all(
    trainings.map(async (training) => {
      const raw = await getStudentTrainingProgressRawData(studentId, training.id);
      const summary = raw
        ? mapStudentTrainingProgress(raw).summary
        : null;

      return {
        ...training,
        totalModules: summary?.modules.total ?? 0,
        completedModules: summary?.modules.completed ?? 0,
        completedQuizzes: summary?.quizzes.completed ?? 0,
        totalQuizzes: summary?.quizzes.total ?? 0,
        completedLatihans: summary?.latihans.completed ?? 0,
        totalLatihans: summary?.latihans.total ?? 0,
        completedItems: summary?.completedItems ?? 0,
        totalItems: summary?.totalItems ?? 0,
        progressPercent: summary?.progressPercent ?? 0,
      };
    }),
  );
}
