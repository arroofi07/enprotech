import { redirect } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { TrainerHeader } from "@/components/trainer/trainer-header";
import { TrainingCreateForm } from "@/components/trainings/training-create-form";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/application/auth/get-session";

export default async function TrainerTrainingsNewPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "admin" && user.role !== "trainer") {
    redirect("/unauthorized");
  }

  return (
    <>
      <TrainerHeader
        title="Buat Training"
        breadcrumbs={[
          { label: "Training", href: "/trainer/trainings" },
          { label: "Buat Baru" },
        ]}
        user={user}
      />
      <main className="flex-1 overflow-auto">
        <div className="container max-w-3xl space-y-6 p-6 md:p-8">
          <AdminPageHeader
            title="Buat Training Baru"
            description="Training baru akan dibuat dengan status draft."
          />

          <Card>
            <CardContent className="p-6">
              <TrainingCreateForm />
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
