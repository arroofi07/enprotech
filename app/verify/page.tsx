import Link from "next/link";

import { VerifyCertificateForm } from "@/components/certificates/verify-certificate-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function VerifyPage() {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-muted/30 p-6">
      <div className="flex w-full max-w-md flex-col gap-6">
        <div className="text-center">
          <h1 className="text-lg font-semibold tracking-tight">
            Verifikasi Sertifikat
          </h1>
          <p className="text-xs text-muted-foreground">
            Masukkan nomor sertifikat untuk memeriksa keasliannya.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Cek Sertifikat</CardTitle>
            <CardDescription>
              Format nomor: CERT-&#123;KODE-TRAINING&#125;-&#123;TAHUN&#125;-&#123;URUTAN&#125;
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <VerifyCertificateForm />
            <p className="text-center text-xs text-muted-foreground">
              <Link href="/login" className="underline-offset-4 hover:underline">
                Kembali ke login
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
