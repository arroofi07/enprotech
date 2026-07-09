import { redirect } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AssessmentTakeView } from "@/components/assessments/assessment-take-view";
import { StudentHeader } from "@/components/student/student-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/application/auth/get-session";
import { getStudentTrainingAssessmentState } from "@/lib/application/assessments/get-student-training-assessment-state";
import {
  AssessmentErrorCode,
  getAssessmentErrorMessage,
} from "@/lib/domain/assessments/errors";
import { getAssessmentTypeLabel } from "@/lib/domain/assessments/labels";
import type { TrainingAssessmentType } from "@/lib/domain/assessments/types";

type StudentTrainingAssessmentPageProps = {
  params: Promise<{ id: string }>;
  assessmentType: TrainingAssessmentType;
};

export async function StudentTrainingAssessmentPage({
  params,
  assessmentType,
}: StudentTrainingAssessmentPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { id } = await params;
  const typeLabel = getAssessmentTypeLabel(assessmentType);

  const result = await getStudentTrainingAssessmentState(user, {
    trainingId: id,
    type: assessmentType,
  });

  if (
    !result.success &&
    result.error !== AssessmentErrorCode.ASSESSMENT_NOT_FOUND
  ) {
    const backHref = `/student/trainings/${id}`;

    return (
      <>
        <StudentHeader
          title={typeLabel}
          breadcrumbs={[
            { label: "Training Saya", href: "/student/trainings" },
            { label: typeLabel },
          ]}
        />
        <main className="flex-1 overflow-auto">
          <div className="container max-w-4xl space-y-6 p-6 md:p-8">
            <AdminPageHeader
              title={typeLabel}
              description={getAssessmentErrorMessage(result.error)}
              actions={
                <ButtonLink variant="outline" href={backHref}>
                  Kembali ke Training
                </ButtonLink>
              }
            />
            <Alert>
              <AlertDescription>{result.message}</AlertDescription>
            </Alert>
          </div>
        </main>
      </>
    );
  }

  if (!result.success) {
    return (
      <>
        <StudentHeader
          title={typeLabel}
          breadcrumbs={[
            { label: "Training Saya", href: "/student/trainings" },
            { label: typeLabel },
          ]}
        />
        <main className="flex-1 overflow-auto">
          <div className="container max-w-4xl space-y-6 p-6 md:p-8">
            <AdminPageHeader
              title={typeLabel}
              description={`${typeLabel} belum tersedia untuk training ini.`}
              actions={
                <ButtonLink variant="outline" href={`/student/trainings/${id}`}>
                  Kembali ke Training
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
        title={`${typeLabel} — ${state.training.title}`}
        breadcrumbs={[
          { label: "Training Saya", href: "/student/trainings" },
          {
            label: state.training.title,
            href: `/student/trainings/${id}`,
          },
          { label: typeLabel },
        ]}
      />
      <main className="flex-1 overflow-auto">
        <div className="container max-w-4xl space-y-6 p-6 md:p-8">
          <AdminPageHeader
            title={typeLabel}
            description={`Kerjakan ${typeLabel.toLowerCase()} untuk training "${state.training.title}".`}
            actions={
              <ButtonLink variant="outline" href={`/student/trainings/${id}`}>
                Kembali ke Training
              </ButtonLink>
            }
          />

          <Card>
            <CardContent className="p-6">
              <AssessmentTakeView
                trainingId={id}
                type={assessmentType}
                assessment={state.assessment}
                questions={state.questions}
                passingGrade={state.passingGrade}
                bestScore={state.bestScore}
                hasPassed={state.hasPassed}
                canRetry={state.canRetry}
                hasCompleted={state.hasCompleted}
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
