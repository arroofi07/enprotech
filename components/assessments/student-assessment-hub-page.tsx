import { redirect } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ModuleAssessmentHubFilters } from "@/components/assessments/module-assessment-hub-filters";
import { StudentModuleAssessmentHubTable } from "@/components/assessments/student-module-assessment-hub-table";
import { StudentHeader } from "@/components/student/student-header";
import { Card, CardContent } from "@/components/ui/card";
import { ListPagination } from "@/components/ui/list-pagination";
import { getCurrentUser } from "@/lib/application/auth/get-session";
import { listStudentModuleAssessmentHubItems } from "@/lib/application/assessments/list-student-module-assessment-hub";
import { getAssessmentTypeLabel } from "@/lib/domain/assessments/labels";
import type { ModuleAssessmentType } from "@/lib/domain/assessments/types";

const PAGE_SIZE = 10;

type StudentAssessmentHubPageProps = {
  type: ModuleAssessmentType;
  searchParams?: {
    page?: string;
    search?: string;
  };
};

function getHubBasePath(type: ModuleAssessmentType): string {
  return type === "quiz" ? "/student/quiz" : "/student/latihan";
}

export async function StudentAssessmentHubPage({
  type,
  searchParams = {},
}: StudentAssessmentHubPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const typeLabel = getAssessmentTypeLabel(type);
  const basePath = getHubBasePath(type);
  const page = Number(searchParams.page ?? "1");

  const result = await listStudentModuleAssessmentHubItems(user, {
    type,
    search: searchParams.search,
    page,
    pageSize: PAGE_SIZE,
  });

  if (!result.success) {
    redirect("/unauthorized");
  }

  const { items, total, page: currentPage, totalPages } = result.data;

  return (
    <>
      <StudentHeader title={typeLabel} breadcrumbs={[{ label: typeLabel }]} />
      <main className="flex-1 overflow-auto">
        <div className="container max-w-7xl space-y-6 p-6 md:p-8">
          <AdminPageHeader
            title={typeLabel}
            description={`Pilih modul untuk mengerjakan ${typeLabel.toLowerCase()}.`}
          />

          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                <ModuleAssessmentHubFilters
                  search={searchParams.search}
                  searchLabel="Cari Modul"
                  searchPlaceholder="Cari nama training atau modul..."
                />

                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Menampilkan{" "}
                    <span className="font-medium text-foreground">
                      {items.length}
                    </span>{" "}
                    dari{" "}
                    <span className="font-medium text-foreground">{total}</span>{" "}
                    modul
                  </p>
                </div>

                <StudentModuleAssessmentHubTable type={type} items={items} />

                <ListPagination
                  page={currentPage}
                  totalPages={totalPages}
                  basePath={basePath}
                  searchParams={{ search: searchParams.search }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
