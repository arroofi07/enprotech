"use client";

import { useActionState, useState } from "react";
import { IconExternalLink, IconListCheck, IconPencil } from "@tabler/icons-react";

import {
  deleteModuleAction,
  updateModuleAction,
  type ModuleActionState,
} from "@/app/actions/modules";
import { ModuleContentForm } from "@/components/modules/module-content-form";
import { ModuleContentList } from "@/components/modules/module-content-list";
import { ModuleFileUpload } from "@/components/modules/module-file-upload";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import type { ModuleWithContents } from "@/lib/infrastructure/db/repositories/module-repository";

const initialState: ModuleActionState = {};

type ModuleEditCardProps = {
  module: ModuleWithContents;
  trainingId: string;
};

export function ModuleEditCard({ module, trainingId }: ModuleEditCardProps) {
  const [thumbnailUrl, setThumbnailUrl] = useState(module.thumbnail ?? "");
  const [updateState, updateAction, updatePending] = useActionState(
    updateModuleAction,
    initialState,
  );
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteModuleAction,
    initialState,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">{module.title}</h3>
          <p className="text-sm text-muted-foreground">
            Urutan {module.order + 1} · {module.contents.length} konten
          </p>
        </div>
        {module.videoConferenceLink ? (
          <Button
            variant="outline"
            size="xs"
            render={
              <a
                href={module.videoConferenceLink}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            <IconExternalLink className="size-3.5" />
            Meet/Zoom
          </Button>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          render={
            <a
              href={`/trainer/trainings/${trainingId}/modules/${module.id}/quiz`}
            />
          }
        >
          <IconListCheck className="size-4" />
          Kelola Quiz
        </Button>
        <Button
          variant="outline"
          size="sm"
          render={
            <a
              href={`/trainer/trainings/${trainingId}/modules/${module.id}/latihan`}
            />
          }
        >
          <IconPencil className="size-4" />
          Kelola Latihan
        </Button>
      </div>

      {updateState.message ? (
        <Alert variant={updateState.error ? "destructive" : "default"}>
          <AlertDescription>{updateState.message}</AlertDescription>
        </Alert>
      ) : null}

      <form action={updateAction} className="space-y-4">
        <input type="hidden" name="moduleId" value={module.id} />
        <input type="hidden" name="trainingId" value={trainingId} />
        <input type="hidden" name="thumbnail" value={thumbnailUrl} />

        <FieldGroup>
          <Field>
            <FieldLabel htmlFor={`title-${module.id}`}>Nama Modul</FieldLabel>
            <Input
              id={`title-${module.id}`}
              name="title"
              defaultValue={module.title}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor={`order-${module.id}`}>Urutan</FieldLabel>
            <Input
              id={`order-${module.id}`}
              name="order"
              type="number"
              min={1}
              defaultValue={module.order + 1}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor={`description-${module.id}`}>
              Target Pelatihan
            </FieldLabel>
            <Textarea
              id={`description-${module.id}`}
              name="description"
              rows={3}
              defaultValue={module.description ?? ""}
              placeholder="Jelaskan target pembelajaran modul ini"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor={`vc-${module.id}`}>
              Link Video Conference
            </FieldLabel>
            <Input
              id={`vc-${module.id}`}
              name="videoConferenceLink"
              type="url"
              defaultValue={module.videoConferenceLink ?? ""}
              placeholder="https://meet.google.com/..."
            />
          </Field>
        </FieldGroup>

        <div className="space-y-3 rounded-lg border p-4">
          <div>
            <p className="text-sm font-medium">Syarat Lanjut Modul</p>
            <p className="text-xs text-muted-foreground">
              Tentukan nilai minimal agar peserta dapat lanjut ke modul
              berikutnya.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field>
              <FieldLabel htmlFor={`minQuiz-${module.id}`}>
                Quiz Minimal (%)
              </FieldLabel>
              <Input
                id={`minQuiz-${module.id}`}
                name="minQuizScore"
                type="number"
                min={0}
                max={100}
                defaultValue={module.minQuizScore}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`minLatihan-${module.id}`}>
                Latihan Minimal (%)
              </FieldLabel>
              <Input
                id={`minLatihan-${module.id}`}
                name="minLatihanScore"
                type="number"
                min={0}
                max={100}
                defaultValue={module.minLatihanScore}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`minAttendance-${module.id}`}>
                Kehadiran (%)
              </FieldLabel>
              <Input
                id={`minAttendance-${module.id}`}
                name="minAttendance"
                type="number"
                min={0}
                max={100}
                defaultValue={module.minAttendance}
              />
            </Field>
          </div>
        </div>

        <div className="space-y-2">
          <FieldLabel>Upload Gambar Thumbnail</FieldLabel>
          {thumbnailUrl ? (
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={thumbnailUrl}
                alt={module.title}
                className="h-16 w-24 rounded-md object-cover"
              />
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={() => setThumbnailUrl("")}
              >
                Hapus
              </Button>
            </div>
          ) : (
            <ModuleFileUpload
              purpose="thumbnail"
              onUploaded={({ url }) => setThumbnailUrl(url)}
            />
          )}
          <p className="text-xs text-muted-foreground">
            Format: JPG, JPEG, PNG, WEBP. Maksimal 1 MB per file.
          </p>
        </div>

        <Button type="submit" disabled={updatePending}>
          {updatePending ? <Spinner className="size-4" /> : "Simpan Modul"}
        </Button>
      </form>

      <Collapsible defaultOpen>
        <CollapsibleTrigger className="text-sm font-medium">
          Materi & Konten Tambahan
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 pt-4">
          <ModuleContentList
            contents={module.contents}
            moduleId={module.id}
            trainingId={trainingId}
            editable
          />
          <ModuleContentForm moduleId={module.id} trainingId={trainingId} />
        </CollapsibleContent>
      </Collapsible>

      <AlertDialog>
        <AlertDialogTrigger render={<Button variant="destructive" size="sm" />}>
          Hapus Modul
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus modul?</AlertDialogTitle>
            <AlertDialogDescription>
              Semua konten modul akan ikut terhapus. Tindakan ini tidak dapat
              dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <form action={deleteAction}>
              <input type="hidden" name="moduleId" value={module.id} />
              <input type="hidden" name="trainingId" value={trainingId} />
              <Button type="submit" variant="destructive" disabled={deletePending}>
                {deletePending ? <Spinner className="size-4" /> : "Hapus"}
              </Button>
            </form>
          </AlertDialogFooter>
          {deleteState.message ? (
            <p className="text-sm text-muted-foreground">{deleteState.message}</p>
          ) : null}
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
