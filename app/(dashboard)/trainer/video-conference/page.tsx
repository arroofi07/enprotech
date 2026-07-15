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
import {
  countModulesByTrainingIds,
  countScheduledVideoConferencesByTrainingIds,
} from "@/lib/infrastructure/db/repositories/module-repository";

type TrainerVideoConferencePageProps = {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
  }>;
};

export default async function TrainerVideoConferencePage({
  searchParams,
}: TrainerVideoConferencePageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const params = await searchParams;
  const result = await listTrainings(user, {
    search: params.search,
    status: params.status,
    page: params.page,
    pageSize: 10,
  });

  if (!result.success) {
    redirect("/unauthorized");
  }

  const { items, page, totalPages, total } = result.data;
  const trainingIds = items.map((training) => training.id);
  const [moduleCounts, scheduledCounts] = await Promise.all([
    countModulesByTrainingIds(trainingIds),
    countScheduledVideoConferencesByTrainingIds(trainingIds),
  ]);

  const rows = items.map((training) => ({
    ...training,
    moduleCount: moduleCounts[training.id] ?? 0,
    scheduledCount: scheduledCounts[training.id] ?? 0,
  }));

  return (
    <>
      <TrainerHeader
        title="Video Conference"
        breadcrumbs={[{ label: "Video Conference" }]}
        user={user}
      />
      <main className="flex-1 overflow-auto">
        <div className="container max-w-7xl min-w-0 space-y-6 p-4 sm:p-6 md:p-8">
          <AdminPageHeader
            title="Kelola Video Conference"
            description="Pilih training, tentukan modul, lalu atur link dan jadwal video conference."
          />

          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                <TrainingsFilters
                  search={params.search}
                  status={params.status}
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
                    message:
                      "Belum ada training. Buat training terlebih dahulu.",
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
                      header: "Modul",
                      cell: (training) => (
                        <Badge variant="secondary">
                          {training.moduleCount} modul
                        </Badge>
                      ),
                    },
                    {
                      id: "scheduled",
                      header: "VC Terjadwal",
                      cell: (training) =>
                        training.scheduledCount > 0 ? (
                          <Badge variant="secondary">
                            {training.scheduledCount} jadwal
                          </Badge>
                        ) : (
                          <Badge variant="outline">Belum dijadwalkan</Badge>
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
                          href={`/trainer/video-conference/${training.id}`}
                        >
                          Atur Video Conference
                        </ButtonLink>
                      ),
                    },
                  ]}
                />

                <TrainingsPagination
                  page={page}
                  totalPages={totalPages}
                  basePath="/trainer/video-conference"
                  searchParams={{
                    search: params.search,
                    status: params.status,
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
