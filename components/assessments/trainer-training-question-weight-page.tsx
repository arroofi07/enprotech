import { redirect } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { TrainingQuestionWeightPanel } from "@/components/assessments/training-question-weight-panel";
import { TrainerHeader } from "@/components/trainer/trainer-header";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/application/auth/get-session";
import { listTrainingQuestionWeights } from "@/lib/application/assessments/list-training-question-weights";

type TrainerTrainingQuestionWeightPageProps = {
  params: Promise<{ id: string }>;
};

export async function TrainerTrainingQuestionWeightPage({
  params,
}: TrainerTrainingQuestionWeightPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { id } = await params;
  const result = await listTrainingQuestionWeights(user, { trainingId: id });

  if (!result.success) {
    redirect("/unauthorized");
  }

  const { trainingTitle, rows } = result.data;

  return (
    <>
      <TrainerHeader
        title={`Bobot Soal — ${trainingTitle}`}
        breadcrumbs={[
          { label: "Bobot Soal", href: "/trainer/bobot-soal" },
          { label: trainingTitle },
        ]}
        user={user}
      />
      <main className="flex-1 overflow-auto">
        <div className="container max-w-7xl space-y-6 p-6 md:p-8">
          <AdminPageHeader
            title="Kelola Bobot Soal"
            description={`Tentukan nilai satu jawaban benar untuk setiap pre-test, post-test, quiz, dan latihan pada training "${trainingTitle}". Contoh: 40 soal dengan bobot 2.5 menghasilkan nilai penuh 100. Kosongkan untuk menilai rata otomatis.`}
            actions={
              <ButtonLink variant="outline" href="/trainer/bobot-soal">
                Kembali ke Daftar Training
              </ButtonLink>
            }
          />

          <Card>
            <CardContent className="p-6">
              <TrainingQuestionWeightPanel trainingId={id} rows={rows} />
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
