import { IconCertificate, IconDownload } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent } from "@/components/ui/card";
import type { CertificateSummary } from "@/lib/domain/certificates/types";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
  }).format(new Date(value));
}

type CertificateListProps = {
  certificates: CertificateSummary[];
};

export function CertificateList({ certificates }: CertificateListProps) {
  if (certificates.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-4">
      {certificates.map((certificate) => (
        <Card key={certificate.id}>
          <CardContent className="space-y-4 p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <IconCertificate className="size-5 text-primary" />
                  <h3 className="font-semibold">{certificate.trainingTitle}</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {certificate.certificateNumber}
                </p>
                <p className="text-sm text-muted-foreground">
                  Diterbitkan {formatDate(certificate.issuedAt)}
                </p>
              </div>
              <Badge variant="secondary">
                Nilai akhir {certificate.finalGrade}%
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground">
              Pre-test {certificate.preTestScore}% · Post-test{" "}
              {certificate.postTestScore}%
            </p>

            <div className="flex flex-wrap gap-2">
              <ButtonLink href={`/student/certificates/${certificate.id}`}>
                Lihat Detail
              </ButtonLink>
              <ButtonLink
                href={`/api/certificates/${certificate.id}/download`}
                variant="outline"
              >
                <IconDownload className="size-4" />
                Download PDF
              </ButtonLink>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
