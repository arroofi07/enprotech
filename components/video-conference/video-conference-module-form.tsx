"use client";

import { useActionState, useMemo } from "react";
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

type VideoConferenceModuleFormProps = {
  trainingId: string;
  module: ModuleWithContents;
};

export function VideoConferenceModuleForm({
  trainingId,
  module,
}: VideoConferenceModuleFormProps) {
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
          defaultValue={module.videoConferenceLink ?? ""}
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
          defaultValue={
            module.videoConferenceScheduledAt
              ? toDateTimeLocalValue(module.videoConferenceScheduledAt)
              : ""
          }
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
