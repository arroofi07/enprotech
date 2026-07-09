"use client";

import { useActionState, useEffect } from "react";
import { IconDownload, IconUpload } from "@tabler/icons-react";

import {
  importQuestionsAction,
  type AssessmentActionState,
} from "@/app/actions/assessments";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import type { AssessmentType } from "@/lib/domain/assessments/types";

const initialState: AssessmentActionState = {};

type AssessmentImportDialogProps = {
  assessmentId: string;
  trainingId: string;
  moduleId?: string;
  type: AssessmentType;
  onSuccess?: () => void;
};

export function AssessmentImportDialog({
  assessmentId,
  trainingId,
  moduleId,
  type,
  onSuccess,
}: AssessmentImportDialogProps) {
  const [state, formAction, pending] = useActionState(
    importQuestionsAction,
    initialState,
  );

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

      <Alert>
        <AlertDescription>
          Gunakan template Excel dengan kolom: no, question, option_a, option_b,
          option_c, option_d, correct_answer (A/B/C/D).
        </AlertDescription>
      </Alert>

      <Button
        type="button"
        variant="outline"
        render={
          <a href="/templates/assessment-questions-template.xlsx" download />
        }
      >
        <IconDownload className="size-4" />
        Unduh Template Excel
      </Button>

      <Field>
        <FieldLabel htmlFor="file">File Excel (.xlsx)</FieldLabel>
        <Input
          id="file"
          name="file"
          type="file"
          accept=".xlsx,.xls"
          required
        />
      </Field>

      <DialogFooter>
        <Button type="submit" disabled={pending}>
          {pending ? <Spinner className="size-4" /> : null}
          <IconUpload className="size-4" />
          Impor Soal
        </Button>
      </DialogFooter>
    </form>
  );
}
