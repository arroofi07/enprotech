"use client";

import { IconCalendar, IconPhoto, IconPlus, IconSchool } from "@tabler/icons-react";

import { createTrainingFormAction } from "@/app/actions/trainings";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function TrainingCreateForm() {
  return (
    <form action={createTrainingFormAction} className="space-y-8">
      <FieldGroup className="gap-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <IconSchool className="size-4" />
            </span>
            Informasi Training
          </div>
          <p className="text-sm text-muted-foreground">
            Judul dan deskripsi yang jelas membantu peserta memahami program.
          </p>
        </div>

        <Field>
          <FieldLabel htmlFor="title">Judul Training</FieldLabel>
          <Input
            id="title"
            name="title"
            placeholder="Contoh: Safety Induction 2026"
            required
            minLength={3}
            maxLength={200}
            className="h-10 text-sm md:text-sm"
          />
          <FieldDescription>
            Minimal 3 karakter. Gunakan nama yang mudah dikenali peserta.
          </FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="description">Deskripsi</FieldLabel>
          <Textarea
            id="description"
            name="description"
            placeholder="Jelaskan tujuan, materi utama, dan siapa yang sebaiknya mengikuti training ini..."
            rows={5}
            className="min-h-28 text-sm md:text-sm"
          />
          <FieldDescription>
            Opsional, tetapi sangat membantu saat enrollment dan laporan.
          </FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="thumbnail" className="flex items-center gap-1.5">
            <IconPhoto className="size-3.5 text-muted-foreground" />
            URL Thumbnail
          </FieldLabel>
          <Input
            id="thumbnail"
            name="thumbnail"
            type="url"
            placeholder="https://example.com/thumbnail.jpg"
            className="h-10 text-sm md:text-sm"
          />
          <FieldDescription>
            Opsional. Gunakan URL gambar publik untuk kartu training.
          </FieldDescription>
        </Field>
      </FieldGroup>

      <FieldSeparator />

      <FieldGroup className="gap-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <IconCalendar className="size-4" />
            </span>
            Pengaturan Kelulusan
          </div>
          <p className="text-sm text-muted-foreground">
            Tentukan standar kelulusan dan batas waktu penyelesaian.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
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
              className="h-10 text-sm md:text-sm"
            />
            <FieldDescription>
              Nilai minimum agar peserta dinyatakan lulus.
            </FieldDescription>
          </Field>

          <Field>
            <FieldLabel htmlFor="deadline">Deadline</FieldLabel>
            <Input
              id="deadline"
              name="deadline"
              type="date"
              className="h-10 text-sm md:text-sm"
            />
            <FieldDescription>
              Opsional. Kosongkan jika training tidak berbatas waktu.
            </FieldDescription>
          </Field>
        </div>
      </FieldGroup>

      <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          Training baru akan dibuat berstatus draft dan dapat diatur lebih lanjut
          setelah dibuat.
        </p>
        <Button type="submit" size="lg" className="shrink-0">
          <IconPlus data-icon="inline-start" />
          Buat Training
        </Button>
      </div>
    </form>
  );
}
