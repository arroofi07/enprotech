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
import { paginateArray } from "@/lib/validations/pagination-schemas";

const QUESTION_PAGE_SIZE = 10;

type TrainerAssessmentPageProps = {
  params: Promise<{ id: string; moduleId: string }>;
  searchParams?: Promise<{ page?: string }>;
  assessmentType: AssessmentType;
};

export async function TrainerAssessmentPage({
  params,
  searchParams,
  assessmentType,
}: TrainerAssessmentPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { id, moduleId } = await params;
  const query = searchParams ? await searchParams : {};
  const page = Number(query.page ?? "1");
  const typeLabel = getAssessmentTypeLabel(assessmentType);
  const segment = assessmentType === "quiz" ? "quiz" : "latihan";
  const paginationBasePath = `/trainer/trainings/${id}/modules/${moduleId}/${segment}`;

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

  const paginatedQuestions = paginateArray(
    assessmentResult.data.questions,
    page,
    QUESTION_PAGE_SIZE,
  );

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
        <div className="container max-w-7xl space-y-6 p-6 md:p-8">
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
                questions={paginatedQuestions.items}
                passingGrade={passingGrade}
                questionPage={paginatedQuestions.page}
                questionTotalPages={paginatedQuestions.totalPages}
                questionTotal={paginatedQuestions.total}
                paginationBasePath={paginationBasePath}
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
