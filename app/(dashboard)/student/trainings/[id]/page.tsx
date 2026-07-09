import { redirect } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StudentModuleCard } from "@/components/modules/student-module-card";
import { StudentHeader } from "@/components/student/student-header";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/application/auth/get-session";
import { listStudentModules } from "@/lib/application/modules/list-student-modules";
import { listEnrolledTrainings } from "@/lib/application/trainings/list-enrolled-trainings";

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
  const [modulesResult, trainingsResult] = await Promise.all([
    listStudentModules(user, { trainingId: id }),
    listEnrolledTrainings(user),
  ]);

  if (!modulesResult.success) {
    redirect("/unauthorized");
  }

  const training = trainingsResult.success
    ? trainingsResult.data.find((item) => item.id === id)
    : undefined;

  return (
    <>
      <StudentHeader
        title={training?.title ?? "Modul Training"}
        breadcrumbs={[
          { label: "Training Saya", href: "/student/trainings" },
          { label: training?.title ?? "Modul" },
        ]}
      />
      <main className="flex-1 overflow-auto">
        <div className="container max-w-7xl space-y-6 p-6 md:p-8">
          <AdminPageHeader
            title={training?.title ?? "Modul Training"}
            description="Akses materi pembelajaran per modul."
            actions={
              <ButtonLink variant="outline" href="/student/trainings">
                Kembali
              </ButtonLink>
            }
          />

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
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
