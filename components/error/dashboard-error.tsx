"use client";

import { useEffect } from "react";
import { IconAlertTriangle, IconLayoutDashboard, IconRefresh } from "@tabler/icons-react";

import { ErrorState } from "@/components/error/error-state";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";

type DashboardErrorProps = {
  error: Error & { digest?: string };
  retry: () => void;
  dashboardHref: string;
};

export function DashboardError({
  error,
  retry,
  dashboardHref,
}: DashboardErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorState
      code="500"
      icon={IconAlertTriangle}
      tone="destructive"
      title="Gagal memuat halaman"
      description="Data pada halaman ini tidak dapat ditampilkan. Coba muat ulang, atau kembali ke dashboard."
      digest={error.digest}
      actions={
        <>
          <Button size="lg" onClick={() => retry()}>
            <IconRefresh data-icon="inline-start" />
            Coba lagi
          </Button>
          <ButtonLink href={dashboardHref} variant="outline" size="lg">
            <IconLayoutDashboard data-icon="inline-start" />
            Ke dashboard
          </ButtonLink>
        </>
      }
    />
  );
}
