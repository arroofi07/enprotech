import { redirect } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StudentHeader } from "@/components/student/student-header";
import { StudentTrainingCard } from "@/components/trainings/student-training-card";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent } from "@/components/ui/card";
import { ListPagination } from "@/components/ui/list-pagination";
import { getCurrentUser } from "@/lib/application/auth/get-session";
import { listEnrolledTrainings } from "@/lib/application/trainings/list-enrolled-trainings";

const PAGE_SIZE = 10;

type StudentModulesPageProps = {
  searchParams: Promise<{ page?: string }>;
};

export default async function StudentModulesPage({
  searchParams,
}: StudentModulesPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const params = await searchParams;
  const page = Number(params.page ?? "1");
  const result = await listEnrolledTrainings(user, {
    page,
    pageSize: PAGE_SIZE,
  });

  if (!result.success) {
    redirect("/unauthorized");
  }

  const { items: trainings, total, totalPages } = result.data;

  return (
    <>
      <StudentHeader title="Modul" breadcrumbs={[{ label: "Modul" }]} />
      <main className="flex-1 overflow-auto">
        <div className="container max-w-7xl space-y-6 p-6 md:p-8">
          <AdminPageHeader
            title="Modul Pembelajaran"
            description="Pilih training untuk mengakses modul dan materi pembelajaran."
            actions={
              <ButtonLink variant="outline" href="/student/dashboard">
                Kembali ke Dashboard
              </ButtonLink>
            }
          />

          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Menampilkan{" "}
                    <span className="font-medium text-foreground">
                      {trainings.length}
                    </span>{" "}
                    dari{" "}
                    <span className="font-medium text-foreground">{total}</span>{" "}
                    training
                  </p>
                </div>

                {trainings.length === 0 ? (
                  <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                    Anda belum terdaftar di training manapun.
                  </p>
                ) : (
                  <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {trainings.map((training) => (
                      <StudentTrainingCard key={training.id} training={training} />
                    ))}
                  </div>
                )}

                <ListPagination
                  page={page}
                  totalPages={totalPages}
                  basePath="/student/modules"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
