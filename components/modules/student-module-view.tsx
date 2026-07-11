"use client";

import { useEffect } from "react";
import { IconExternalLink, IconListCheck, IconPencil } from "@tabler/icons-react";

import { ModuleContentList } from "@/components/modules/module-content-list";
import { ModuleProgressBadge } from "@/components/modules/module-progress-badge";
import { Button } from "@/components/ui/button";
import { formatVideoConferenceSchedule } from "@/lib/domain/modules/format-video-conference-schedule";
import type { StudentModuleDetail } from "@/lib/infrastructure/db/repositories/module-repository";

type StudentModuleViewProps = {
  module: StudentModuleDetail;
  trainingId: string;
};

export function StudentModuleView({ module, trainingId }: StudentModuleViewProps) {
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
          <p className="text-sm text-muted-foreground">
            Kerjakan quiz dan latihan modul ini untuk menyelesaikan modul dan
            membuka modul berikutnya.
          </p>
        </div>

        {module.videoConferenceLink && module.videoConferenceScheduledAt ? (
          <div className="space-y-2 text-right">
            <p className="text-xs text-muted-foreground">
              {formatVideoConferenceSchedule(module.videoConferenceScheduledAt)}
            </p>
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
          </div>
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
    </div>
  );
}
