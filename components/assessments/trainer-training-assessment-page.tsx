import { redirect } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AssessmentManagementPanel } from "@/components/assessments/assessment-management-panel";
import { TrainerHeader } from "@/components/trainer/trainer-header";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/application/auth/get-session";
import { getOrCreateTrainingAssessment } from "@/lib/application/assessments/get-or-create-training-assessment";
import { getTraining } from "@/lib/application/trainings/get-training";
import { getAssessmentTypeLabel } from "@/lib/domain/assessments/labels";
import { resolvePassingGrade } from "@/lib/domain/assessments/resolve-passing-grade";
import type { TrainingAssessmentType } from "@/lib/domain/assessments/types";
import { getTrainingPassingGrade } from "@/lib/infrastructure/db/repositories/assessment-repository";

type TrainerTrainingAssessmentPageProps = {
  params: Promise<{ id: string }>;
  assessmentType: TrainingAssessmentType;
};

export async function TrainerTrainingAssessmentPage({
  params,
  assessmentType,
}: TrainerTrainingAssessmentPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { id } = await params;
  const typeLabel = getAssessmentTypeLabel(assessmentType);

  const [trainingResult, assessmentResult, trainingPassingGrade] =
    await Promise.all([
      getTraining(user, { trainingId: id }),
      getOrCreateTrainingAssessment(user, {
        trainingId: id,
        type: assessmentType,
      }),
      getTrainingPassingGrade(id),
    ]);

  if (!trainingResult.success || !assessmentResult.success) {
    redirect("/unauthorized");
  }

  const passingGrade = resolvePassingGrade({
    type: assessmentType,
    assessmentPassingGrade: assessmentResult.data.passingGrade,
    trainingPassingGrade,
  });

  return (
    <>
      <TrainerHeader
        title={`${typeLabel} — ${trainingResult.data.title}`}
        breadcrumbs={[
          { label: "Training", href: "/trainer/trainings" },
          {
            label: trainingResult.data.title,
            href: `/trainer/trainings/${id}/edit`,
          },
          { label: typeLabel },
        ]}
        user={user}
      />
      <main className="flex-1 overflow-auto">
        <div className="container max-w-6xl space-y-6 p-6 md:p-8">
          <AdminPageHeader
            title={`Kelola ${typeLabel}`}
            description={`Buat dan kelola soal ${typeLabel.toLowerCase()} untuk training "${trainingResult.data.title}".`}
            actions={
              <ButtonLink
                variant="outline"
                href={`/trainer/trainings/${id}/edit`}
              >
                Kembali ke Training
              </ButtonLink>
            }
          />

          <Card>
            <CardContent className="p-6">
              <AssessmentManagementPanel
                trainingId={id}
                contextTitle={trainingResult.data.title}
                type={assessmentType}
                assessment={assessmentResult.data}
                questions={assessmentResult.data.questions}
                passingGrade={passingGrade}
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
