import { redirect } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ModuleAssessmentHubFilters } from "@/components/assessments/module-assessment-hub-filters";
import { ModuleAssessmentHubTable } from "@/components/assessments/module-assessment-hub-table";
import { TrainerHeader } from "@/components/trainer/trainer-header";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent } from "@/components/ui/card";
import { ListPagination } from "@/components/ui/list-pagination";
import { getCurrentUser } from "@/lib/application/auth/get-session";
import { listModuleAssessmentHubItems } from "@/lib/application/assessments/list-module-assessment-hub";
import { getTraining } from "@/lib/application/trainings/get-training";
import { getAssessmentTypeLabel } from "@/lib/domain/assessments/labels";
import type { ModuleAssessmentType } from "@/lib/domain/assessments/types";

const PAGE_SIZE = 10;

type TrainerTrainingModuleAssessmentHubPageProps = {
  type: ModuleAssessmentType;
  params: Promise<{ id: string }>;
  searchParams?: Promise<{
    page?: string;
    search?: string;
  }>;
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

export async function TrainerTrainingModuleAssessmentHubPage({
  type,
  params,
  searchParams,
}: TrainerTrainingModuleAssessmentHubPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { id } = await params;
  const query = searchParams ? await searchParams : {};
  const typeLabel = getAssessmentTypeLabel(type);
  const hubBasePath = getHubBasePath(type);
  const trainingAssessmentPath = getTrainingAssessmentPath(type, id);
  const page = Number(query.page ?? "1");

  const [trainingResult, result] = await Promise.all([
    getTraining(user, { trainingId: id }),
    listModuleAssessmentHubItems(user, {
      type,
      trainingId: id,
      search: query.search,
      page,
      pageSize: PAGE_SIZE,
    }),
  ]);

  if (!trainingResult.success || !result.success) {
    redirect("/unauthorized");
  }

  const { items, total, page: currentPage, totalPages } = result.data;

  return (
    <>
      <TrainerHeader
        title={`${typeLabel} — ${trainingResult.data.title}`}
        breadcrumbs={[
          { label: typeLabel, href: hubBasePath },
          { label: trainingResult.data.title },
        ]}
        user={user}
      />
      <main className="flex-1 overflow-auto">
        <div className="container max-w-7xl space-y-6 p-6 md:p-8">
          <AdminPageHeader
            title={`Kelola ${typeLabel}`}
            description={`Pilih modul untuk mengelola soal ${typeLabel.toLowerCase()} pada training "${trainingResult.data.title}".`}
            actions={
              <ButtonLink variant="outline" href={hubBasePath}>
                Kembali ke Daftar Training
              </ButtonLink>
            }
          />

          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                <ModuleAssessmentHubFilters
                  search={query.search}
                  searchLabel="Cari Modul"
                  searchPlaceholder="Cari nama modul..."
                />

                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Menampilkan{" "}
                    <span className="font-medium text-foreground">
                      {items.length}
                    </span>{" "}
                    dari{" "}
                    <span className="font-medium text-foreground">{total}</span>{" "}
                    modul
                  </p>
                </div>

                <ModuleAssessmentHubTable
                  type={type}
                  items={items}
                  showTrainingColumn={false}
                />

                <ListPagination
                  page={currentPage}
                  totalPages={totalPages}
                  basePath={trainingAssessmentPath}
                  searchParams={{ search: query.search }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
