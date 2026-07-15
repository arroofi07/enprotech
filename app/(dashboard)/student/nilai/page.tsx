import { redirect } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StudentTrainingScoresSection } from "@/components/progress/student-training-scores-section";
import { StudentHeader } from "@/components/student/student-header";
import { Card, CardContent } from "@/components/ui/card";
import { ListPagination } from "@/components/ui/list-pagination";
import { getCurrentUser } from "@/lib/application/auth/get-session";
import { listStudentTrainingScores } from "@/lib/application/progress/list-student-training-scores";

const PAGE_SIZE = 10;

type StudentNilaiPageProps = {
  searchParams: Promise<{ page?: string }>;
};

export default async function StudentNilaiPage({
  searchParams,
}: StudentNilaiPageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const params = await searchParams;
  const page = Number(params.page ?? "1");
  const result = await listStudentTrainingScores(user, {
    page,
    pageSize: PAGE_SIZE,
  });

  if (!result.success) {
    redirect("/unauthorized");
  }

  const { items: scores, total, totalPages } = result.data;

  return (
    <>
      <StudentHeader title="Nilai" breadcrumbs={[{ label: "Nilai" }]} />
      <main className="flex-1 overflow-auto">
        <div className="container max-w-7xl min-w-0 space-y-6 p-4 sm:p-6 md:p-8">
          <AdminPageHeader
            title="Nilai Saya"
            description="Lihat nilai pre-test, quiz, latihan, dan post-test untuk setiap training yang Anda ikuti."
          />

          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Menampilkan{" "}
                    <span className="font-medium text-foreground">
                      {scores.length}
                    </span>{" "}
                    dari{" "}
                    <span className="font-medium text-foreground">{total}</span>{" "}
                    training
                  </p>
                </div>

                {scores.length === 0 ? (
                  <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                    Anda belum terdaftar di training manapun.
                  </p>
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

                <ListPagination
                  page={page}
                  totalPages={totalPages}
                  basePath="/student/nilai"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
