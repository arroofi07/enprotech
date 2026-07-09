import { redirect } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { TrainerHeader } from "@/components/trainer/trainer-header";
import { TrainingsFilters } from "@/components/trainings/trainings-filters";
import { TrainingsPagination } from "@/components/trainings/trainings-pagination";
import { TrainingsTable } from "@/components/trainings/trainings-table";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/application/auth/get-session";
import { listTrainings } from "@/lib/application/trainings/list-trainings";

type TrainerTrainingsPageProps = {
  searchParams: Promise<{
    search?: string;
    status?: string;
    page?: string;
  }>;
};

export default async function TrainerTrainingsPage({
  searchParams,
}: TrainerTrainingsPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const params = await searchParams;
  const result = await listTrainings(user, {
    search: params.search,
    status: params.status,
    page: params.page,
    pageSize: 10,
  });

  if (!result.success) {
    redirect("/unauthorized");
  }

  const { items, page, totalPages, total } = result.data;

  return (
    <>
      <TrainerHeader
        title="Training"
        breadcrumbs={[{ label: "Training" }]}
        user={user}
      />
      <main className="flex-1 overflow-auto">
        <div className="container max-w-7xl space-y-6 p-6 md:p-8">
          <AdminPageHeader
            title="Manajemen Training"
            description="Buat, kelola, dan enroll student ke program training."
            actions={
              <ButtonLink size="lg" href="/trainer/trainings/new">
                Buat Training
              </ButtonLink>
            }
          />

          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                <TrainingsFilters
                  search={params.search}
                  status={params.status}
                />

                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Menampilkan{" "}
                    <span className="font-medium text-foreground">
                      {items.length}
                    </span>{" "}
                    dari{" "}
                    <span className="font-medium text-foreground">{total}</span>{" "}
                    training
                  </p>
                </div>

                <TrainingsTable trainings={items} />

                <TrainingsPagination
                  page={page}
                  totalPages={totalPages}
                  searchParams={{
                    search: params.search,
                    status: params.status,
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
