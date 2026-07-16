import { redirect } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StudentHeader } from "@/components/student/student-header";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/application/auth/get-session";
import { getCertificate } from "@/lib/application/certificates/get-certificate";

type StudentCertificateDetailPageProps = {
  params: Promise<{ id: string }>;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
  }).format(new Date(value));
}

export default async function StudentCertificateDetailPage({
  params,
}: StudentCertificateDetailPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { id } = await params;
  const result = await getCertificate(user, { certificateId: id });

  if (!result.success) {
    redirect("/student/certificates");
  }

  const certificate = result.data;

  return (
    <>
      <StudentHeader
        title="Detail Sertifikat"
        breadcrumbs={[
          { label: "Sertifikat", href: "/student/certificates" },
          { label: certificate.trainingTitle },
        ]}
      />
      <main className="flex-1 overflow-auto">
        <div className="container max-w-3xl min-w-0 space-y-6 p-4 sm:p-6 md:p-8">
          <AdminPageHeader
            title={certificate.trainingTitle}
            description="Detail sertifikat dan opsi download PDF."
            actions={
              <ButtonLink href={`/api/certificates/${certificate.id}/download`}>
                Download PDF
              </ButtonLink>
            }
          />

          <Card>
            <CardContent className="space-y-4 p-6">
              <div className="flex flex-wrap gap-2">
                <Badge>{certificate.certificateNumber}</Badge>
                <Badge variant="secondary">
                  Nilai akhir {certificate.finalGrade}%
                </Badge>
              </div>

              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-muted-foreground">Nama Peserta</dt>
                  <dd className="font-medium">{certificate.studentName}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Email</dt>
                  <dd>{certificate.studentEmail}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Training</dt>
                  <dd className="font-medium">{certificate.trainingTitle}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Tanggal Terbit</dt>
                  <dd>{formatDate(certificate.issuedAt)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Pre-Test</dt>
                  <dd>{certificate.preTestScore}%</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Post-Test</dt>
                  <dd>{certificate.postTestScore}%</dd>
                </div>
              </dl>

              <p className="text-sm text-muted-foreground">
                Verifikasi publik:{" "}
                <a
                  href={`/verify/${encodeURIComponent(certificate.certificateNumber)}`}
                  className="text-primary underline-offset-4 hover:underline"
                >
                  {certificate.certificateNumber}
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
