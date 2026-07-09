import { redirect } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CertificateList } from "@/components/certificates/certificate-list";
import { StudentHeader } from "@/components/student/student-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/application/auth/get-session";
import { listStudentCertificates } from "@/lib/application/certificates/list-student-certificates";

export default async function StudentCertificatesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const result = await listStudentCertificates(user, {});
  if (!result.success) {
    redirect("/unauthorized");
  }

  const certificates = result.data;

  return (
    <>
      <StudentHeader title="Sertifikat" breadcrumbs={[{ label: "Sertifikat" }]} />
      <main className="flex-1 overflow-auto">
        <div className="container max-w-4xl space-y-6 p-6 md:p-8">
          <AdminPageHeader
            title="Sertifikat"
            description="Daftar sertifikat yang telah diterbitkan setelah lulus post-test."
          />

          {certificates.length === 0 ? (
            <Card>
              <CardContent className="space-y-3 p-6">
                <Alert>
                  <AlertDescription>
                    Belum ada sertifikat. Selesaikan semua modul dan lulus
                    post-test untuk mendapatkan sertifikat.
                  </AlertDescription>
                </Alert>
                <ButtonLink href="/student/post-test">Lihat Post-Test</ButtonLink>
              </CardContent>
            </Card>
          ) : (
            <CertificateList certificates={certificates} />
          )}
        </div>
      </main>
    </>
  );
}
