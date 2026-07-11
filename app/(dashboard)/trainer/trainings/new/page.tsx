import { redirect } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { TrainerHeader } from "@/components/trainer/trainer-header";
import { TrainingCreateForm } from "@/components/trainings/training-create-form";
import { TrainingsFilters } from "@/components/trainings/trainings-filters";
import { TrainingsPagination } from "@/components/trainings/trainings-pagination";
import { TrainingStatusBadge } from "@/components/trainings/training-status-badge";
import { ButtonLink } from "@/components/ui/button-link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { getCurrentUser } from "@/lib/application/auth/get-session";
import { listTrainings } from "@/lib/application/trainings/list-trainings";

type TrainerTrainingsNewPageProps = {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
  }>;
};

export default async function TrainerTrainingsNewPage({
  searchParams,
}: TrainerTrainingsNewPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "admin" && user.role !== "trainer") {
    redirect("/unauthorized");
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

  return (
    <>
      <TrainerHeader
        title="Buat Training"
        breadcrumbs={[{ label: "Buat Training" }]}
        user={user}
      />
      <main className="flex-1 overflow-auto">
        <div className="container max-w-7xl space-y-6 p-6 md:p-8">
          <AdminPageHeader
            title="Buat & Pengaturan Training"
            description="Buat program training baru atau kelola detail, enrollment, dan pengaturan training yang sudah ada."
          />

          <Card className="overflow-hidden">
            <CardHeader className="border-b bg-muted/30">
              <CardTitle className="text-lg">Buat Training Baru</CardTitle>
              <CardDescription>
                Lengkapi informasi dasar program. Setelah dibuat, Anda dapat
                mengatur modul, enrollment, dan status publikasi.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <TrainingCreateForm />
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="border-b bg-muted/30">
              <CardTitle className="text-lg">Pengaturan Training</CardTitle>
              <CardDescription>
                Cari dan kelola training yang sudah ada tanpa meninggalkan
                halaman ini.
              </CardDescription>
            </CardHeader>
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
                      {items.length}
                    </span>{" "}
                    dari{" "}
                    <span className="font-medium text-foreground">{total}</span>{" "}
                    training
                  </p>
                </div>

                <DataTable
                  data={items}
                  getRowKey={(training) => training.id}
                  emptyState={{
                    message:
                      "Belum ada training. Isi form di atas untuk membuat training pertama.",
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
                      id: "passingGrade",
                      header: "Passing Grade",
                      cell: (training) => `${training.passingGrade}%`,
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
                          href={`/trainer/trainings/${training.id}/edit`}
                        >
                          Pengaturan
                        </ButtonLink>
                      ),
                    },
                  ]}
                />

                <TrainingsPagination
                  page={page}
                  totalPages={totalPages}
                  basePath="/trainer/trainings/new"
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
