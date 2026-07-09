"use client";

import { useActionState } from "react";

import {
  createModuleAction,
  type ModuleActionState,
} from "@/app/actions/modules";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";

const initialState: ModuleActionState = {};

type ModuleCreateFormProps = {
  trainingId: string;
};

export function ModuleCreateForm({ trainingId }: ModuleCreateFormProps) {
  const [state, formAction, pending] = useActionState(
    createModuleAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="trainingId" value={trainingId} />

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

      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="title">Judul Modul</FieldLabel>
          <Input id="title" name="title" required placeholder="Judul modul" />
        </Field>
        <Field>
          <FieldLabel htmlFor="description">Deskripsi</FieldLabel>
          <Textarea
            id="description"
            name="description"
            rows={3}
            placeholder="Deskripsi modul (opsional)"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="videoConferenceLink">
            Link Video Conference (opsional)
          </FieldLabel>
          <Input
            id="videoConferenceLink"
            name="videoConferenceLink"
            type="url"
            placeholder="https://meet.google.com/..."
          />
        </Field>
      </FieldGroup>

      <Button type="submit" disabled={pending}>
        {pending ? <Spinner className="size-4" /> : "Buat Modul"}
      </Button>
    </form>
  );
}
