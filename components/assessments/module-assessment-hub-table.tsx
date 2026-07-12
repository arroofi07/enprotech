import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
import { DataTable } from "@/components/ui/data-table";
import { getAssessmentTypeLabel } from "@/lib/domain/assessments/labels";
import type { ModuleAssessmentType } from "@/lib/domain/assessments/types";
import type { ModuleAssessmentHubRow } from "@/lib/infrastructure/db/repositories/assessment-repository";

type ModuleAssessmentHubTableProps = {
  type: ModuleAssessmentType;
  items: ModuleAssessmentHubRow[];
  showTrainingColumn?: boolean;
};

function getManageHref(
  type: ModuleAssessmentType,
  trainingId: string,
  moduleId: string,
): string {
  const segment = type === "quiz" ? "quiz" : "latihan";
  return `/trainer/trainings/${trainingId}/modules/${moduleId}/${segment}`;
}

export function ModuleAssessmentHubTable({
  type,
  items,
  showTrainingColumn = true,
}: ModuleAssessmentHubTableProps) {
  const typeLabel = getAssessmentTypeLabel(type);

  return (
    <DataTable
      data={items}
      getRowKey={(item) => item.moduleId}
      emptyState={{
        message:
          "Belum ada modul. Buat modul di halaman training terlebih dahulu.",
      }}
      columns={[
        ...(showTrainingColumn
          ? [
              {
                id: "training",
                header: "Training",
                cell: (item: ModuleAssessmentHubRow) => (
                  <span className="font-medium">{item.trainingTitle}</span>
                ),
              },
            ]
          : []),
        {
          id: "module",
          header: "Modul",
          cell: (item) => (
            <div className="space-y-1">
              <p className="font-medium">{item.moduleTitle}</p>
              <p className="text-xs text-muted-foreground">
                Urutan {item.moduleOrder + 1}
              </p>
            </div>
          ),
        },
        {
          id: "questions",
          header: "Jumlah Soal",
          cell: (item) => (
            <Badge variant={item.questionCount > 0 ? "secondary" : "outline"}>
              {item.questionCount} soal
            </Badge>
          ),
        },
        {
          id: "actions",
          header: "Aksi",
          headerClassName: "text-right",
          className: "text-right",
          cell: (item) => (
            <ButtonLink
              variant="outline"
              size="xs"
              href={getManageHref(type, item.trainingId, item.moduleId)}
            >
              Kelola {typeLabel}
            </ButtonLink>
          ),
        },
      ]}
    />
  );
}
