import { redirect } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StudentHeader } from "@/components/student/student-header";
import { TrainerHeader } from "@/components/trainer/trainer-header";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/application/auth/get-session";
import { getStudentTrainingFlowState } from "@/lib/application/training-flow/get-student-training-flow-state";
import { listEnrolledTrainings } from "@/lib/application/trainings/list-enrolled-trainings";
import { listTrainings } from "@/lib/application/trainings/list-trainings";
import { getAssessmentTypeLabel } from "@/lib/domain/assessments/labels";
import type { TrainingAssessmentType } from "@/lib/domain/assessments/types";

type TrainingAssessmentHubPageProps = {
  assessmentType: TrainingAssessmentType;
  role: "student" | "trainer";
};

function getAssessmentPath(
  role: "student" | "trainer",
  trainingId: string,
  type: TrainingAssessmentType,
): string {
  const segment = type === "pre_test" ? "pre-test" : "post-test";
  return `/${role}/trainings/${trainingId}/${segment}`;
}

export async function TrainingAssessmentHubPage({
  assessmentType,
  role,
}: TrainingAssessmentHubPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const typeLabel = getAssessmentTypeLabel(assessmentType);

  if (role === "student") {
    const trainingsResult = await listEnrolledTrainings(user);
    const trainings = trainingsResult.success ? trainingsResult.data : [];

    const items = await Promise.all(
      trainings.map(async (training) => {
        const flow = await getStudentTrainingFlowState(user.id, training.id);
        return { training, flow };
      }),
    );

    return (
      <>
        <StudentHeader title={typeLabel} breadcrumbs={[{ label: typeLabel }]} />
        <main className="flex-1 overflow-auto">
          <div className="container max-w-4xl space-y-6 p-6 md:p-8">
            <AdminPageHeader
              title={typeLabel}
              description={`Daftar training dan status ${typeLabel.toLowerCase()} Anda.`}
            />

            {items.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-sm text-muted-foreground">
                  Anda belum terdaftar di training manapun.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {items.map(({ training, flow }) => {
                  const status =
                    assessmentType === "pre_test"
                      ? !flow?.isPretestActive
                        ? "Belum Aktif"
                        : flow.hasCompletedPretest
                          ? `Selesai · ${flow.pretestBestScore ?? 0}%`
                          : "Belum Dikerjakan"
                      : !flow?.allModulesCompleted
                        ? "Terkunci"
                        : flow.hasPassedPostTest
                          ? `Lulus · ${flow.postTestBestScore ?? 0}%`
                          : flow.postTestBestScore !== null &&
                              flow.postTestBestScore > 0
                            ? `Belum Lulus · ${flow.postTestBestScore}%`
                            : "Siap Dikerjakan";

                  const canOpen =
                    assessmentType === "pre_test"
                      ? flow?.isPretestActive
                      : flow?.allModulesCompleted;

                  return (
                    <Card key={training.id}>
                      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
                        <div className="space-y-1">
                          <CardTitle className="text-base">
                            {training.title}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {status}
                          </p>
                        </div>
                        <Badge variant="secondary">{typeLabel}</Badge>
                      </CardHeader>
                      <CardContent>
                        {canOpen ? (
                          <ButtonLink
                            href={getAssessmentPath(
                              "student",
                              training.id,
                              assessmentType,
                            )}
                          >
                            Buka {typeLabel}
                          </ButtonLink>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            {assessmentType === "pre_test"
                              ? "Pre-test belum diaktifkan oleh trainer."
                              : "Selesaikan semua modul terlebih dahulu."}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </>
    );
  }

  const trainingsResult = await listTrainings(user, {
    page: 1,
    pageSize: 100,
  });
  const trainings = trainingsResult.success ? trainingsResult.data.items : [];

  return (
    <>
      <TrainerHeader
        title={typeLabel}
        breadcrumbs={[{ label: typeLabel }]}
        user={user}
      />
      <main className="flex-1 overflow-auto">
        <div className="container max-w-4xl space-y-6 p-6 md:p-8">
          <AdminPageHeader
            title={`Kelola ${typeLabel}`}
            description={`Pilih training untuk mengelola soal ${typeLabel.toLowerCase()}.`}
          />

          {trainings.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-sm text-muted-foreground">
                Belum ada training. Buat training terlebih dahulu.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {trainings.map((training) => (
                <Card key={training.id}>
                  <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
                    <div className="space-y-1">
                      <CardTitle className="text-base">{training.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Status: {training.status}
                        {assessmentType === "pre_test"
                          ? training.isPretestActive
                            ? " · Pre-test aktif"
                            : " · Pre-test belum aktif"
                          : null}
                      </p>
                    </div>
                    <Badge variant="secondary">{typeLabel}</Badge>
                  </CardHeader>
                  <CardContent>
                    <ButtonLink
                      href={getAssessmentPath("trainer", training.id, assessmentType)}
                    >
                      Kelola {typeLabel}
                    </ButtonLink>
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
