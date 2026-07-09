import Link from "next/link";

import { ModuleProgressBadge } from "@/components/modules/module-progress-badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { StudentModuleListItem } from "@/lib/application/modules/list-student-modules";

type StudentModuleCardProps = {
  module: StudentModuleListItem;
  trainingId: string;
  locked?: boolean;
};

export function StudentModuleCard({
  module,
  trainingId,
  locked = false,
}: StudentModuleCardProps) {
  const status = module.progress?.status ?? "not_started";

  const card = (
    <Card
      className={`h-full transition-colors ${
        locked
          ? "opacity-60"
          : "hover:bg-muted/40"
      }`}
    >
      {module.thumbnail ? (
        <div className="aspect-video w-full overflow-hidden rounded-t-xl bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={module.thumbnail}
            alt={module.title}
            className="h-full w-full object-cover"
          />
        </div>
      ) : null}
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-base">{module.title}</CardTitle>
            {module.description ? (
              <CardDescription className="line-clamp-2">
                {module.description}
              </CardDescription>
            ) : null}
          </div>
          <ModuleProgressBadge status={status} />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {locked
            ? "Selesaikan pre-test untuk membuka modul."
            : `${module.contents.length} materi`}
        </p>
      </CardContent>
    </Card>
  );

  if (locked) {
    return card;
  }

  return (
    <Link href={`/student/trainings/${trainingId}/modules/${module.id}`}>
      {card}
    </Link>
  );
}
