"use client";

import { useActionState } from "react";
import { IconPencil, IconTrash } from "@tabler/icons-react";

import {
  deleteQuestionAction,
  type AssessmentActionState,
} from "@/app/actions/assessments";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { useActionToast } from "@/hooks/use-action-toast";
import type { AssessmentType } from "@/lib/domain/assessments/types";
import type { QuestionRecord } from "@/lib/infrastructure/db/repositories/assessment-repository";

const initialState: AssessmentActionState = {};

type AssessmentQuestionTableProps = {
  questions: QuestionRecord[];
  trainingId: string;
  moduleId?: string;
  type: AssessmentType;
  onEdit: (question: QuestionRecord) => void;
};

function DeleteQuestionButton({
  question,
  trainingId,
  moduleId,
  type,
}: {
  question: QuestionRecord;
  trainingId: string;
  moduleId?: string;
  type: AssessmentType;
}) {
  const [state, formAction, pending] = useActionState(
    deleteQuestionAction,
    initialState,
  );

  useActionToast(state);

  return (
    <form action={formAction}>
      <input type="hidden" name="questionId" value={question.id} />
      <input type="hidden" name="trainingId" value={trainingId} />
      {moduleId ? (
        <input type="hidden" name="moduleId" value={moduleId} />
      ) : null}
      <input type="hidden" name="type" value={type} />
      <Button
        type="submit"
        variant="outline"
        size="xs"
        disabled={pending}
        onClick={(event) => {
          if (!window.confirm("Hapus soal ini?")) {
            event.preventDefault();
          }
        }}
      >
        <IconTrash className="size-3.5" />
        Hapus
      </Button>
    </form>
  );
}

export function AssessmentQuestionTable({
  questions,
  trainingId,
  moduleId,
  type,
  onEdit,
}: AssessmentQuestionTableProps) {
  return (
    <DataTable
      data={questions}
      getRowKey={(question) => question.id}
      emptyState={{ message: "Belum ada soal. Tambahkan soal atau impor dari Excel." }}
      columns={[
        {
          id: "order",
          header: "No",
          headerClassName: "w-14",
          className: "w-14",
          cell: (question) => (
            <span className="font-medium">{question.order + 1}</span>
          ),
        },
        {
          id: "question",
          header: "Pertanyaan",
          className: "max-w-md whitespace-normal",
          cell: (question) => (
            <p className="text-sm">{question.questionText}</p>
          ),
        },
        {
          id: "correct",
          header: "Jawaban Benar",
          cell: (question) => {
            const correct = question.options.find((option) => option.isCorrect);
            const index = question.options.findIndex((option) => option.isCorrect);
            const label = index >= 0 ? String.fromCharCode(65 + index) : "—";

            return (
              <span className="text-sm">
                {label}. {correct?.text ?? "—"}
              </span>
            );
          },
        },
        {
          id: "actions",
          header: "Aksi",
          headerClassName: "text-right",
          className: "text-right",
          cell: (question) => (
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="xs"
                onClick={() => onEdit(question)}
              >
                <IconPencil className="size-3.5" />
                Edit
              </Button>
              <DeleteQuestionButton
                question={question}
                trainingId={trainingId}
                moduleId={moduleId}
                type={type}
              />
            </div>
          ),
        },
      ]}
    />
  );
}
