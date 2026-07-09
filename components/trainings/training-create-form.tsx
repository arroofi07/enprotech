"use client";

import { createTrainingFormAction } from "@/app/actions/trainings";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function TrainingCreateForm() {
  return (
    <form action={createTrainingFormAction} className="space-y-6">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="title">Judul Training</FieldLabel>
          <Input
            id="title"
            name="title"
            placeholder="Contoh: Safety Induction 2026"
            required
            minLength={3}
            maxLength={200}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="description">Deskripsi</FieldLabel>
          <Textarea
            id="description"
            name="description"
            placeholder="Deskripsi singkat training..."
            rows={4}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="thumbnail">URL Thumbnail</FieldLabel>
          <Input
            id="thumbnail"
            name="thumbnail"
            type="url"
            placeholder="https://..."
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="passingGrade">Passing Grade (%)</FieldLabel>
            <Input
              id="passingGrade"
              name="passingGrade"
              type="number"
              min={0}
              max={100}
              defaultValue={70}
              required
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="deadline">Deadline (opsional)</FieldLabel>
            <Input id="deadline" name="deadline" type="date" />
          </Field>
        </div>
      </FieldGroup>

      <div className="flex justify-end gap-3">
        <Button type="submit">Buat Training</Button>
      </div>
    </form>
  );
}
