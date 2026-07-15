import type { Metadata } from "next";
import { IconArrowLeft, IconLock } from "@tabler/icons-react";

import { ErrorState } from "@/components/error/error-state";
import { ButtonLink } from "@/components/ui/button-link";

export const metadata: Metadata = {
  title: "Akses Ditolak",
};

export default function UnauthorizedPage() {
  return (
    <ErrorState
      code="403"
      icon={IconLock}
      title="Akses ditolak"
      description="Anda tidak memiliki izin untuk mengakses halaman ini. Masuk dengan akun yang sesuai untuk melanjutkan."
      actions={
        <>
          <ButtonLink href="/login" size="lg">
            <IconArrowLeft data-icon="inline-start" />
            Kembali ke Login
          </ButtonLink>
          <ButtonLink href="/" variant="outline" size="lg">
            Beranda
          </ButtonLink>
        </>
      }
    />
  );
}
