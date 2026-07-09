import { redirect } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ModuleManagementPanel } from "@/components/modules/module-management-panel";
import { TrainerHeader } from "@/components/trainer/trainer-header";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/application/auth/get-session";
import { listModules } from "@/lib/application/modules/list-modules";
import { getTraining } from "@/lib/application/trainings/get-training";
import type { ModuleWithContents } from "@/lib/infrastructure/db/repositories/module-repository";

const PAGE_SIZE = 10;

type TrainerModulesPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    page?: string;
    search?: string;
  }>;
};

function filterModules(
  modules: ModuleWithContents[],
  search?: string,
): ModuleWithContents[] {
  const query = search?.trim().toLowerCase();
  if (!query) {
    return modules;
  }

  return modules.filter(
    (module) =>
      module.title.toLowerCase().includes(query) ||
      (module.description?.toLowerCase().includes(query) ?? false),
  );
}

function paginateModules(
  modules: ModuleWithContents[],
  page: number,
  pageSize: number,
) {
  const total = modules.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const offset = (safePage - 1) * pageSize;

  return {
    items: modules.slice(offset, offset + pageSize),
    page: safePage,
    totalPages,
    total,
  };
}

export default async function TrainerModulesPage({
  params,
  searchParams,
}: TrainerModulesPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { id } = await params;
  const query = await searchParams;
  const requestedPage = Number(query.page ?? "1");

  const [trainingResult, modulesResult] = await Promise.all([
    getTraining(user, { trainingId: id }),
    listModules(user, { trainingId: id }),
  ]);

  if (!trainingResult.success) {
    redirect("/unauthorized");
  }

  const allModules = modulesResult.success ? modulesResult.data : [];
  const filteredModules = filterModules(allModules, query.search);
  const { items, page, totalPages, total } = paginateModules(
    filteredModules,
    Number.isFinite(requestedPage) ? requestedPage : 1,
    PAGE_SIZE,
  );

  return (
    <>
      <TrainerHeader
        title={`Modul — ${trainingResult.data.title}`}
        breadcrumbs={[
          { label: "Training", href: "/trainer/trainings" },
          {
            label: trainingResult.data.title,
            href: `/trainer/trainings/${id}/edit`,
          },
          { label: "Modul" },
        ]}
        user={user}
      />
      <main className="flex-1 overflow-auto">
        <div className="container max-w-7xl space-y-6 p-6 md:p-8">
          <AdminPageHeader
            title="Kelola Modul"
            description={`Kelola modul, materi, dan konten untuk training "${trainingResult.data.title}".`}
            actions={
              <ButtonLink variant="outline" href={`/trainer/trainings/${id}/edit`}>
                Kembali ke Training
              </ButtonLink>
            }
          />

          <Card>
            <CardContent className="p-6">
              <ModuleManagementPanel
                trainingId={id}
                modules={items}
                allModules={filteredModules}
                page={page}
                totalPages={totalPages}
                total={total}
                search={query.search}
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
