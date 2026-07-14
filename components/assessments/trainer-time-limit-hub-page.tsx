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
import { countModulesByTrainingIds } from "@/lib/infrastructure/db/repositories/module-repository";

const PAGE_SIZE = 10;
const BASE_PATH = "/trainer/waktu-ujian";

type TrainerTimeLimitHubPageProps = {
  searchParams?: {
    page?: string;
    search?: string;
    status?: string;
  };
};

export async function TrainerTimeLimitHubPage({
  searchParams = {},
}: TrainerTimeLimitHubPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

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
  const moduleCounts = await countModulesByTrainingIds(
    items.map((training) => training.id),
  );

  const rows = items.map((training) => ({
    ...training,
    moduleCount: moduleCounts[training.id] ?? 0,
  }));

  return (
    <>
      <TrainerHeader
        title="Batas Waktu"
        breadcrumbs={[{ label: "Batas Waktu" }]}
        user={user}
      />
      <main className="flex-1 overflow-auto">
        <div className="container max-w-7xl space-y-6 p-6 md:p-8">
          <AdminPageHeader
            title="Kelola Batas Waktu Ujian"
            description="Pilih training untuk mengatur batas waktu pengerjaan pre-test, post-test, quiz, dan latihan."
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
                      id: "actions",
                      header: "Aksi",
                      headerClassName: "text-right",
                      className: "text-right",
                      cell: (training) => (
                        <ButtonLink
                          variant="outline"
                          size="sm"
                          href={`/trainer/trainings/${training.id}/waktu-ujian`}
                        >
                          Kelola Batas Waktu
                        </ButtonLink>
                      ),
                    },
                  ]}
                />

                <TrainingsPagination
                  page={page}
                  totalPages={totalPages}
                  basePath={BASE_PATH}
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
