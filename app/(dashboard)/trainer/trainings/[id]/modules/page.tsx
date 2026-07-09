import { redirect } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ModuleManagementPanel } from "@/components/modules/module-management-panel";
import { TrainerHeader } from "@/components/trainer/trainer-header";
import { ButtonLink } from "@/components/ui/button-link";
import { getCurrentUser } from "@/lib/application/auth/get-session";
import { getTraining } from "@/lib/application/trainings/get-training";
import { listModules } from "@/lib/application/modules/list-modules";

type TrainerModulesPageProps = {
  params: Promise<{ id: string }>;
};

export default async function TrainerModulesPage({
  params,
}: TrainerModulesPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { id } = await params;
  const [trainingResult, modulesResult] = await Promise.all([
    getTraining(user, { trainingId: id }),
    listModules(user, { trainingId: id }),
  ]);

  if (!trainingResult.success) {
    redirect("/unauthorized");
  }

  const modules = modulesResult.success ? modulesResult.data : [];

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
        <div className="container max-w-5xl space-y-6 p-6 md:p-8">
          <AdminPageHeader
            title="Manajemen Modul"
            description={`Kelola modul dan konten untuk training "${trainingResult.data.title}".`}
            actions={
              <ButtonLink variant="outline" href={`/trainer/trainings/${id}/edit`}>
                Kembali ke Training
              </ButtonLink>
            }
          />

          <ModuleManagementPanel trainingId={id} modules={modules} />
        </div>
      </main>
    </>
  );
}
