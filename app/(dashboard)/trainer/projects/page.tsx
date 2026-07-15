import { redirect } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ProjectsFilters } from "@/components/projects/projects-filters";
import { ProjectsTable } from "@/components/projects/projects-table";
import { TrainerHeader } from "@/components/trainer/trainer-header";
import { Card, CardContent } from "@/components/ui/card";
import { ListPagination } from "@/components/ui/list-pagination";
import { getCurrentUser } from "@/lib/application/auth/get-session";
import { listProjects } from "@/lib/application/projects/list-projects";
import { listTrainingFilterOptions } from "@/lib/infrastructure/db/repositories/report-repository";

type TrainerProjectsPageProps = {
  searchParams: Promise<{
    search?: string;
    trainingId?: string;
    page?: string;
  }>;
};

export default async function TrainerProjectsPage({
  searchParams,
}: TrainerProjectsPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const params = await searchParams;
  const [result, trainings] = await Promise.all([
    listProjects(user, {
      search: params.search,
      trainingId: params.trainingId,
      page: params.page,
      pageSize: 10,
    }),
    listTrainingFilterOptions(),
  ]);

  if (!result.success) {
    redirect("/unauthorized");
  }

  const { items, page, totalPages, total } = result.data;
  const filterParams = {
    search: params.search,
    trainingId: params.trainingId,
  };

  return (
    <>
      <TrainerHeader
        title="Project"
        breadcrumbs={[{ label: "Project" }]}
        user={user}
      />
      <main className="flex-1 overflow-auto">
        <div className="container max-w-7xl min-w-0 space-y-6 p-4 sm:p-6 md:p-8">
          <AdminPageHeader
            title="Project Peserta"
            description="Lihat project (gambar, link video, dan file PDF) yang dikumpulkan peserta."
          />

          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                <ProjectsFilters
                  search={params.search}
                  trainingId={params.trainingId}
                  trainings={trainings}
                />

                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Menampilkan{" "}
                    <span className="font-medium text-foreground">
                      {items.length}
                    </span>{" "}
                    dari{" "}
                    <span className="font-medium text-foreground">{total}</span>{" "}
                    project
                  </p>
                </div>

                <ProjectsTable projects={items} />

                <ListPagination
                  page={page}
                  totalPages={totalPages}
                  basePath="/trainer/projects"
                  searchParams={filterParams}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
