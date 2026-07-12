import { redirect } from "next/navigation";

import { IconCalendarClock, IconClock, IconLock } from "@tabler/icons-react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AssessmentTakeView } from "@/components/assessments/assessment-take-view";
import { StudentHeader } from "@/components/student/student-header";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/application/auth/get-session";
import { getStudentAssessmentState } from "@/lib/application/assessments/get-student-assessment-state";
import { getAssessmentTypeLabel } from "@/lib/domain/assessments/labels";
import type { AssessmentType } from "@/lib/domain/assessments/types";

const GATED_ERROR_ICON = {
  QUIZ_NOT_SCHEDULED: IconCalendarClock,
  QUIZ_NOT_STARTED: IconClock,
  LATIHAN_LOCKED: IconLock,
} as const;

type GatedErrorCode = keyof typeof GATED_ERROR_ICON;

function isGatedErrorCode(code: string): code is GatedErrorCode {
  return code in GATED_ERROR_ICON;
}

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

  if (!result.success && result.error === "PRETEST_REQUIRED") {
    redirect(`/student/trainings/${id}/pre-test`);
  }

  const gated = !result.success && isGatedErrorCode(result.error);

  if (
    !result.success &&
    result.error !== "ASSESSMENT_NOT_FOUND" &&
    !gated
  ) {
    redirect("/unauthorized");
  }

  if (!result.success) {
    const LockIcon = gated ? GATED_ERROR_ICON[result.error as GatedErrorCode] : IconLock;

    return (
      <>
        <StudentHeader
          title={typeLabel}
          breadcrumbs={[
            { label: "Training Saya", href: "/student/trainings" },
            { label: "Modul", href: "/student/modules" },
            { label: typeLabel },
          ]}
        />
        <main className="flex-1 overflow-auto">
          <div className="container max-w-4xl space-y-6 p-6 md:p-8">
            <AdminPageHeader
              title={typeLabel}
              description={
                gated
                  ? `${typeLabel} belum dapat diakses.`
                  : `${typeLabel} belum tersedia untuk modul ini.`
              }
              actions={
                <ButtonLink
                  variant="outline"
                  href={`/student/trainings/${id}/modules/${moduleId}`}
                >
                  Kembali ke Modul
                </ButtonLink>
              }
            />

            {gated ? (
              <Card>
                <CardContent className="flex flex-col items-center gap-4 p-8 text-center md:flex-row md:text-left">
                  <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <LockIcon className="size-7" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">{typeLabel} terkunci</p>
                    <p className="text-sm text-muted-foreground">
                      {result.message}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : null}
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
            href: "/student/modules",
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
                latestAttemptReview={state.latestAttemptReview}
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
