"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IconFileText, IconLink, IconPhoto, IconSend } from "@tabler/icons-react";
import { toast } from "sonner";

import {
  submitProjectFormAction,
  type ProjectActionState,
} from "@/app/actions/projects";
import { ProjectFileUpload } from "@/components/projects/project-file-upload";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import type { StudentProject } from "@/lib/db/schema/student-projects";

type ProjectSubmitFormProps = {
  trainingId: string;
  trainingTitle: string;
  project: StudentProject | null;
};

const initialState: ProjectActionState = {};

function fileNameFromUrl(url: string): string | undefined {
  if (!url) {
    return undefined;
  }
  const last = url.split("/").pop();
  return last ? decodeURIComponent(last) : undefined;
}

export function ProjectSubmitForm({
  trainingId,
  trainingTitle,
  project,
}: ProjectSubmitFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    submitProjectFormAction,
    initialState,
  );

  const [imageUrl, setImageUrl] = useState(project?.imageUrl ?? "");
  const [imageName, setImageName] = useState(
    fileNameFromUrl(project?.imageUrl ?? "") ?? "",
  );
  const [pdfUrl, setPdfUrl] = useState(project?.pdfUrl ?? "");
  const [pdfName, setPdfName] = useState(
    fileNameFromUrl(project?.pdfUrl ?? "") ?? "",
  );
  const [pdfSize, setPdfSize] = useState<number | undefined>(
    project?.pdfFileSize ?? undefined,
  );

  useEffect(() => {
    if (state.success) {
      toast.success(state.message ?? "Project berhasil disimpan.");
      router.push(`/student/projects/${trainingId}`);
    } else if (state.error) {
      toast.error(state.message ?? "Gagal menyimpan project.");
    }
  }, [state, router, trainingId]);

  const canSubmit = Boolean(imageUrl) && Boolean(pdfUrl) && !isPending;

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="trainingId" value={trainingId} />
      {project ? (
        <input type="hidden" name="projectId" value={project.id} />
      ) : null}
      <input type="hidden" name="imageUrl" value={imageUrl} />
      <input type="hidden" name="pdfUrl" value={pdfUrl} />
      <input type="hidden" name="pdfFileSize" value={pdfSize ?? ""} />

      <FieldGroup className="gap-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <IconSend className="size-4" />
            </span>
            Project untuk {trainingTitle}
          </div>
          <p className="text-sm text-muted-foreground">
            Unggah gambar project, tautan video, dan file PDF Anda.
          </p>
        </div>

        <Field>
          <FieldLabel htmlFor="title">Judul Project</FieldLabel>
          <Input
            id="title"
            name="title"
            defaultValue={project?.title ?? ""}
            placeholder="Contoh: Rancangan Sistem Keselamatan Kerja"
            maxLength={200}
            className="h-10 text-sm md:text-sm"
          />
          <FieldDescription>Opsional.</FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="description">Deskripsi</FieldLabel>
          <Textarea
            id="description"
            name="description"
            defaultValue={project?.description ?? ""}
            placeholder="Jelaskan secara singkat isi project Anda..."
            rows={4}
            className="min-h-24 text-sm md:text-sm"
          />
          <FieldDescription>Opsional.</FieldDescription>
        </Field>
      </FieldGroup>

      <FieldSeparator />

      <FieldGroup className="gap-5">
        <Field>
          <FieldLabel className="flex items-center gap-1.5">
            <IconPhoto className="size-3.5 text-muted-foreground" />
            Gambar Project
          </FieldLabel>
          <ProjectFileUpload
            trainingId={trainingId}
            kind="image"
            uploadedFileName={imageName || undefined}
            onUploaded={({ url, fileName }) => {
              setImageUrl(url);
              setImageName(fileName);
            }}
            onClear={() => {
              setImageUrl("");
              setImageName("");
            }}
          />
          <FieldDescription>Wajib. JPG, JPEG, PNG, WEBP · maksimal 2 MB.</FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="videoUrl" className="flex items-center gap-1.5">
            <IconLink className="size-3.5 text-muted-foreground" />
            Link Video
          </FieldLabel>
          <Input
            id="videoUrl"
            name="videoUrl"
            type="url"
            required
            defaultValue={project?.videoUrl ?? ""}
            placeholder="https://youtube.com/..."
            className="h-10 text-sm md:text-sm"
          />
          <FieldDescription>
            Wajib. Tempel tautan video (YouTube, Google Drive, dll).
          </FieldDescription>
        </Field>

        <Field>
          <FieldLabel className="flex items-center gap-1.5">
            <IconFileText className="size-3.5 text-muted-foreground" />
            File PDF
          </FieldLabel>
          <ProjectFileUpload
            trainingId={trainingId}
            kind="pdf"
            uploadedFileName={pdfName || undefined}
            onUploaded={({ url, fileName, size }) => {
              setPdfUrl(url);
              setPdfName(fileName);
              setPdfSize(size);
            }}
            onClear={() => {
              setPdfUrl("");
              setPdfName("");
              setPdfSize(undefined);
            }}
          />
          <FieldDescription>Wajib. PDF · maksimal 10 MB.</FieldDescription>
        </Field>
      </FieldGroup>

      <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          {project
            ? "Perubahan akan memperbarui project Anda yang sudah ada."
            : "Pastikan gambar dan PDF sudah terunggah sebelum menyimpan."}
        </p>
        <Button type="submit" size="lg" className="shrink-0" disabled={!canSubmit}>
          {isPending ? <Spinner className="size-4" data-icon="inline-start" /> : (
            <IconSend data-icon="inline-start" />
          )}
          {project ? "Perbarui Project" : "Simpan Project"}
        </Button>
      </div>
    </form>
  );
}
