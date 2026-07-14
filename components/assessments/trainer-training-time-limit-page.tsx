import { redirect } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { TrainingTimeLimitPanel } from "@/components/assessments/training-time-limit-panel";
import { TrainerHeader } from "@/components/trainer/trainer-header";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/application/auth/get-session";
import { listTrainingTimeLimits } from "@/lib/application/assessments/list-training-time-limits";

type TrainerTrainingTimeLimitPageProps = {
  params: Promise<{ id: string }>;
};

export async function TrainerTrainingTimeLimitPage({
  params,
}: TrainerTrainingTimeLimitPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { id } = await params;
  const result = await listTrainingTimeLimits(user, { trainingId: id });

  if (!result.success) {
    redirect("/unauthorized");
  }

  const { trainingTitle, rows } = result.data;

  return (
    <>
      <TrainerHeader
        title={`Batas Waktu — ${trainingTitle}`}
        breadcrumbs={[
          { label: "Batas Waktu", href: "/trainer/waktu-ujian" },
          { label: trainingTitle },
        ]}
        user={user}
      />
      <main className="flex-1 overflow-auto">
        <div className="container max-w-7xl space-y-6 p-6 md:p-8">
          <AdminPageHeader
            title="Kelola Batas Waktu"
            description={`Atur batas waktu pengerjaan untuk setiap pre-test, post-test, quiz, dan latihan pada training "${trainingTitle}". Kosongkan untuk tanpa batas waktu.`}
            actions={
              <ButtonLink variant="outline" href="/trainer/waktu-ujian">
                Kembali ke Daftar Training
              </ButtonLink>
            }
          />

          <Card>
            <CardContent className="p-6">
              <TrainingTimeLimitPanel trainingId={id} rows={rows} />
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
