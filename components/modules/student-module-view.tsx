"use client";

import { useActionState, useEffect } from "react";
import { IconExternalLink, IconListCheck, IconPencil } from "@tabler/icons-react";

import {
  markModuleCompleteAction,
  type ModuleActionState,
} from "@/app/actions/modules";
import { ModuleContentList } from "@/components/modules/module-content-list";
import { ModuleProgressBadge } from "@/components/modules/module-progress-badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { StudentModuleDetail } from "@/lib/infrastructure/db/repositories/module-repository";

const initialState: ModuleActionState = {};

type StudentModuleViewProps = {
  module: StudentModuleDetail;
  trainingId: string;
};

export function StudentModuleView({ module, trainingId }: StudentModuleViewProps) {
  const [state, formAction, pending] = useActionState(
    markModuleCompleteAction,
    initialState,
  );

  const status = module.progress?.status ?? "not_started";

  useEffect(() => {
    if (status === "not_started") {
      void fetch(`/api/student/modules/${module.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "in_progress" }),
      });
    }
  }, [module.id, status]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-semibold">{module.title}</h2>
            <ModuleProgressBadge status={status} />
          </div>
          {module.description ? (
            <p className="text-muted-foreground">{module.description}</p>
          ) : null}
        </div>

        {module.videoConferenceLink ? (
          <Button
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
            Buka Video Conference
          </Button>
        ) : null}
      </div>

      {module.thumbnail ? (
        <div className="aspect-video max-w-2xl overflow-hidden rounded-xl bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={module.thumbnail}
            alt={module.title}
            className="h-full w-full object-cover"
          />
        </div>
      ) : null}

      <div className="space-y-3">
        <h3 className="text-lg font-medium">Aktivitas Pembelajaran</h3>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            render={
              <a
                href={`/student/trainings/${trainingId}/modules/${module.id}/quiz`}
              />
            }
          >
            <IconListCheck className="size-4" />
            Kerjakan Quiz
          </Button>
          <Button
            variant="outline"
            render={
              <a
                href={`/student/trainings/${trainingId}/modules/${module.id}/latihan`}
              />
            }
          >
            <IconPencil className="size-4" />
            Kerjakan Latihan
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-medium">Materi Pembelajaran</h3>
        <ModuleContentList
          contents={module.contents}
          moduleId={module.id}
          trainingId={trainingId}
        />
      </div>

      {state.message ? (
        <Alert>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}

      {status !== "completed" ? (
        <form action={formAction}>
          <input type="hidden" name="moduleId" value={module.id} />
          <input type="hidden" name="trainingId" value={trainingId} />
          <Button type="submit" disabled={pending}>
            {pending ? <Spinner className="size-4" /> : "Tandai Selesai"}
          </Button>
        </form>
      ) : null}
    </div>
  );
}
