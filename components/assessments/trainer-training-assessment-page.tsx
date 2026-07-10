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
import { paginateArray } from "@/lib/validations/pagination-schemas";

const QUESTION_PAGE_SIZE = 10;

type TrainerTrainingAssessmentPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ page?: string }>;
  assessmentType: TrainingAssessmentType;
};

export async function TrainerTrainingAssessmentPage({
  params,
  searchParams,
  assessmentType,
}: TrainerTrainingAssessmentPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { id } = await params;
  const query = searchParams ? await searchParams : {};
  const page = Number(query.page ?? "1");
  const typeLabel = getAssessmentTypeLabel(assessmentType);
  const segment = assessmentType === "pre_test" ? "pre-test" : "post-test";
  const paginationBasePath = `/trainer/trainings/${id}/${segment}`;

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

  const paginatedQuestions = paginateArray(
    assessmentResult.data.questions,
    page,
    QUESTION_PAGE_SIZE,
  );

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
        <div className="container max-w-7xl space-y-6 p-6 md:p-8">
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
