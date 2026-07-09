import { redirect } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ExcelImportWizard } from "@/components/imports/excel-import-wizard";
import { TrainerHeader } from "@/components/trainer/trainer-header";
import { getCurrentUser } from "@/lib/application/auth/get-session";
import { listTrainings } from "@/lib/application/trainings/list-trainings";

export default async function TrainerImportPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const trainingsResult = await listTrainings(user, {
    page: 1,
    pageSize: 100,
  });

  if (!trainingsResult.success) {
    redirect("/unauthorized");
  }

  const trainings = trainingsResult.data.items.map((training) => ({
    id: training.id,
    title: training.title,
  }));

  return (
    <>
      <TrainerHeader
        title="Import Excel"
        breadcrumbs={[{ label: "Import Excel" }]}
        user={user}
      />
      <main className="flex-1 overflow-auto">
        <div className="container max-w-6xl space-y-6 p-6 md:p-8">
          <AdminPageHeader
            title="Import Data Excel"
            description="Upload, preview, dan import data soal, enrollment, atau nilai dari file Excel."
          />

          <div className="space-y-6">
            <ExcelImportWizard kind="questions" trainings={trainings} />
            <ExcelImportWizard kind="enrollments" trainings={trainings} />
            <ExcelImportWizard kind="scores" trainings={trainings} />
          </div>
        </div>
      </main>
    </>
  );
}
