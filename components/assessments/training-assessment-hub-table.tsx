import { TrainingStatusBadge } from "@/components/trainings/training-status-badge";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
import { DataTable } from "@/components/ui/data-table";
import { getAssessmentTypeLabel } from "@/lib/domain/assessments/labels";
import type { TrainingAssessmentType } from "@/lib/domain/assessments/types";
import type { TrainingStatus } from "@/lib/domain/trainings/types";

export type TrainerAssessmentHubRow = {
  id: string;
  title: string;
  status: TrainingStatus;
  isPretestActive: boolean;
};

export type StudentAssessmentHubRow = {
  id: string;
  title: string;
  statusLabel: string;
  canOpen: boolean;
};

type TrainingAssessmentHubTableProps =
  | {
      role: "trainer";
      assessmentType: TrainingAssessmentType;
      items: TrainerAssessmentHubRow[];
    }
  | {
      role: "student";
      assessmentType: TrainingAssessmentType;
      items: StudentAssessmentHubRow[];
    };

function getAssessmentPath(
  role: "student" | "trainer",
  trainingId: string,
  type: TrainingAssessmentType,
): string {
  const segment = type === "pre_test" ? "pre-test" : "post-test";
  return `/${role}/trainings/${trainingId}/${segment}`;
}

export function TrainingAssessmentHubTable(props: TrainingAssessmentHubTableProps) {
  const typeLabel = getAssessmentTypeLabel(props.assessmentType);

  if (props.role === "trainer") {
    return (
      <DataTable
        data={props.items}
        getRowKey={(training) => training.id}
        emptyState={{
          message: "Belum ada training. Buat training terlebih dahulu.",
        }}
        columns={[
          {
            id: "title",
            header: "Judul Training",
            cell: (training) => (
              <span className="font-medium">{training.title}</span>
            ),
          },
          {
            id: "status",
            header: "Status",
            cell: (training) => (
              <TrainingStatusBadge status={training.status} />
            ),
          },
          ...(props.assessmentType === "pre_test"
            ? [
                {
                  id: "pretest",
                  header: "Pre-Test",
                  cell: (training: TrainerAssessmentHubRow) => (
                    <Badge
                      variant={training.isPretestActive ? "default" : "secondary"}
                    >
                      {training.isPretestActive ? "Aktif" : "Belum Aktif"}
                    </Badge>
                  ),
                },
              ]
            : []),
          {
            id: "actions",
            header: "Aksi",
            headerClassName: "text-right",
            className: "text-right",
            cell: (training) => (
              <ButtonLink
                variant="outline"
                size="xs"
                href={getAssessmentPath(
                  "trainer",
                  training.id,
                  props.assessmentType,
                )}
              >
                Kelola {typeLabel}
              </ButtonLink>
            ),
          },
        ]}
      />
    );
  }

  return (
    <DataTable
      data={props.items}
      getRowKey={(training) => training.id}
      emptyState={{
        message: "Anda belum terdaftar di training manapun.",
      }}
      columns={[
        {
          id: "title",
          header: "Judul Training",
          cell: (training) => (
            <span className="font-medium">{training.title}</span>
          ),
        },
        {
          id: "status",
          header: "Status",
          cell: (training) => (
            <span className="text-sm text-muted-foreground">
              {training.statusLabel}
            </span>
          ),
        },
        {
          id: "actions",
          header: "Aksi",
          headerClassName: "text-right",
          className: "text-right",
          cell: (training) =>
            training.canOpen ? (
              <ButtonLink
                variant="outline"
                size="xs"
                href={getAssessmentPath(
                  "student",
                  training.id,
                  props.assessmentType,
                )}
              >
                Buka {typeLabel}
              </ButtonLink>
            ) : (
              <span className="text-xs text-muted-foreground">
                {props.assessmentType === "pre_test"
                  ? "Belum aktif"
                  : "Terkunci"}
              </span>
            ),
        },
      ]}
    />
  );
}
