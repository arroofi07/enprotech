import { redirect } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  TrainingAssessmentHubTable,
  type StudentAssessmentHubRow,
  type TrainerAssessmentHubRow,
} from "@/components/assessments/training-assessment-hub-table";
import { TrainingAssessmentHubFilters } from "@/components/assessments/training-assessment-hub-filters";
import { StudentHeader } from "@/components/student/student-header";
import { TrainerHeader } from "@/components/trainer/trainer-header";
import { Card, CardContent } from "@/components/ui/card";
import { ListPagination } from "@/components/ui/list-pagination";
import { getCurrentUser } from "@/lib/application/auth/get-session";
import { getStudentTrainingFlowState } from "@/lib/application/training-flow/get-student-training-flow-state";
import { listEnrolledTrainings } from "@/lib/application/trainings/list-enrolled-trainings";
import { listTrainings } from "@/lib/application/trainings/list-trainings";
import { getAssessmentTypeLabel } from "@/lib/domain/assessments/labels";
import type { TrainingAssessmentType } from "@/lib/domain/assessments/types";
import { countQuestionsByTrainingIds } from "@/lib/infrastructure/db/repositories/assessment-repository";

const PAGE_SIZE = 10;

type TrainingAssessmentHubPageProps = {
  assessmentType: TrainingAssessmentType;
  role: "student" | "trainer";
  searchParams?: {
    page?: string;
    search?: string;
  };
};

function getHubBasePath(
  role: "student" | "trainer",
  assessmentType: TrainingAssessmentType,
): string {
  const segment = assessmentType === "pre_test" ? "pre-test" : "post-test";
  return `/${role}/${segment}`;
}

export async function TrainingAssessmentHubPage({
  assessmentType,
  role,
  searchParams = {},
}: TrainingAssessmentHubPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const typeLabel = getAssessmentTypeLabel(assessmentType);
  const basePath = getHubBasePath(role, assessmentType);
  const page = Number(searchParams.page ?? "1");

  if (role === "student") {
    const trainingsResult = await listEnrolledTrainings(user, {
      search: searchParams.search,
      page,
      pageSize: PAGE_SIZE,
    });

    if (!trainingsResult.success) {
      redirect("/unauthorized");
    }

    const { items: trainings, total, totalPages } = trainingsResult.data;

    const items: StudentAssessmentHubRow[] = await Promise.all(
      trainings.map(async (training) => {
        const flow = await getStudentTrainingFlowState(user.id, training.id);
        const status =
          assessmentType === "pre_test"
            ? !flow?.isPretestActive
              ? "Belum Aktif"
              : flow.hasCompletedPretest
                ? `Selesai · ${flow.pretestBestScore ?? 0}%`
                : "Belum Dikerjakan"
            : !flow?.allModulesCompleted
              ? "Terkunci"
              : flow.hasPassedPostTest
                ? `Lulus · ${flow.postTestBestScore ?? 0}%`
                : flow.postTestBestScore !== null && flow.postTestBestScore > 0
                  ? `Belum Lulus · ${flow.postTestBestScore}%`
                  : "Siap Dikerjakan";

        const canOpen =
          assessmentType === "pre_test"
            ? Boolean(flow?.isPretestActive)
            : Boolean(flow?.allModulesCompleted);

        return {
          id: training.id,
          title: training.title,
          statusLabel: status,
          canOpen,
        };
      }),
    );

    return (
      <>
        <StudentHeader title={typeLabel} breadcrumbs={[{ label: typeLabel }]} />
        <main className="flex-1 overflow-auto">
          <div className="container max-w-7xl space-y-6 p-6 md:p-8">
            <AdminPageHeader
              title={typeLabel}
              description={`Daftar training dan status ${typeLabel.toLowerCase()} Anda.`}
            />

            <Card>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <TrainingAssessmentHubFilters search={searchParams.search} />

                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Menampilkan{" "}
                      <span className="font-medium text-foreground">
                        {items.length}
                      </span>{" "}
                      dari{" "}
                      <span className="font-medium text-foreground">{total}</span>{" "}
                      training
                    </p>
                  </div>

                  <TrainingAssessmentHubTable
                    role="student"
                    assessmentType={assessmentType}
                    items={items}
                  />

                  <ListPagination
                    page={page}
                    totalPages={totalPages}
                    basePath={basePath}
                    searchParams={{ search: searchParams.search }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </>
    );
  }

  const trainingsResult = await listTrainings(user, {
    search: searchParams.search,
    page,
    pageSize: PAGE_SIZE,
  });

  if (!trainingsResult.success) {
    redirect("/unauthorized");
  }

  const { items: trainings, total, page: currentPage, totalPages } =
    trainingsResult.data;

  const questionCounts = await countQuestionsByTrainingIds(
    trainings.map((training) => training.id),
    assessmentType,
  );

  const items: TrainerAssessmentHubRow[] = trainings.map((training) => ({
    id: training.id,
    title: training.title,
    status: training.status,
    isPretestActive: training.isPretestActive,
    questionCount: questionCounts[training.id] ?? 0,
  }));

  return (
    <>
      <TrainerHeader
        title={typeLabel}
        breadcrumbs={[{ label: typeLabel }]}
        user={user}
      />
      <main className="flex-1 overflow-auto">
        <div className="container max-w-7xl space-y-6 p-6 md:p-8">
          <AdminPageHeader
            title={`Kelola ${typeLabel}`}
            description={`Pilih training untuk mengelola soal ${typeLabel.toLowerCase()}.`}
          />

          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                <TrainingAssessmentHubFilters search={searchParams.search} />

                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Menampilkan{" "}
                    <span className="font-medium text-foreground">
                      {items.length}
                    </span>{" "}
                    dari{" "}
                    <span className="font-medium text-foreground">{total}</span>{" "}
                    training
                  </p>
                </div>

                <TrainingAssessmentHubTable
                  role="trainer"
                  assessmentType={assessmentType}
                  items={items}
                />

                <ListPagination
                  page={currentPage}
                  totalPages={totalPages}
                  basePath={basePath}
                  searchParams={{ search: searchParams.search }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
