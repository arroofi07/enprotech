"use client";

import { useEffect } from "react";
import { IconAlertTriangle, IconRefresh } from "@tabler/icons-react";

import { ErrorState } from "@/components/error/error-state";
import { Button } from "@/components/ui/button";
import "./globals.css";

// Replaces the root layout when it crashes, so it ships its own document,
// styles and font stack — nothing from layout.tsx is available here.
export default function GlobalError({
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
    <html lang="id" className="h-full antialiased">
      <body
        className="min-h-full bg-background text-foreground"
        style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
      >
        <title>Terjadi Kesalahan — E-Training Enprotech</title>
        <ErrorState
          className="min-h-screen"
          code="500"
          icon={IconAlertTriangle}
          tone="destructive"
          title="Aplikasi tidak dapat dimuat"
          description="Terjadi kesalahan tak terduga. Muat ulang halaman, dan hubungi administrator jika masalah terus terjadi."
          digest={error.digest}
          actions={
            <Button size="lg" onClick={() => retry()}>
              <IconRefresh data-icon="inline-start" />
              Muat ulang
            </Button>
          }
        />
      </body>
    </html>
  );
}
