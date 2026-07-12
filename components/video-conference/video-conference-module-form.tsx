"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  updateModuleVideoConferenceAction,
  type ModuleActionState,
} from "@/app/actions/modules";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toDateTimeLocalValue } from "@/lib/domain/modules/format-video-conference-schedule";
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
  const [, formAction, pending] = useActionState(saveAction, initialState);

  return (
    <form action={formAction} className="space-y-4 rounded-lg border p-4">
      <input type="hidden" name="moduleId" value={module.id} />
      <input type="hidden" name="trainingId" value={trainingId} />

      <div>
        <p className="font-medium">{module.title}</p>
        <p className="text-xs text-muted-foreground">
          Modul {module.order + 1}
        </p>
      </div>

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
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? <Spinner className="size-4" /> : "Simpan Jadwal"}
        </Button>
      </div>
    </form>
  );
}
