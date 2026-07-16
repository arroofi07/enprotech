"use client";

import { useActionState, useState } from "react";
import { IconScale } from "@tabler/icons-react";

import {
  updateTrainingQuestionWeightsAction,
  type AssessmentActionState,
} from "@/app/actions/assessments";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useActionToast } from "@/hooks/use-action-toast";
import {
  getQuestionWeightStatus,
  getWeightedTotal,
  suggestQuestionWeight,
  TARGET_TOTAL_SCORE,
} from "@/lib/domain/assessments/question-weight";
import type { TrainingQuestionWeightRow } from "@/lib/application/assessments/list-training-question-weights";

const initialState: AssessmentActionState = {};

type TrainingQuestionWeightPanelProps = {
  trainingId: string;
  rows: TrainingQuestionWeightRow[];
};

function toWeightNumber(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === "") {
    return null;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function TotalCell({
  row,
  value,
}: {
  row: TrainingQuestionWeightRow;
  value: string;
}) {
  const weight = toWeightNumber(value);
  const status = getQuestionWeightStatus({
    scoredQuestionCount: row.scoredQuestionCount,
    questionWeight: weight,
  });

  if (status === "unset") {
    return (
      <span className="text-sm text-muted-foreground">
        Dinilai rata ({TARGET_TOTAL_SCORE} ÷ jumlah soal)
      </span>
    );
  }

  if (status === "no_questions") {
    return <Badge variant="outline">Belum ada soal</Badge>;
  }

  const total = getWeightedTotal(row.scoredQuestionCount, weight!);

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium tabular-nums">{total}</span>
      {status === "exact" ? (
        <Badge variant="secondary">Pas 100</Badge>
      ) : (
        <Badge variant="destructive">
          {status === "over" ? "Lebih dari 100" : "Kurang dari 100"}
        </Badge>
      )}
    </div>
  );
}

export function TrainingQuestionWeightPanel({
  trainingId,
  rows,
}: TrainingQuestionWeightPanelProps) {
  const [state, formAction, pending] = useActionState(
    updateTrainingQuestionWeightsAction,
    initialState,
  );

  const [weights, setWeights] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      rows.map((row) => [
        row.assessmentId,
        row.questionWeight === null ? "" : String(row.questionWeight),
      ]),
    ),
  );

  useActionToast(state);

  const setWeight = (assessmentId: string, value: string) => {
    setWeights((current) => ({ ...current, [assessmentId]: value }));
  };

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="trainingId" value={trainingId} />

      <DataTable
        data={rows}
        getRowKey={(row) => row.assessmentId}
        emptyState={{
          message: "Belum ada assessment pada training ini.",
          icon: IconScale,
        }}
        columns={[
          {
            id: "label",
            header: "Assessment",
            cell: (row) => <span className="font-medium">{row.label}</span>,
          },
          {
            id: "questions",
            header: "Jumlah Soal",
            cell: (row) => {
              if (row.questionCount === 0) {
                return <Badge variant="outline">Belum ada soal</Badge>;
              }

              return (
                <div className="flex flex-col gap-0.5">
                  <Badge variant="secondary">{row.questionCount} soal</Badge>
                  {row.scoredQuestionCount !== row.questionCount ? (
                    <span className="text-xs text-muted-foreground">
                      {row.scoredQuestionCount} soal ditampilkan ke peserta
                    </span>
                  ) : null}
                </div>
              );
            },
          },
          {
            id: "weight",
            header: "Bobot per Soal",
            cell: (row) => {
              const suggestion = suggestQuestionWeight(row.scoredQuestionCount);

              return (
                <div className="flex items-center gap-2">
                  <input
                    type="hidden"
                    name="assessmentId"
                    value={row.assessmentId}
                  />
                  <Input
                    name={`weight_${row.assessmentId}`}
                    type="number"
                    step="0.01"
                    min={0.01}
                    max={100}
                    value={weights[row.assessmentId] ?? ""}
                    onChange={(event) =>
                      setWeight(row.assessmentId, event.target.value)
                    }
                    placeholder="Rata"
                    className="h-9 w-24"
                  />
                  {suggestion !== null ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        setWeight(row.assessmentId, String(suggestion))
                      }
                    >
                      Pas 100
                    </Button>
                  ) : null}
                </div>
              );
            },
          },
          {
            id: "total",
            header: "Total Nilai",
            cell: (row) => (
              <TotalCell row={row} value={weights[row.assessmentId] ?? ""} />
            ),
          },
        ]}
      />

      {rows.length > 0 ? (
        <div className="flex justify-end">
          <Button type="submit" disabled={pending}>
            {pending ? <Spinner className="size-4" /> : null}
            Simpan Semua
          </Button>
        </div>
      ) : null}
    </form>
  );
}
