"use client";

import { useActionState, useEffect } from "react";

import {
  createQuestionAction,
  updateQuestionAction,
  type AssessmentActionState,
} from "@/app/actions/assessments";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import type { AssessmentType } from "@/lib/domain/assessments/types";
import type { QuestionRecord } from "@/lib/infrastructure/db/repositories/assessment-repository";

const initialState: AssessmentActionState = {};

const OPTION_LABELS = ["A", "B", "C", "D"] as const;

type AssessmentQuestionFormProps = {
  assessmentId: string;
  trainingId: string;
  moduleId?: string;
  type: AssessmentType;
  question?: QuestionRecord;
  onSuccess?: () => void;
};

export function AssessmentQuestionForm({
  assessmentId,
  trainingId,
  moduleId,
  type,
  question,
  onSuccess,
}: AssessmentQuestionFormProps) {
  const action = question ? updateQuestionAction : createQuestionAction;
  const [state, formAction, pending] = useActionState(action, initialState);

  const defaultCorrectLabel =
    question?.options.findIndex((option) => option.isCorrect) ?? -1;
  const correctAnswer =
    defaultCorrectLabel >= 0
      ? OPTION_LABELS[defaultCorrectLabel]
      : "A";

  useEffect(() => {
    if (state.success) {
      onSuccess?.();
    }
  }, [state.success, onSuccess]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="assessmentId" value={assessmentId} />
      <input type="hidden" name="trainingId" value={trainingId} />
      {moduleId ? (
        <input type="hidden" name="moduleId" value={moduleId} />
      ) : null}
      <input type="hidden" name="type" value={type} />
      {question ? (
        <input type="hidden" name="questionId" value={question.id} />
      ) : null}

      {state.error ? (
        <Alert variant="destructive">
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}

      {state.success ? (
        <Alert>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}

      <Field>
        <FieldLabel htmlFor="questionText">Pertanyaan</FieldLabel>
        <Textarea
          id="questionText"
          name="questionText"
          defaultValue={question?.questionText ?? ""}
          placeholder="Tulis pertanyaan pilihan ganda..."
          rows={3}
          required
        />
      </Field>

      <div className="space-y-3">
        <p className="text-sm font-medium">Opsi Jawaban</p>
        {OPTION_LABELS.map((label, index) => (
          <Field key={label}>
            <FieldLabel htmlFor={`option_${label}`}>Opsi {label}</FieldLabel>
            <Textarea
              id={`option_${label}`}
              name={`option_${label}`}
              defaultValue={question?.options[index]?.text ?? ""}
              placeholder={`Teks opsi ${label}`}
              rows={2}
              required
            />
          </Field>
        ))}
      </div>

      <Field>
        <FieldLabel>Jawaban Benar</FieldLabel>
        <RadioGroup
          name="correctAnswer"
          defaultValue={correctAnswer}
          className="grid grid-cols-2 gap-3 sm:grid-cols-4"
        >
          {OPTION_LABELS.map((label) => (
            <label
              key={label}
              className="flex items-center gap-2 rounded-lg border p-3 text-sm"
            >
              <RadioGroupItem value={label} />
              Opsi {label}
            </label>
          ))}
        </RadioGroup>
      </Field>

      <DialogFooter>
        <Button type="submit" disabled={pending}>
          {pending ? <Spinner className="size-4" /> : null}
          {question ? "Simpan Perubahan" : "Tambah Soal"}
        </Button>
      </DialogFooter>
    </form>
  );
}
