import { redirect } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StudentModuleCard } from "@/components/modules/student-module-card";
import { StudentModuleCardGrid } from "@/components/modules/student-module-card-grid";
import { StudentHeader } from "@/components/student/student-header";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent } from "@/components/ui/card";
import { ListPagination } from "@/components/ui/list-pagination";
import { getCurrentUser } from "@/lib/application/auth/get-session";
import { listStudentModules } from "@/lib/application/modules/list-student-modules";
import { getStudentTrainingFlowState } from "@/lib/application/training-flow/get-student-training-flow-state";
import { listEnrolledTrainings } from "@/lib/application/trainings/list-enrolled-trainings";

const PAGE_SIZE = 10;

type StudentModulesPageProps = {
  searchParams: Promise<{ page?: string }>;
};

export default async function StudentModulesPage({
  searchParams,
}: StudentModulesPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const params = await searchParams;
  const page = Number(params.page ?? "1");
  const result = await listEnrolledTrainings(user, {
    page,
    pageSize: PAGE_SIZE,
  });

  if (!result.success) {
    redirect("/unauthorized");
  }

  const { items: trainings, total, totalPages } = result.data;

  const modulesByTraining = await Promise.all(
    trainings.map(async (training) => {
      const [modulesResult, flow] = await Promise.all([
        listStudentModules(user, { trainingId: training.id }),
        getStudentTrainingFlowState(user.id, training.id),
      ]);

      return {
        training,
        modules: modulesResult.success ? modulesResult.data : [],
        preTestLocked: !(flow?.canAccessModules ?? false),
      };
    }),
  );

  const items = modulesByTraining.filter((entry) => entry.modules.length > 0);
  const totalModules = items.reduce(
    (sum, entry) => sum + entry.modules.length,
    0,
  );

  return (
    <>
      <StudentHeader title="Modul" breadcrumbs={[{ label: "Modul" }]} />
      <main className="flex-1 overflow-auto">
        <div className="container max-w-7xl space-y-6 p-6 md:p-8">
          <AdminPageHeader
            title="Modul Pembelajaran"
            description="Pilih modul dari daftar untuk membuka materi pembelajaran."
            actions={
              <ButtonLink variant="outline" href="/student/dashboard">
                Kembali ke Dashboard
              </ButtonLink>
            }
          />

          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Menampilkan{" "}
                    <span className="font-medium text-foreground">
                      {totalModules}
                    </span>{" "}
                    modul dari{" "}
                    <span className="font-medium text-foreground">{total}</span>{" "}
                    training
                  </p>
                </div>

                {items.length === 0 ? (
                  <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                    Belum ada modul tersedia untuk training yang Anda ikuti.
                  </p>
                ) : (
                  <div className="space-y-8">
                    {items.map(({ training, modules, preTestLocked }) => (
                      <section key={training.id} className="space-y-4">
                        <div>
                          <h3 className="text-base font-semibold">
                            {training.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {modules.length} modul tersedia
                          </p>
                        </div>
                        <StudentModuleCardGrid>
                          {modules.map((module) => (
                            <StudentModuleCard
                              key={module.id}
                              module={module}
                              trainingId={training.id}
                              preTestLocked={preTestLocked}
                            />
                          ))}
                        </StudentModuleCardGrid>
                      </section>
                    ))}
                  </div>
                )}

                <ListPagination
                  page={page}
                  totalPages={totalPages}
                  basePath="/student/modules"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
