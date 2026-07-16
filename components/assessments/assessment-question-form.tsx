"use client";

import { useActionState, useEffect, useState, type ReactNode } from "react";

import {
  createQuestionAction,
  updateQuestionAction,
  type AssessmentActionState,
} from "@/app/actions/assessments";
import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useActionToast } from "@/hooks/use-action-toast";
import { cn } from "@/lib/utils";
import type { AssessmentType } from "@/lib/domain/assessments/types";
import type { QuestionRecord } from "@/lib/infrastructure/db/repositories/assessment-repository";

const initialState: AssessmentActionState = {};

const OPTION_LABELS = ["A", "B", "C", "D", "E"] as const;

type AssessmentQuestionFormProps = {
  assessmentId: string;
  trainingId: string;
  moduleId?: string;
  type: AssessmentType;
  question?: QuestionRecord;
  onSuccess?: () => void;
};

type QuestionFormSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

function QuestionFormSection({
  title,
  description,
  children,
}: QuestionFormSectionProps) {
  return (
    <section className="rounded-xl border bg-muted/15 p-4">
      <div className="mb-4">
        <h3 className="text-sm font-semibold">{title}</h3>
        {description ? (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

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

  useActionToast(state);

  const defaultCorrectLabel =
    question?.options.findIndex((option) => option.isCorrect) ?? -1;
  const initialCorrectAnswer =
    defaultCorrectLabel >= 0
      ? OPTION_LABELS[defaultCorrectLabel]
      : "A";
  const [correctAnswer, setCorrectAnswer] = useState(initialCorrectAnswer);

  const handleCorrectAnswerChange = (value: string | null) => {
    const nextAnswer = OPTION_LABELS.find((label) => label === value);

    if (nextAnswer) {
      setCorrectAnswer(nextAnswer);
    }
  };

  useEffect(() => {
    if (state.success) {
      onSuccess?.();
    }
  }, [state.success, onSuccess]);

  return (
    <form action={formAction} className="flex min-h-0 flex-1 flex-col">
      <input type="hidden" name="assessmentId" value={assessmentId} />
      <input type="hidden" name="trainingId" value={trainingId} />
      {moduleId ? (
        <input type="hidden" name="moduleId" value={moduleId} />
      ) : null}
      <input type="hidden" name="type" value={type} />
      {question ? (
        <input type="hidden" name="questionId" value={question.id} />
      ) : null}

      <div className="flex-1 space-y-4 overflow-y-auto overscroll-contain px-6 py-4">
        <QuestionFormSection title="Pertanyaan">
          <Field>
            <FieldLabel htmlFor="questionText">Teks Soal</FieldLabel>
            <Textarea
              id="questionText"
              name="questionText"
              defaultValue={question?.questionText ?? ""}
              placeholder="Tulis pertanyaan pilihan ganda..."
              rows={4}
              required
            />
          </Field>
        </QuestionFormSection>

        <QuestionFormSection
          title="Opsi Jawaban"
          description="Isi kelima opsi jawaban untuk soal pilihan ganda."
        >
          <div className="grid gap-4 lg:grid-cols-2">
            {OPTION_LABELS.map((label, index) => (
              <Field key={label}>
                <FieldLabel htmlFor={`option_${label}`}>Opsi {label}</FieldLabel>
                <Textarea
                  id={`option_${label}`}
                  name={`option_${label}`}
                  defaultValue={question?.options[index]?.text ?? ""}
                  placeholder={`Teks opsi ${label}`}
                  rows={3}
                  required
                />
              </Field>
            ))}
          </div>
        </QuestionFormSection>

        <QuestionFormSection
          title="Jawaban Benar"
          description="Pilih opsi yang merupakan jawaban benar."
        >
          <RadioGroup
            name="correctAnswer"
            value={correctAnswer}
            onValueChange={handleCorrectAnswerChange}
            className="grid grid-cols-2 gap-3 sm:grid-cols-5"
          >
            {OPTION_LABELS.map((label) => {
              const selected = correctAnswer === label;

              return (
                <Label
                  key={label}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-lg border bg-background p-3 text-sm font-normal",
                    selected && "border-primary bg-primary/5 ring-1 ring-primary/20",
                  )}
                >
                  <RadioGroupItem value={label} />
                  Opsi {label}
                </Label>
              );
            })}
          </RadioGroup>
        </QuestionFormSection>
      </div>

      <DialogFooter className="shrink-0 border-t bg-background px-6 py-4">
        <DialogClose render={<Button type="button" variant="outline" />}>
          Batal
        </DialogClose>
        <Button type="submit" disabled={pending}>
          {pending ? <Spinner className="size-4" /> : null}
          {question ? "Simpan Perubahan" : "Tambah Soal"}
        </Button>
      </DialogFooter>
    </form>
  );
}
