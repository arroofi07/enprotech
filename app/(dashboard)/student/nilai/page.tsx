import { redirect } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StudentTrainingScoresSection } from "@/components/progress/student-training-scores-section";
import { StudentHeader } from "@/components/student/student-header";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/application/auth/get-session";
import { listStudentTrainingScores } from "@/lib/application/progress/list-student-training-scores";

export default async function StudentNilaiPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const result = await listStudentTrainingScores(user);
  if (!result.success) {
    redirect("/unauthorized");
  }

  const scores = result.data;

  return (
    <>
      <StudentHeader title="Nilai" breadcrumbs={[{ label: "Nilai" }]} />
      <main className="flex-1 overflow-auto">
        <div className="container max-w-7xl space-y-6 p-6 md:p-8">
          <AdminPageHeader
            title="Nilai Saya"
            description="Lihat nilai pre-test, quiz, latihan, dan post-test untuk setiap training yang Anda ikuti."
          />

          {scores.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-sm text-muted-foreground">
                Anda belum terdaftar di training manapun.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {scores.map((progress) => (
                <StudentTrainingScoresSection
                  key={progress.trainingId}
                  progress={progress}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
