import { redirect } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { FeedbackFilters } from "@/components/feedback/feedback-filters";
import { FeedbackStats } from "@/components/feedback/feedback-stats";
import { FeedbackTable } from "@/components/feedback/feedback-table";
import { TrainerHeader } from "@/components/trainer/trainer-header";
import { Card, CardContent } from "@/components/ui/card";
import { ListPagination } from "@/components/ui/list-pagination";
import { getCurrentUser } from "@/lib/application/auth/get-session";
import { getFeedbackStats, listFeedback } from "@/lib/application/feedback/list-feedback";
import { listTrainingFilterOptions } from "@/lib/infrastructure/db/repositories/report-repository";

type TrainerFeedbackPageProps = {
  searchParams: Promise<{
    search?: string;
    trainingId?: string;
    page?: string;
  }>;
};

export default async function TrainerFeedbackPage({
  searchParams,
}: TrainerFeedbackPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const params = await searchParams;
  const [result, statsResult, trainings] = await Promise.all([
    listFeedback(user, {
      search: params.search,
      trainingId: params.trainingId,
      page: params.page,
      pageSize: 10,
    }),
    getFeedbackStats(user, params.trainingId),
    listTrainingFilterOptions(),
  ]);

  if (!result.success || !statsResult.success) {
    redirect("/unauthorized");
  }

  const { items, page, totalPages, total } = result.data;
  const filterParams = {
    search: params.search,
    trainingId: params.trainingId,
  };

  return (
    <>
      <TrainerHeader
        title="Feedback"
        breadcrumbs={[{ label: "Feedback" }]}
        user={user}
      />
      <main className="flex-1 overflow-auto">
        <div className="container max-w-7xl space-y-6 p-6 md:p-8">
          <AdminPageHeader
            title="Feedback Peserta"
            description="Lihat penilaian dan masukan yang dikirim peserta untuk training."
          />

          <FeedbackStats stats={statsResult.data} />

          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                <FeedbackFilters
                  search={params.search}
                  trainingId={params.trainingId}
                  trainings={trainings}
                />

                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Menampilkan{" "}
                    <span className="font-medium text-foreground">
                      {items.length}
                    </span>{" "}
                    dari{" "}
                    <span className="font-medium text-foreground">{total}</span>{" "}
                    feedback
                  </p>
                </div>

                <FeedbackTable feedback={items} />

                <ListPagination
                  page={page}
                  totalPages={totalPages}
                  basePath="/trainer/feedback"
                  searchParams={filterParams}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
