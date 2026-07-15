import { redirect } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CertificateList } from "@/components/certificates/certificate-list";
import { CertificateProgressChecklist } from "@/components/certificates/certificate-progress-checklist";
import { StudentHeader } from "@/components/student/student-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent } from "@/components/ui/card";
import { ListPagination } from "@/components/ui/list-pagination";
import { getCurrentUser } from "@/lib/application/auth/get-session";
import { getStudentCertificateProgress } from "@/lib/application/certificates/get-student-certificate-progress";
import { listStudentCertificates } from "@/lib/application/certificates/list-student-certificates";

const PAGE_SIZE = 10;

type StudentCertificatesPageProps = {
  searchParams: Promise<{ page?: string }>;
};

export default async function StudentCertificatesPage({
  searchParams,
}: StudentCertificatesPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const params = await searchParams;
  const page = Number(params.page ?? "1");
  const [result, progressResult] = await Promise.all([
    listStudentCertificates(user, { page, pageSize: PAGE_SIZE }),
    getStudentCertificateProgress(user),
  ]);

  if (!result.success) {
    redirect("/unauthorized");
  }

  const { items: certificates, total, totalPages } = result.data;
  const checklists = progressResult.success ? progressResult.data : [];

  return (
    <>
      <StudentHeader title="Sertifikat" breadcrumbs={[{ label: "Sertifikat" }]} />
      <main className="flex-1 overflow-auto">
        <div className="container max-w-4xl min-w-0 space-y-6 p-4 sm:p-6 md:p-8">
          <AdminPageHeader
            title="Sertifikat"
            description="Daftar sertifikat yang telah diterbitkan setelah menyelesaikan seluruh syarat kelulusan."
          />

          <CertificateProgressChecklist checklists={checklists} />

          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                  <h2 className="text-sm font-semibold text-foreground">
                    Sertifikat Diterbitkan
                  </h2>
                  <p className="text-xs text-muted-foreground sm:text-sm">
                    Menampilkan{" "}
                    <span className="font-medium text-foreground">
                      {certificates.length}
                    </span>{" "}
                    dari{" "}
                    <span className="font-medium text-foreground">{total}</span>{" "}
                    sertifikat
                  </p>
                </div>

                {certificates.length === 0 ? (
                  <div className="space-y-3">
                    <Alert>
                      <AlertDescription>
                        {checklists.length > 0
                          ? "Belum ada sertifikat yang diterbitkan. Selesaikan checklist di atas untuk mendapatkan sertifikat pertama Anda."
                          : "Belum ada sertifikat. Sertifikat akan tersedia setelah Anda terdaftar pada training dan menyelesaikan seluruh syaratnya."}
                      </AlertDescription>
                    </Alert>
                    {checklists.length === 0 ? (
                      <ButtonLink href="/student/trainings">
                        Lihat Training Saya
                      </ButtonLink>
                    ) : null}
                  </div>
                ) : (
                  <CertificateList certificates={certificates} />
                )}

                <ListPagination
                  page={page}
                  totalPages={totalPages}
                  basePath="/student/certificates"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
