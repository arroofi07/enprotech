import { redirect } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { TrainingProgressModules } from "@/components/progress/training-progress-modules";
import { TrainingProgressOverview } from "@/components/progress/training-progress-overview";
import { StudentModuleCard } from "@/components/modules/student-module-card";
import { StudentHeader } from "@/components/student/student-header";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/application/auth/get-session";
import { listStudentModules } from "@/lib/application/modules/list-student-modules";
import { getStudentTrainingProgress } from "@/lib/application/progress/get-student-training-progress";

type StudentTrainingModulesPageProps = {
  params: Promise<{ id: string }>;
};

export default async function StudentTrainingModulesPage({
  params,
}: StudentTrainingModulesPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { id } = await params;
  const [modulesResult, progressResult] = await Promise.all([
    listStudentModules(user, { trainingId: id }),
    getStudentTrainingProgress(user, { trainingId: id }),
  ]);

  if (!modulesResult.success || !progressResult.success) {
    redirect("/unauthorized");
  }

  const progress = progressResult.data;
  const modulesLocked = !progress.isPretestActive || progress.summary.preTest.status !== "passed";

  return (
    <>
      <StudentHeader
        title={progress.trainingTitle}
        breadcrumbs={[
          { label: "Training Saya", href: "/student/modules" },
          { label: progress.trainingTitle },
        ]}
      />
      <main className="flex-1 overflow-auto">
        <div className="container max-w-7xl space-y-6 p-6 md:p-8">
          <AdminPageHeader
            title={progress.trainingTitle}
            description="Pantau progress pembelajaran dan akses modul training."
            actions={
              <ButtonLink variant="outline" href="/student/modules">
                Kembali
              </ButtonLink>
            }
          />

          <TrainingProgressOverview trainingId={id} progress={progress} />

          <TrainingProgressModules
            trainingId={id}
            modules={progress.modules}
            locked={modulesLocked}
          />

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold">Modul Pembelajaran</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Akses materi pembelajaran per modul.
              </p>
            </div>

            {modulesResult.data.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-sm text-muted-foreground">
                  Belum ada modul tersedia untuk training ini.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {modulesResult.data.map((module) => (
                  <StudentModuleCard
                    key={module.id}
                    module={module}
                    trainingId={id}
                    locked={modulesLocked}
                    progressItem={progress.modules.find(
                      (item) => item.id === module.id,
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
