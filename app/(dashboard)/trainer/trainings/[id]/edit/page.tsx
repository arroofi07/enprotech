import { redirect } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { TrainerHeader } from "@/components/trainer/trainer-header";
import { TrainingEditPanel } from "@/components/trainings/training-edit-panel";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/application/auth/get-session";
import { getTraining } from "@/lib/application/trainings/get-training";
import { listEnrollableStudents } from "@/lib/application/trainings/list-enrollable-students";

type TrainerTrainingEditPageProps = {
  params: Promise<{ id: string }>;
};

export default async function TrainerTrainingEditPage({
  params,
}: TrainerTrainingEditPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { id } = await params;
  const [trainingResult, studentsResult] = await Promise.all([
    getTraining(user, { trainingId: id }),
    listEnrollableStudents(user),
  ]);

  if (!trainingResult.success) {
    redirect("/unauthorized");
  }

  const availableStudents = studentsResult.success ? studentsResult.data : [];

  return (
    <>
      <TrainerHeader
        title={trainingResult.data.title}
        breadcrumbs={[
          { label: "Training", href: "/trainer/trainings" },
          { label: trainingResult.data.title },
        ]}
        user={user}
      />
      <main className="flex-1 overflow-auto">
        <div className="container max-w-5xl space-y-6 p-6 md:p-8">
          <AdminPageHeader
            title={trainingResult.data.title}
            description="Edit detail, kelola enrollment, dan pengaturan training."
          />

          <Card>
            <CardContent className="p-6">
              <TrainingEditPanel
                training={trainingResult.data}
                availableStudents={availableStudents}
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
