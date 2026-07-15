"use client";

import { useEffect } from "react";
import { IconAlertTriangle, IconHome, IconRefresh } from "@tabler/icons-react";

import { ErrorState } from "@/components/error/error-state";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";

export default function RootError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorState
      code="500"
      icon={IconAlertTriangle}
      tone="destructive"
      title="Terjadi kesalahan"
      description="Halaman ini gagal dimuat. Coba muat ulang, atau kembali ke beranda jika masalah berlanjut."
      digest={error.digest}
      actions={
        <>
          <Button size="lg" onClick={() => retry()}>
            <IconRefresh data-icon="inline-start" />
            Coba lagi
          </Button>
          <ButtonLink href="/" variant="outline" size="lg">
            <IconHome data-icon="inline-start" />
            Kembali ke beranda
          </ButtonLink>
        </>
      }
    />
  );
}
