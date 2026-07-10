import { redirect } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CertificateList } from "@/components/certificates/certificate-list";
import { StudentHeader } from "@/components/student/student-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent } from "@/components/ui/card";
import { ListPagination } from "@/components/ui/list-pagination";
import { getCurrentUser } from "@/lib/application/auth/get-session";
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
  const result = await listStudentCertificates(user, {
    page,
    pageSize: PAGE_SIZE,
  });

  if (!result.success) {
    redirect("/unauthorized");
  }

  const { items: certificates, total, totalPages } = result.data;

  return (
    <>
      <StudentHeader title="Sertifikat" breadcrumbs={[{ label: "Sertifikat" }]} />
      <main className="flex-1 overflow-auto">
        <div className="container max-w-4xl space-y-6 p-6 md:p-8">
          <AdminPageHeader
            title="Sertifikat"
            description="Daftar sertifikat yang telah diterbitkan setelah lulus post-test."
          />

          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
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
                        Belum ada sertifikat. Selesaikan semua modul dan lulus
                        post-test untuk mendapatkan sertifikat.
                      </AlertDescription>
                    </Alert>
                    <ButtonLink href="/student/post-test">Lihat Post-Test</ButtonLink>
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
