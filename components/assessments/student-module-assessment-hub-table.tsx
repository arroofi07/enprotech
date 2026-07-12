import { AssessmentProgressBadge } from "@/components/progress/assessment-progress-badge";
import { ButtonLink } from "@/components/ui/button-link";
import { DataTable } from "@/components/ui/data-table";
import type { StudentModuleAssessmentHubRow } from "@/lib/application/assessments/list-student-module-assessment-hub";
import { getAssessmentTypeLabel } from "@/lib/domain/assessments/labels";
import type { ModuleAssessmentType } from "@/lib/domain/assessments/types";

type StudentModuleAssessmentHubTableProps = {
  type: ModuleAssessmentType;
  items: StudentModuleAssessmentHubRow[];
};

function getAssessmentHref(
  type: ModuleAssessmentType,
  trainingId: string,
  moduleId: string,
): string {
  const segment = type === "quiz" ? "quiz" : "latihan";
  return `/student/trainings/${trainingId}/modules/${moduleId}/${segment}`;
}

export function StudentModuleAssessmentHubTable({
  type,
  items,
}: StudentModuleAssessmentHubTableProps) {
  const typeLabel = getAssessmentTypeLabel(type);

  return (
    <DataTable
      data={items}
      getRowKey={(item) => item.moduleId}
      emptyState={{
        message:
          "Belum ada modul tersedia. Ikuti training dan selesaikan pre-test untuk membuka modul.",
      }}
      columns={[
        {
          id: "training",
          header: "Training",
          cell: (item) => (
            <span className="font-medium">{item.trainingTitle}</span>
          ),
        },
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
          id: "status",
          header: "Status",
          cell: (item) => (
            <div className="space-y-1">
              <AssessmentProgressBadge
                status={item.canOpen ? item.progressStatus : "locked"}
              />
              <p className="text-xs text-muted-foreground">{item.statusLabel}</p>
            </div>
          ),
        },
        {
          id: "score",
          header: "Nilai Tertinggi",
          cell: (item) =>
            item.bestScore !== null ? (
              <span className="font-medium tabular-nums">{item.bestScore}%</span>
            ) : (
              <span className="text-sm text-muted-foreground">—</span>
            ),
        },
        {
          id: "actions",
          header: "Aksi",
          headerClassName: "text-right",
          className: "text-right",
          cell: (item) =>
            item.canOpen ? (
              <ButtonLink
                variant="outline"
                size="xs"
                href={getAssessmentHref(type, item.trainingId, item.moduleId)}
              >
                Buka {typeLabel}
              </ButtonLink>
            ) : (
              <span className="text-xs text-muted-foreground">Terkunci</span>
            ),
        },
      ]}
    />
  );
}
