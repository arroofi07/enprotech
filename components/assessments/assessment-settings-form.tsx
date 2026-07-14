"use client";

import { useActionState } from "react";

import {
  updateAssessmentSettingsAction,
  type AssessmentActionState,
} from "@/app/actions/assessments";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useActionToast } from "@/hooks/use-action-toast";
import { getEffectiveDisplayCount } from "@/lib/domain/assessments/prepare-attempt-questions";
import type { AssessmentType } from "@/lib/domain/assessments/types";
import type { AssessmentRecord } from "@/lib/infrastructure/db/repositories/assessment-repository";

const initialState: AssessmentActionState = {};

type AssessmentSettingsFormProps = {
  assessment: AssessmentRecord;
  trainingId: string;
  moduleId?: string;
  type: AssessmentType;
  totalQuestions: number;
};

export function AssessmentSettingsForm({
  assessment,
  trainingId,
  moduleId,
  type,
  totalQuestions,
}: AssessmentSettingsFormProps) {
  const [state, formAction, pending] = useActionState(
    updateAssessmentSettingsAction,
    initialState,
  );

  useActionToast(state);

  const effectiveCount = getEffectiveDisplayCount(
    totalQuestions,
    assessment.questionDisplayCount,
  );

  return (
    <form action={formAction} className="space-y-4 rounded-xl border bg-muted/15 p-4">
      <input type="hidden" name="assessmentId" value={assessment.id} />
      <input type="hidden" name="trainingId" value={trainingId} />
      {moduleId ? <input type="hidden" name="moduleId" value={moduleId} /> : null}
      <input type="hidden" name="type" value={type} />

      <div>
        <h3 className="text-sm font-semibold">Pengaturan Tampilan Soal</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Atur berapa soal yang ditampilkan ke student dan apakah urutan soal
          diacak setiap attempt baru.
        </p>
      </div>

      <FieldGroup className="gap-4 sm:grid-cols-3">
        <Field>
          <FieldLabel htmlFor="questionDisplayCount">
            Jumlah Soal Ditampilkan
          </FieldLabel>
          <Input
            id="questionDisplayCount"
            name="questionDisplayCount"
            type="number"
            min={1}
            max={totalQuestions || undefined}
            defaultValue={assessment.questionDisplayCount ?? ""}
            placeholder={
              totalQuestions > 0 ? `Semua (${totalQuestions})` : "Semua soal"
            }
          />
          <p className="text-xs text-muted-foreground">
            Kosongkan untuk menampilkan semua soal. Saat ini efektif:{" "}
            <span className="font-medium text-foreground">
              {totalQuestions > 0 ? effectiveCount : 0}
            </span>{" "}
            soal.
          </p>
        </Field>

        <Field>
          <FieldLabel htmlFor="timeLimit">Batas Waktu (menit)</FieldLabel>
          <Input
            id="timeLimit"
            name="timeLimit"
            type="number"
            min={1}
            defaultValue={assessment.timeLimit ?? ""}
            placeholder="Tanpa batas waktu"
          />
          <p className="text-xs text-muted-foreground">
            Kosongkan jika student tidak dibatasi waktu pengerjaan.
          </p>
        </Field>

        <Field>
          <FieldLabel htmlFor="shuffleQuestions">Acak Urutan Soal</FieldLabel>
          <label
            htmlFor="shuffleQuestions"
            className="flex h-10 items-center gap-3 rounded-md border bg-background px-3"
          >
            <input
              id="shuffleQuestions"
              name="shuffleQuestions"
              type="checkbox"
              value="true"
              defaultChecked={assessment.shuffleQuestions}
              className="size-4 rounded border-input"
            />
            <span className="text-sm text-muted-foreground">
              Acak urutan soal setiap attempt baru
            </span>
          </label>
        </Field>
      </FieldGroup>

      <Button type="submit" disabled={pending || totalQuestions === 0}>
        {pending ? <Spinner className="size-4" /> : null}
        Simpan Pengaturan
      </Button>
    </form>
  );
}
