import { redirect } from "next/navigation";
import { IconMessage2 } from "@tabler/icons-react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StudentHeader } from "@/components/student/student-header";
import { ButtonLink } from "@/components/ui/button-link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ListPagination } from "@/components/ui/list-pagination";
import { getCurrentUser } from "@/lib/application/auth/get-session";
import { listStudentFeedback } from "@/lib/application/feedback/get-student-feedback";
import { listEnrolledTrainings } from "@/lib/application/trainings/list-enrolled-trainings";

const PAGE_SIZE = 10;

type StudentFeedbackPageProps = {
  searchParams: Promise<{ page?: string }>;
};

export default async function StudentFeedbackPage({
  searchParams,
}: StudentFeedbackPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const params = await searchParams;
  const page = Number(params.page ?? "1");

  const [trainingsResult, feedbackResult] = await Promise.all([
    listEnrolledTrainings(user, { page, pageSize: PAGE_SIZE }),
    listStudentFeedback(user),
  ]);

  if (!trainingsResult.success || !feedbackResult.success) {
    redirect("/unauthorized");
  }

  const { items: trainings, total, totalPages } = trainingsResult.data;
  const feedbackByTraining = new Map(
    feedbackResult.data.map((feedback) => [feedback.trainingId, feedback]),
  );

  return (
    <>
      <StudentHeader title="Feedback" breadcrumbs={[{ label: "Feedback" }]} />
      <main className="flex-1 overflow-auto">
        <div className="container max-w-7xl space-y-6 p-6 md:p-8">
          <AdminPageHeader
            title="Feedback Saya"
            description="Berikan penilaian dan masukan untuk setiap training yang Anda ikuti."
            actions={
              <ButtonLink variant="outline" href="/student/dashboard">
                Kembali ke Dashboard
              </ButtonLink>
            }
          />

          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                <p className="text-sm text-muted-foreground">
                  Menampilkan{" "}
                  <span className="font-medium text-foreground">
                    {trainings.length}
                  </span>{" "}
                  dari{" "}
                  <span className="font-medium text-foreground">{total}</span>{" "}
                  training
                </p>

                {trainings.length === 0 ? (
                  <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                    Anda belum terdaftar di training manapun.
                  </p>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {trainings.map((training) => {
                      const feedback = feedbackByTraining.get(training.id);
                      return (
                        <div
                          key={training.id}
                          className="flex flex-col justify-between gap-4 rounded-lg border p-4"
                        >
                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <IconMessage2 className="size-5" />
                              </span>
                              {feedback ? (
                                <Badge>Sudah diisi</Badge>
                              ) : (
                                <Badge variant="secondary">Belum diisi</Badge>
                              )}
                            </div>
                            <p className="line-clamp-2 font-medium">
                              {training.title}
                            </p>
                          </div>
                          <ButtonLink
                            variant={feedback ? "outline" : "default"}
                            size="sm"
                            href={`/student/feedback/${training.id}`}
                          >
                            {feedback ? "Edit Feedback" : "Isi Feedback"}
                          </ButtonLink>
                        </div>
                      );
                    })}
                  </div>
                )}

                <ListPagination
                  page={page}
                  totalPages={totalPages}
                  basePath="/student/feedback"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
