"use client";

import { useActionState, useMemo, useState, type ReactNode } from "react";

import {
  createModuleAction,
  type ModuleActionState,
} from "@/app/actions/modules";
import { ModuleFileUpload } from "@/components/modules/module-file-upload";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";

const initialState: ModuleActionState = {};

type ModuleCreateFormProps = {
  trainingId: string;
  defaultOrder: number;
  onSuccess?: () => void;
};

type ModuleFormSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

function ModuleFormSection({
  title,
  description,
  children,
}: ModuleFormSectionProps) {
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

export function ModuleCreateForm({
  trainingId,
  defaultOrder,
  onSuccess,
}: ModuleCreateFormProps) {
  const [order, setOrder] = useState(String(defaultOrder));
  const [minQuizScore, setMinQuizScore] = useState("0");
  const [minLatihanScore, setMinLatihanScore] = useState("0");
  const [minAttendance, setMinAttendance] = useState("0");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [thumbnailName, setThumbnailName] = useState("");
  const [materialUrl, setMaterialUrl] = useState("");
  const [materialName, setMaterialName] = useState("");
  const [materialSize, setMaterialSize] = useState<number | undefined>();
  const createAction = useMemo(
    () => async (prevState: ModuleActionState, formData: FormData) => {
      const result = await createModuleAction(prevState, formData);
      if (result.success) {
        onSuccess?.();
      }
      return result;
    },
    [onSuccess],
  );
  const [state, formAction, pending] = useActionState(
    createAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex min-h-0 flex-1 flex-col">
      <input type="hidden" name="trainingId" value={trainingId} />
      <input type="hidden" name="thumbnail" value={thumbnailUrl} />
      <input type="hidden" name="materialUrl" value={materialUrl} />
      {materialSize !== undefined ? (
        <input type="hidden" name="materialSize" value={materialSize} />
      ) : null}

      <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
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

        <ModuleFormSection title="Informasi Modul">
          <div className="grid gap-4 sm:grid-cols-[1fr_7rem]">
            <Field>
              <FieldLabel htmlFor="title">Nama Modul</FieldLabel>
              <Input
                id="title"
                name="title"
                required
                placeholder="Masukkan nama modul"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="order">Urutan</FieldLabel>
              <Input
                id="order"
                name="order"
                type="number"
                min={1}
                value={order}
                onChange={(event) => setOrder(event.target.value)}
                required
              />
            </Field>
          </div>

          <Field className="mt-4">
            <FieldLabel htmlFor="description">Target Pelatihan</FieldLabel>
            <Textarea
              id="description"
              name="description"
              rows={2}
              placeholder="Jelaskan target pembelajaran modul ini"
            />
          </Field>
        </ModuleFormSection>

        <ModuleFormSection
          title="Syarat Lanjut"
          description="Tentukan syarat peserta untuk lanjut ke modul berikutnya."
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <Field>
              <FieldLabel htmlFor="minQuizScore">Quiz Minimal (%)</FieldLabel>
              <Input
                id="minQuizScore"
                name="minQuizScore"
                type="number"
                min={0}
                max={100}
                value={minQuizScore}
                onChange={(event) => setMinQuizScore(event.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="minLatihanScore">
                Latihan Minimal (%)
              </FieldLabel>
              <Input
                id="minLatihanScore"
                name="minLatihanScore"
                type="number"
                min={0}
                max={100}
                value={minLatihanScore}
                onChange={(event) => setMinLatihanScore(event.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="minAttendance">Kehadiran (%)</FieldLabel>
              <Input
                id="minAttendance"
                name="minAttendance"
                type="number"
                min={0}
                max={100}
                value={minAttendance}
                onChange={(event) => setMinAttendance(event.target.value)}
              />
            </Field>
          </div>
        </ModuleFormSection>

        <ModuleFormSection
          title="Materi & Media"
          description="Unggah file atau tambahkan tautan materi pembelajaran."
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <Field>
              <FieldLabel>Upload Gambar Thumbnail</FieldLabel>
              <ModuleFileUpload
                purpose="thumbnail"
                variant="compact"
                uploadedFileName={thumbnailName || undefined}
                onUploaded={({ url, fileName }) => {
                  setThumbnailUrl(url);
                  setThumbnailName(fileName);
                }}
                onClear={() => {
                  setThumbnailUrl("");
                  setThumbnailName("");
                }}
              />
            </Field>
            <Field>
              <FieldLabel>Upload Materi Modul</FieldLabel>
              <ModuleFileUpload
                purpose="document"
                variant="compact"
                uploadedFileName={materialName || undefined}
                onUploaded={({ url, size, fileName }) => {
                  setMaterialUrl(url);
                  setMaterialSize(size);
                  setMaterialName(fileName);
                }}
                onClear={() => {
                  setMaterialUrl("");
                  setMaterialName("");
                  setMaterialSize(undefined);
                }}
              />
            </Field>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="videoUrl">Link Video URL</FieldLabel>
              <Input
                id="videoUrl"
                name="videoUrl"
                type="url"
                placeholder="https://youtube.com/..."
              />
              <p className="text-xs text-muted-foreground">
                YouTube, Vimeo, dll.
              </p>
            </Field>
            <Field>
              <FieldLabel htmlFor="pptUrl">PPT URL</FieldLabel>
              <Input
                id="pptUrl"
                name="pptUrl"
                type="url"
                placeholder="https://drive.google.com/..."
              />
              <p className="text-xs text-muted-foreground">
                Google Drive, OneDrive, dll.
              </p>
            </Field>
          </div>
        </ModuleFormSection>
      </div>

      <DialogFooter className="shrink-0 border-t bg-background px-6 py-4">
        <DialogClose render={<Button type="button" variant="outline" />}>
          Batal
        </DialogClose>
        <Button type="submit" disabled={pending}>
          {pending ? <Spinner className="size-4" /> : "Buat Modul"}
        </Button>
      </DialogFooter>
    </form>
  );
}
