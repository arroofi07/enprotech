import { redirect } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StudentHeader } from "@/components/student/student-header";
import { StudentTrainingCard } from "@/components/trainings/student-training-card";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/application/auth/get-session";
import { listEnrolledTrainings } from "@/lib/application/trainings/list-enrolled-trainings";
import { formatUserDisplayName } from "@/lib/domain/users/format-display-name";

export default async function StudentDashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const result = await listEnrolledTrainings(user);

  if (!result.success) {
    redirect("/unauthorized");
  }

  const trainings = result.data;

  return (
    <>
      <StudentHeader title="Dashboard" />
      <main className="flex-1 overflow-auto">
        <div className="container max-w-7xl space-y-6 p-6 md:p-8">
          <AdminPageHeader
            title="Dashboard Student"
            description="Ikuti training, kerjakan quiz, dan pantau progress Anda."
          />
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">
                Selamat datang,{" "}
                <span className="font-medium text-foreground">
                  {formatUserDisplayName(user)}
                </span>
                . Berikut ringkasan progress training yang sedang Anda ikuti.
              </p>
            </CardContent>
          </Card>

          {trainings.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-sm text-muted-foreground">
                Anda belum terdaftar di training manapun.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {trainings.map((training) => (
                <StudentTrainingCard key={training.id} training={training} />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
