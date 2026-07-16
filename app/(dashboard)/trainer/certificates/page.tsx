import { redirect } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CertificateFilters } from "@/components/certificates/certificate-filters";
import { ReportsPagination } from "@/components/reports/reports-pagination";
import { TrainerHeader } from "@/components/trainer/trainer-header";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { getCurrentUser } from "@/lib/application/auth/get-session";
import { listTrainerCertificates } from "@/lib/application/certificates/list-trainer-certificates";
import {
  listTrainingFilterOptions,
} from "@/lib/infrastructure/db/repositories/report-repository";
import { listActiveStudents } from "@/lib/infrastructure/db/repositories/user-repository";

type TrainerCertificatesPageProps = {
  searchParams: Promise<{
    search?: string;
    studentId?: string;
    trainingId?: string;
    page?: string;
  }>;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
  }).format(new Date(value));
}

export default async function TrainerCertificatesPage({
  searchParams,
}: TrainerCertificatesPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const params = await searchParams;
  const filterParams = {
    search: params.search,
    studentId: params.studentId,
    trainingId: params.trainingId,
  };

  const [result, students, trainings] = await Promise.all([
    listTrainerCertificates(user, {
      ...filterParams,
      page: params.page,
      pageSize: 10,
    }),
    listActiveStudents().then((rows) =>
      rows.map((row) => ({ id: row.id, label: row.name })),
    ),
    listTrainingFilterOptions(),
  ]);

  if (!result.success) {
    redirect("/unauthorized");
  }

  const { items, page, totalPages, total } = result.data;

  return (
    <>
      <TrainerHeader
        title="Sertifikat"
        breadcrumbs={[{ label: "Sertifikat" }]}
        user={user}
      />
      <main className="flex-1 overflow-auto">
        <div className="container max-w-7xl min-w-0 space-y-6 p-4 sm:p-6 md:p-8">
          <AdminPageHeader
            title="Sertifikat Diterbitkan"
            description="Pantau sertifikat peserta yang otomatis diterbitkan setelah lulus post-test."
          />

          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                <CertificateFilters
                  search={params.search}
                  studentId={params.studentId}
                  trainingId={params.trainingId}
                  students={students}
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
                    sertifikat
                  </p>
                </div>

                <DataTable
                  data={items}
                  getRowKey={(certificate) => certificate.id}
                  emptyState={{
                    message:
                      "Belum ada sertifikat diterbitkan. Sertifikat muncul otomatis setelah peserta lulus post-test.",
                  }}
                  columns={[
                    {
                      id: "student",
                      header: "Peserta",
                      cell: (certificate) => (
                        <div className="space-y-1">
                          <p className="font-medium">{certificate.studentName}</p>
                          <p className="text-xs text-muted-foreground">
                            {certificate.studentEmail}
                          </p>
                        </div>
                      ),
                    },
                    {
                      id: "training",
                      header: "Training",
                      cell: (certificate) => (
                        <span className="font-medium">
                          {certificate.trainingTitle}
                        </span>
                      ),
                    },
                    {
                      id: "certificateNumber",
                      header: "Nomor Sertifikat",
                      cell: (certificate) => (
                        <span className="font-mono text-xs">
                          {certificate.certificateNumber}
                        </span>
                      ),
                    },
                    {
                      id: "issuedAt",
                      header: "Terbit",
                      cell: (certificate) => formatDate(certificate.issuedAt),
                    },
                    {
                      id: "grade",
                      header: "Nilai",
                      cell: (certificate) => (
                        <div className="space-y-1">
                          <Badge variant="secondary">
                            Akhir {certificate.finalGrade}%
                          </Badge>
                          <p className="text-xs text-muted-foreground">
                            Pre {certificate.preTestScore}% · Post{" "}
                            {certificate.postTestScore}%
                          </p>
                        </div>
                      ),
                    },
                    {
                      id: "actions",
                      header: "Aksi",
                      headerClassName: "text-right",
                      className: "text-right",
                      cell: (certificate) => (
                        <div className="flex flex-wrap justify-end gap-2">
                          <ButtonLink
                            href={`/verify/${encodeURIComponent(certificate.certificateNumber)}`}
                            variant="outline"
                            size="sm"
                          >
                            Verifikasi
                          </ButtonLink>
                          <ButtonLink
                            href={`/api/certificates/${certificate.id}/download`}
                            size="sm"
                          >
                            Download
                          </ButtonLink>
                        </div>
                      ),
                    },
                  ]}
                />

                <ReportsPagination
                  page={page}
                  totalPages={totalPages}
                  searchParams={filterParams}
                  basePath="/trainer/certificates"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
