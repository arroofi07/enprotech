import { IconDownload } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import type { ImportKind } from "@/lib/domain/imports/types";

const TEMPLATE_COLUMNS: Record<ImportKind, string> = {
  questions:
    "Pertanyaan, Pilihan A, Pilihan B, Pilihan C, Pilihan D, Pilihan E, Jawaban Benar (A/B/C/D/E)",
  enrollments: "student_email, training_id",
  scores:
    "student_email, training_id, module_name, assessment_type, score",
};

type ImportTemplateDownloadProps = {
  kind: ImportKind;
  columns?: string;
  variant?: "panel" | "button";
};

export function ImportTemplateDownload({
  kind,
  columns,
  variant = "panel",
}: ImportTemplateDownloadProps) {
  const templateHref = `/api/import/templates/${kind}`;

  if (variant === "button") {
    return (
      <Button
        type="button"
        variant="outline"
        nativeButton={false}
        render={<a href={templateHref} />}
      >
        <IconDownload className="size-4" />
        Export Excel
      </Button>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
      <div className="space-y-1">
        <p className="text-sm font-medium">Langkah 1 — Unduh Template Excel</p>
        <p className="text-sm text-muted-foreground">
          Isi data sesuai kolom: {columns ?? TEMPLATE_COLUMNS[kind]}
        </p>
      </div>

      <Button
        type="button"
        variant="outline"
        nativeButton={false}
        render={<a href={templateHref} />}
      >
        <IconDownload className="size-4" />
        Export Excel
      </Button>
    </div>
  );
}
