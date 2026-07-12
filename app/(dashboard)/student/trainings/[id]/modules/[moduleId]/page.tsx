import { redirect } from "next/navigation";

import { StudentModuleView } from "@/components/modules/student-module-view";
import { StudentHeader } from "@/components/student/student-header";
import { ButtonLink } from "@/components/ui/button-link";
import { getCurrentUser } from "@/lib/application/auth/get-session";
import { getStudentModule } from "@/lib/application/modules/list-student-modules";
import { getStudentTrainingProgress } from "@/lib/application/progress/get-student-training-progress";
import {
  getQuizScheduleState,
  isVideoConferenceStarted,
} from "@/lib/domain/modules/video-conference-access";

type StudentModuleDetailPageProps = {
  params: Promise<{ id: string; moduleId: string }>;
};

export default async function StudentModuleDetailPage({
  params,
}: StudentModuleDetailPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { id, moduleId } = await params;
  const [moduleResult, progressResult] = await Promise.all([
    getStudentModule(user, { moduleId }),
    getStudentTrainingProgress(user, { trainingId: id }),
  ]);

  if (!moduleResult.success) {
    if (moduleResult.error === "PRETEST_REQUIRED") {
      redirect(`/student/trainings/${id}/pre-test`);
    }
    redirect("/unauthorized");
  }

  const progress = progressResult.success ? progressResult.data : null;
  const moduleProgress = progress?.modules.find((item) => item.id === moduleId);
  const moduleNumber =
    progress?.modules.findIndex((item) => item.id === moduleId) ?? -1;

  const now = new Date();
  const scheduledAt = moduleResult.data.videoConferenceScheduledAt;
  const quizUnlocked = getQuizScheduleState(scheduledAt, now) === "open";
  const videoConferenceStarted = isVideoConferenceStarted(scheduledAt, now);
  // Latihan opens once the quiz is completed. When a module has no quiz to do
  // (no quiz assessment), there is nothing to gate on, so it stays open. Server
  // enforcement in getStudentAssessmentState is authoritative regardless.
  const quizProgress = moduleProgress?.quiz;
  const latihanUnlocked =
    quizProgress == null ||
    quizProgress.assessmentId === null ||
    quizProgress.status === "submitted" ||
    quizProgress.status === "passed";

  return (
    <>
      <StudentHeader
        title={moduleResult.data.title}
        breadcrumbs={[
          { label: "Training Saya", href: "/student/trainings" },
          { label: "Modul", href: "/student/modules" },
          { label: moduleResult.data.title },
        ]}
      />
      <main className="flex-1 overflow-auto">
        <div className="container max-w-7xl space-y-6 p-6 md:p-8">
          <div className="flex justify-end">
            <ButtonLink variant="outline" href="/student/modules">
              Kembali ke Daftar Modul
            </ButtonLink>
          </div>

          <StudentModuleView
            module={moduleResult.data}
            trainingId={id}
            trainingTitle={progress?.trainingTitle}
            progressItem={moduleProgress}
            moduleNumber={moduleNumber >= 0 ? moduleNumber + 1 : undefined}
            totalModules={progress?.modules.length}
            quizUnlocked={quizUnlocked}
            latihanUnlocked={latihanUnlocked}
            videoConferenceStarted={videoConferenceStarted}
          />
        </div>
      </main>
    </>
  );
}
