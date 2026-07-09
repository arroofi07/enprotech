import { redirect } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ReportsFilters } from "@/components/reports/reports-filters";
import { ReportsPagination } from "@/components/reports/reports-pagination";
import {
  ReportExportButtons,
  ReportsTable,
} from "@/components/reports/reports-table";
import { TrainerHeader } from "@/components/trainer/trainer-header";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/application/auth/get-session";
import { listTrainingReport } from "@/lib/application/reports/list-training-report";
import {
  listModuleFilterOptions,
  listTrainingFilterOptions,
} from "@/lib/infrastructure/db/repositories/report-repository";
import { listActiveStudents } from "@/lib/infrastructure/db/repositories/user-repository";

type TrainerNilaiPageProps = {
  searchParams: Promise<{
    search?: string;
    studentId?: string;
    trainingId?: string;
    moduleId?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: string;
  }>;
};

export default async function TrainerNilaiPage({
  searchParams,
}: TrainerNilaiPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const params = await searchParams;
  const [result, students, trainings, modules] = await Promise.all([
    listTrainingReport(user, {
      search: params.search,
      studentId: params.studentId,
      trainingId: params.trainingId,
      moduleId: params.moduleId,
      dateFrom: params.dateFrom,
      dateTo: params.dateTo,
      page: params.page,
      pageSize: 10,
    }),
    listActiveStudents().then((rows) =>
      rows.map((row) => ({ id: row.id, label: row.name })),
    ),
    listTrainingFilterOptions(),
    params.trainingId
      ? listModuleFilterOptions(params.trainingId)
      : Promise.resolve([]),
  ]);

  if (!result.success) {
    redirect("/unauthorized");
  }

  const { items, page, totalPages, total } = result.data;
  const filterParams = {
    search: params.search,
    studentId: params.studentId,
    trainingId: params.trainingId,
    moduleId: params.moduleId,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
  };

  return (
    <>
      <TrainerHeader
        title="Nilai"
        breadcrumbs={[{ label: "Nilai" }]}
        user={user}
      />
      <main className="flex-1 overflow-auto">
        <div className="container max-w-7xl space-y-6 p-6 md:p-8">
          <AdminPageHeader
            title="Rekap Hasil Training"
            description="Filter rekap nilai student per training dan modul, lalu export ke Excel atau PDF."
            actions={<ReportExportButtons searchParams={filterParams} />}
          />

          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                <ReportsFilters
                  search={params.search}
                  studentId={params.studentId}
                  trainingId={params.trainingId}
                  moduleId={params.moduleId}
                  dateFrom={params.dateFrom}
                  dateTo={params.dateTo}
                  students={students}
                  trainings={trainings}
                  modules={modules}
                />

                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Menampilkan{" "}
                    <span className="font-medium text-foreground">
                      {items.length}
                    </span>{" "}
                    dari{" "}
                    <span className="font-medium text-foreground">{total}</span>{" "}
                    baris rekap
                  </p>
                </div>

                <ReportsTable rows={items} />

                <ReportsPagination
                  page={page}
                  totalPages={totalPages}
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
