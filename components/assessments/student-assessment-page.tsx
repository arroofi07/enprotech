import { redirect } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AssessmentTakeView } from "@/components/assessments/assessment-take-view";
import { StudentHeader } from "@/components/student/student-header";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/application/auth/get-session";
import { getStudentAssessmentState } from "@/lib/application/assessments/get-student-assessment-state";
import { getAssessmentTypeLabel } from "@/lib/domain/assessments/labels";
import type { AssessmentType } from "@/lib/domain/assessments/types";

type StudentAssessmentPageProps = {
  params: Promise<{ id: string; moduleId: string }>;
  assessmentType: AssessmentType;
};

export async function StudentAssessmentPage({
  params,
  assessmentType,
}: StudentAssessmentPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { id, moduleId } = await params;
  const typeLabel = getAssessmentTypeLabel(assessmentType);

  const result = await getStudentAssessmentState(user, {
    moduleId,
    type: assessmentType,
  });

  if (
    !result.success &&
    result.error !== "ASSESSMENT_NOT_FOUND"
  ) {
    redirect("/unauthorized");
  }

  if (!result.success) {
    return (
      <>
        <StudentHeader
          title={typeLabel}
          breadcrumbs={[
            { label: "Training Saya", href: "/student/trainings" },
            { label: "Modul", href: `/student/trainings/${id}` },
            { label: typeLabel },
          ]}
        />
        <main className="flex-1 overflow-auto">
          <div className="container max-w-4xl space-y-6 p-6 md:p-8">
            <AdminPageHeader
              title={typeLabel}
              description={`${typeLabel} belum tersedia untuk modul ini.`}
              actions={
                <ButtonLink
                  variant="outline"
                  href={`/student/trainings/${id}/modules/${moduleId}`}
                >
                  Kembali ke Modul
                </ButtonLink>
              }
            />
          </div>
        </main>
      </>
    );
  }

  const state = result.data;

  return (
    <>
      <StudentHeader
        title={`${typeLabel} — ${state.module.title}`}
        breadcrumbs={[
          { label: "Training Saya", href: "/student/trainings" },
          {
            label: "Modul",
            href: `/student/trainings/${id}`,
          },
          {
            label: state.module.title,
            href: `/student/trainings/${id}/modules/${moduleId}`,
          },
          { label: typeLabel },
        ]}
      />
      <main className="flex-1 overflow-auto">
        <div className="container max-w-4xl space-y-6 p-6 md:p-8">
          <AdminPageHeader
            title={typeLabel}
            description={`Kerjakan ${typeLabel.toLowerCase()} untuk modul "${state.module.title}".`}
            actions={
              <ButtonLink
                variant="outline"
                href={`/student/trainings/${id}/modules/${moduleId}`}
              >
                Kembali ke Modul
              </ButtonLink>
            }
          />

          <Card>
            <CardContent className="p-6">
              <AssessmentTakeView
                trainingId={id}
                moduleId={moduleId}
                type={assessmentType}
                assessment={state.assessment}
                questions={state.questions}
                passingGrade={state.passingGrade}
                bestScore={state.bestScore}
                hasPassed={state.hasPassed}
                canRetry={state.canRetry}
                inProgressAttempt={state.inProgressAttempt}
                attempts={state.attempts}
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
