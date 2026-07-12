import { redirect } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { TrainerHeader } from "@/components/trainer/trainer-header";
import { TrainingsFilters } from "@/components/trainings/trainings-filters";
import { TrainingsPagination } from "@/components/trainings/trainings-pagination";
import { TrainingStatusBadge } from "@/components/trainings/training-status-badge";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { getCurrentUser } from "@/lib/application/auth/get-session";
import { listTrainings } from "@/lib/application/trainings/list-trainings";
import { getAssessmentTypeLabel } from "@/lib/domain/assessments/labels";
import type { ModuleAssessmentType } from "@/lib/domain/assessments/types";
import { countModuleQuestionsByTrainingIds } from "@/lib/infrastructure/db/repositories/assessment-repository";
import { countModulesByTrainingIds } from "@/lib/infrastructure/db/repositories/module-repository";

const PAGE_SIZE = 10;

type TrainerAssessmentHubPageProps = {
  type: ModuleAssessmentType;
  searchParams?: {
    page?: string;
    search?: string;
    status?: string;
  };
};

function getHubBasePath(type: ModuleAssessmentType): string {
  return type === "quiz" ? "/trainer/quiz" : "/trainer/latihan";
}

function getTrainingAssessmentPath(
  type: ModuleAssessmentType,
  trainingId: string,
): string {
  const segment = type === "quiz" ? "quiz" : "latihan";
  return `/trainer/trainings/${trainingId}/${segment}`;
}

export async function TrainerAssessmentHubPage({
  type,
  searchParams = {},
}: TrainerAssessmentHubPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const typeLabel = getAssessmentTypeLabel(type);
  const basePath = getHubBasePath(type);
  const result = await listTrainings(user, {
    search: searchParams.search,
    status: searchParams.status,
    page: searchParams.page,
    pageSize: PAGE_SIZE,
  });

  if (!result.success) {
    redirect("/unauthorized");
  }

  const { items, page, totalPages, total } = result.data;
  const [moduleCounts, questionCounts] = await Promise.all([
    countModulesByTrainingIds(items.map((training) => training.id)),
    countModuleQuestionsByTrainingIds(
      items.map((training) => training.id),
      type,
    ),
  ]);

  const rows = items.map((training) => ({
    ...training,
    moduleCount: moduleCounts[training.id] ?? 0,
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
            description={`Pilih training untuk mengelola soal ${typeLabel.toLowerCase()} per modul.`}
          />

          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                <TrainingsFilters
                  search={searchParams.search}
                  status={searchParams.status}
                />

                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Menampilkan{" "}
                    <span className="font-medium text-foreground">
                      {rows.length}
                    </span>{" "}
                    dari{" "}
                    <span className="font-medium text-foreground">{total}</span>{" "}
                    training
                  </p>
                </div>

                <DataTable
                  data={rows}
                  getRowKey={(training) => training.id}
                  emptyState={{
                    message: "Belum ada training. Buat training terlebih dahulu.",
                  }}
                  columns={[
                    {
                      id: "title",
                      header: "Training",
                      cell: (training) => (
                        <span className="font-medium">{training.title}</span>
                      ),
                    },
                    {
                      id: "status",
                      header: "Status",
                      cell: (training) => (
                        <TrainingStatusBadge status={training.status} />
                      ),
                    },
                    {
                      id: "modules",
                      header: "Jumlah Modul",
                      cell: (training) =>
                        training.moduleCount > 0 ? (
                          <Badge variant="secondary">
                            {training.moduleCount} modul
                          </Badge>
                        ) : (
                          <Badge variant="outline">Belum ada modul</Badge>
                        ),
                    },
                    {
                      id: "questions",
                      header: "Jumlah Soal",
                      cell: (training) =>
                        training.questionCount > 0 ? (
                          <Badge variant="secondary">
                            {training.questionCount} soal
                          </Badge>
                        ) : (
                          <Badge variant="outline">Belum ada soal</Badge>
                        ),
                    },
                    {
                      id: "actions",
                      header: "Aksi",
                      headerClassName: "text-right",
                      className: "text-right",
                      cell: (training) => (
                        <ButtonLink
                          variant="outline"
                          size="sm"
                          href={getTrainingAssessmentPath(type, training.id)}
                        >
                          Kelola {typeLabel}
                        </ButtonLink>
                      ),
                    },
                  ]}
                />

                <TrainingsPagination
                  page={page}
                  totalPages={totalPages}
                  basePath={basePath}
                  searchParams={{
                    search: searchParams.search,
                    status: searchParams.status,
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
