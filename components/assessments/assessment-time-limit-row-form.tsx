"use client";

import { useActionState } from "react";

import {
  updateAssessmentTimeLimitAction,
  type AssessmentActionState,
} from "@/app/actions/assessments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useActionToast } from "@/hooks/use-action-toast";
import type { AssessmentType } from "@/lib/domain/assessments/types";

const initialState: AssessmentActionState = {};

type AssessmentTimeLimitRowFormProps = {
  assessmentId: string;
  trainingId: string;
  moduleId: string | null;
  type: AssessmentType;
  timeLimit: number | null;
};

export function AssessmentTimeLimitRowForm({
  assessmentId,
  trainingId,
  moduleId,
  type,
  timeLimit,
}: AssessmentTimeLimitRowFormProps) {
  const [state, formAction, pending] = useActionState(
    updateAssessmentTimeLimitAction,
    initialState,
  );

  useActionToast(state);

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="assessmentId" value={assessmentId} />
      <input type="hidden" name="trainingId" value={trainingId} />
      {moduleId ? <input type="hidden" name="moduleId" value={moduleId} /> : null}
      <input type="hidden" name="type" value={type} />

      <Input
        name="timeLimit"
        type="number"
        min={1}
        defaultValue={timeLimit ?? ""}
        placeholder="Tanpa batas"
        className="h-9 w-28"
      />
      <Button type="submit" size="sm" variant="outline" disabled={pending}>
        {pending ? <Spinner className="size-4" /> : null}
        Simpan
      </Button>
    </form>
  );
}
