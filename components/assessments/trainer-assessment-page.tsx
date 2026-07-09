import { redirect } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AssessmentManagementPanel } from "@/components/assessments/assessment-management-panel";
import { TrainerHeader } from "@/components/trainer/trainer-header";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/application/auth/get-session";
import { getOrCreateAssessment } from "@/lib/application/assessments/get-or-create-assessment";
import { getTraining } from "@/lib/application/trainings/get-training";
import { getAssessmentTypeLabel } from "@/lib/domain/assessments/labels";
import { resolvePassingGrade } from "@/lib/domain/assessments/resolve-passing-grade";
import type { AssessmentType } from "@/lib/domain/assessments/types";
import {
  findModuleContextById,
  getTrainingPassingGrade,
} from "@/lib/infrastructure/db/repositories/assessment-repository";

type TrainerAssessmentPageProps = {
  params: Promise<{ id: string; moduleId: string }>;
  assessmentType: AssessmentType;
};

export async function TrainerAssessmentPage({
  params,
  assessmentType,
}: TrainerAssessmentPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { id, moduleId } = await params;
  const typeLabel = getAssessmentTypeLabel(assessmentType);

  const [trainingResult, module, assessmentResult, trainingPassingGrade] =
    await Promise.all([
      getTraining(user, { trainingId: id }),
      findModuleContextById(moduleId),
      getOrCreateAssessment(user, { moduleId, type: assessmentType }),
      getTrainingPassingGrade(id),
    ]);

  if (!trainingResult.success || !module || !assessmentResult.success) {
    redirect("/unauthorized");
  }

  const passingGrade = resolvePassingGrade({
    type: assessmentType,
    assessmentPassingGrade: assessmentResult.data.passingGrade,
    minQuizScore: module.minQuizScore,
    minLatihanScore: module.minLatihanScore,
    trainingPassingGrade,
  });

  return (
    <>
      <TrainerHeader
        title={`${typeLabel} — ${module.title}`}
        breadcrumbs={[
          { label: "Training", href: "/trainer/trainings" },
          {
            label: trainingResult.data.title,
            href: `/trainer/trainings/${id}/edit`,
          },
          {
            label: "Modul",
            href: `/trainer/trainings/${id}/modules`,
          },
          { label: module.title },
          { label: typeLabel },
        ]}
        user={user}
      />
      <main className="flex-1 overflow-auto">
        <div className="container max-w-6xl space-y-6 p-6 md:p-8">
          <AdminPageHeader
            title={`Kelola ${typeLabel}`}
            description={`Buat dan kelola soal ${typeLabel.toLowerCase()} untuk modul "${module.title}".`}
            actions={
              <ButtonLink
                variant="outline"
                href={`/trainer/trainings/${id}/modules`}
              >
                Kembali ke Modul
              </ButtonLink>
            }
          />

          <Card>
            <CardContent className="p-6">
              <AssessmentManagementPanel
                trainingId={id}
                moduleId={moduleId}
                contextTitle={module.title}
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
