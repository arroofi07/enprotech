import Link from "next/link";

import { verifyCertificate } from "@/lib/application/certificates/verify-certificate";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type VerifyResultPageProps = {
  params: Promise<{ certificateNumber: string }>;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
  }).format(new Date(value));
}

export default async function VerifyResultPage({
  params,
}: VerifyResultPageProps) {
  const { certificateNumber } = await params;
  const decodedNumber = decodeURIComponent(certificateNumber);
  const result = await verifyCertificate({
    certificateNumber: decodedNumber,
  });

  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-muted/30 p-6">
      <div className="flex w-full max-w-lg flex-col gap-6">
        <div className="text-center">
          <h1 className="text-lg font-semibold tracking-tight">
            Hasil Verifikasi
          </h1>
          <p className="text-xs text-muted-foreground">{decodedNumber}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {result.success ? "Sertifikat Valid" : "Sertifikat Tidak Ditemukan"}
            </CardTitle>
            <CardDescription>
              {result.success
                ? "Sertifikat terdaftar di sistem E-Training."
                : result.message}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {result.success ? (
              <>
                <Badge variant="default">Valid</Badge>
                <dl className="grid gap-3 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Nama</dt>
                    <dd className="font-medium">{result.data.studentName}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Training</dt>
                    <dd className="font-medium">{result.data.trainingTitle}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Tanggal Terbit</dt>
                    <dd>{formatDate(result.data.issuedAt)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Nilai</dt>
                    <dd>
                      Pre-test {result.data.preTestScore}% · Post-test{" "}
                      {result.data.postTestScore}% · Akhir{" "}
                      {result.data.finalGrade}%
                    </dd>
                  </div>
                </dl>
              </>
            ) : (
              <Badge variant="secondary">Tidak Valid</Badge>
            )}

            <div className="flex flex-wrap gap-2">
              <ButtonLink href="/verify" variant="outline">
                Verifikasi Lain
              </ButtonLink>
              <Link
                href="/login"
                className="inline-flex h-8 items-center px-3 text-sm text-muted-foreground underline-offset-4 hover:underline"
              >
                Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
