"use client";

import { useActionState, useEffect } from "react";
import { IconUpload } from "@tabler/icons-react";

import {
  importQuestionsAction,
  type AssessmentActionState,
} from "@/app/actions/assessments";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useActionToast } from "@/hooks/use-action-toast";
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

  useActionToast(state);

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

      <Field>
        <FieldLabel htmlFor="file">Upload File Excel (.xlsx)</FieldLabel>
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
