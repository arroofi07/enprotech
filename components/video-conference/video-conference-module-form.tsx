"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { IconExternalLink, IconPlayerStop } from "@tabler/icons-react";
import { toast } from "sonner";

import {
  endModuleVideoConferenceAction,
  updateModuleVideoConferenceAction,
  type ModuleActionState,
} from "@/app/actions/modules";
import { VideoConferenceStatusBadge } from "@/components/video-conference/video-conference-status-badge";
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
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  formatVideoConferenceSchedule,
  toDateTimeLocalValue,
} from "@/lib/domain/modules/format-video-conference-schedule";
import { getVideoConferenceState } from "@/lib/domain/modules/video-conference-access";
import type { ModuleWithContents } from "@/lib/infrastructure/db/repositories/module-repository";

const initialState: ModuleActionState = {};

function getScheduledAtValue(
  scheduledAt: ModuleWithContents["videoConferenceScheduledAt"],
): string {
  if (!scheduledAt) {
    return "";
  }

  const date =
    scheduledAt instanceof Date ? scheduledAt : new Date(scheduledAt);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return toDateTimeLocalValue(date);
}

type VideoConferenceModuleFormProps = {
  trainingId: string;
  module: ModuleWithContents;
};

export function VideoConferenceModuleForm({
  trainingId,
  module,
}: VideoConferenceModuleFormProps) {
  const [link, setLink] = useState(() => module.videoConferenceLink ?? "");
  const [scheduledAt, setScheduledAt] = useState(() =>
    getScheduledAtValue(module.videoConferenceScheduledAt),
  );
  const conferenceState = getVideoConferenceState(
    module.videoConferenceScheduledAt,
    module.videoConferenceEndedAt,
    new Date(),
  );

  useEffect(() => {
    setLink(module.videoConferenceLink ?? "");
    setScheduledAt(getScheduledAtValue(module.videoConferenceScheduledAt));
  }, [module.videoConferenceLink, module.videoConferenceScheduledAt]);

  const saveAction = useMemo(
    () => async (prevState: ModuleActionState, formData: FormData) => {
      const result = await updateModuleVideoConferenceAction(prevState, formData);
      if (result.success) {
        toast.success(result.message ?? "Jadwal video conference disimpan.");
      } else if (result.message) {
        toast.error(result.message);
      }
      return result;
    },
    [],
  );
  const endAction = useMemo(
    () => async (prevState: ModuleActionState, formData: FormData) => {
      const result = await endModuleVideoConferenceAction(prevState, formData);
      if (result.success) {
        toast.success(result.message ?? "Video conference diakhiri.");
      } else if (result.message) {
        toast.error(result.message);
      }
      return result;
    },
    [],
  );
  const [, formAction, pending] = useActionState(saveAction, initialState);
  const [, endFormAction, ending] = useActionState(endAction, initialState);

  return (
    <form action={formAction} className="space-y-4 rounded-lg border p-4">
      <input type="hidden" name="moduleId" value={module.id} />
      <input type="hidden" name="trainingId" value={trainingId} />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium">{module.title}</p>
          <p className="text-xs text-muted-foreground">
            Modul {module.order + 1}
          </p>
        </div>
        <VideoConferenceStatusBadge state={conferenceState} />
      </div>

      {conferenceState === "ended" && module.videoConferenceEndedAt ? (
        <p className="rounded-md border border-dashed bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          Video conference diakhiri pada{" "}
          {formatVideoConferenceSchedule(module.videoConferenceEndedAt)}.
          Siswa tidak bisa bergabung lagi, tetapi quiz tetap tersedia.
        </p>
      ) : null}

      <Field>
        <FieldLabel htmlFor={`vc-link-${module.id}`}>
          Link Google Meet / Zoom
        </FieldLabel>
        <Input
          id={`vc-link-${module.id}`}
          name="videoConferenceLink"
          type="url"
          value={link}
          onChange={(event) => setLink(event.target.value)}
          placeholder="https://meet.google.com/..."
        />
      </Field>

      <Field>
        <FieldLabel htmlFor={`vc-schedule-${module.id}`}>
          Jadwal Video Conference
        </FieldLabel>
        <Input
          id={`vc-schedule-${module.id}`}
          name="videoConferenceScheduledAt"
          type="datetime-local"
          value={scheduledAt}
          onChange={(event) => setScheduledAt(event.target.value)}
        />
      </Field>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" size="sm" disabled={pending || ending}>
          {pending ? <Spinner className="size-4" /> : "Simpan Jadwal"}
        </Button>

        {conferenceState === "live" && module.videoConferenceLink ? (
          <>
            <Button
              type="button"
              size="sm"
              variant="outline"
              render={
                <a
                  href={module.videoConferenceLink}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              <IconExternalLink className="size-4" />
              Buka Meeting
            </Button>

            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    disabled={pending || ending}
                  />
                }
              >
                {ending ? (
                  <Spinner className="size-4" />
                ) : (
                  <IconPlayerStop className="size-4" />
                )}
                Akhiri Video Conference
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Akhiri video conference?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Siswa tidak akan bisa bergabung ke meeting setelah
                    diakhiri. Quiz modul tetap tersedia bagi siswa yang sudah
                    hadir.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <form action={endFormAction}>
                    <input type="hidden" name="moduleId" value={module.id} />
                    <input
                      type="hidden"
                      name="trainingId"
                      value={trainingId}
                    />
                    <Button type="submit" variant="destructive" disabled={ending}>
                      {ending ? <Spinner className="size-4" /> : "Akhiri"}
                    </Button>
                  </form>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        ) : null}
      </div>
    </form>
  );
}
