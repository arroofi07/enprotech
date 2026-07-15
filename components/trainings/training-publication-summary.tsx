import { IconCircleCheck, IconCircleX } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import type { TrainingPublicationSummary as TrainingPublicationSummaryData } from "@/lib/infrastructure/db/repositories/assessment-repository";

type TrainingPublicationSummaryProps = {
  summary: TrainingPublicationSummaryData;
  compact?: boolean;
};

export function TrainingPublicationSummary({
  summary,
  compact = false,
}: TrainingPublicationSummaryProps) {
  const items = [
    {
      label: "Modul",
      value: `${summary.moduleCount}`,
      detail: `${summary.modulesWithContentCount}/${summary.moduleCount} bermateri`,
    },
    {
      label: "Quiz",
      value: `${summary.quizQuestionCount} soal`,
      detail: `${summary.modulesWithQuizQuestionsCount}/${summary.moduleCount} modul terisi`,
    },
    {
      label: "Latihan",
      value: `${summary.latihanQuestionCount} soal`,
      detail: `${summary.modulesWithLatihanQuestionsCount}/${summary.moduleCount} modul terisi`,
    },
    {
      label: "Pre-test",
      value: `${summary.preTestQuestionCount} soal`,
      detail: summary.preTestQuestionCount > 0 ? "Sudah tersedia" : "Belum tersedia",
    },
    {
      label: "Post-test",
      value: `${summary.postTestQuestionCount} soal`,
      detail: summary.postTestQuestionCount > 0 ? "Sudah tersedia" : "Belum tersedia",
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium">Kelengkapan konten</p>
        <Badge variant={summary.isReadyToPublish ? "default" : "secondary"}>
          {summary.isReadyToPublish ? (
            <IconCircleCheck data-icon="inline-start" />
          ) : (
            <IconCircleX data-icon="inline-start" />
          )}
          {summary.isReadyToPublish ? "Siap dipublikasikan" : "Belum lengkap"}
        </Badge>
      </div>

      <div
        className={
          compact
            ? "grid grid-cols-2 gap-2 sm:grid-cols-5"
            : "grid gap-3 sm:grid-cols-2 lg:grid-cols-5"
        }
      >
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-lg border bg-muted/30 px-3 py-2"
          >
            <p className="text-xs text-muted-foreground">{item.label}</p>
            <p className="font-medium">{item.value}</p>
            <p className="text-xs text-muted-foreground">{item.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
