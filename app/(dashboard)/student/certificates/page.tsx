import { redirect } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StudentHeader } from "@/components/student/student-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/application/auth/get-session";
import { getStudentTrainingFlowState } from "@/lib/application/training-flow/get-student-training-flow-state";
import { listEnrolledTrainings } from "@/lib/application/trainings/list-enrolled-trainings";

export default async function StudentCertificatesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const trainingsResult = await listEnrolledTrainings(user);
  const trainings = trainingsResult.success ? trainingsResult.data : [];

  const eligible = await Promise.all(
    trainings.map(async (training) => {
      const flow = await getStudentTrainingFlowState(user.id, training.id);
      return flow?.canAccessCertificate
        ? { training, flow }
        : null;
    }),
  );

  const eligibleTrainings = eligible.filter(
    (item): item is NonNullable<typeof item> => item !== null,
  );

  return (
    <>
      <StudentHeader title="Sertifikat" breadcrumbs={[{ label: "Sertifikat" }]} />
      <main className="flex-1 overflow-auto">
        <div className="container max-w-4xl space-y-6 p-6 md:p-8">
          <AdminPageHeader
            title="Sertifikat"
            description="Sertifikat tersedia setelah lulus post-test training."
          />

          {eligibleTrainings.length === 0 ? (
            <Card>
              <CardContent className="space-y-3 p-6">
                <Alert>
                  <AlertDescription>
                    Belum ada sertifikat. Selesaikan semua modul dan lulus
                    post-test untuk mendapatkan sertifikat.
                  </AlertDescription>
                </Alert>
                <ButtonLink href="/student/post-test">Lihat Post-Test</ButtonLink>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {eligibleTrainings.map(({ training, flow }) => (
                <Card key={training.id}>
                  <CardContent className="space-y-2 p-6">
                    <h3 className="font-semibold">{training.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Pre-test: {flow.pretestBestScore ?? 0}% · Post-test:{" "}
                      {flow.postTestBestScore ?? 0}%
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Anda memenuhi syarat sertifikat. Fitur download PDF akan
                      tersedia di T10.
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
