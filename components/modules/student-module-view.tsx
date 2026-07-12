"use client";

import { useEffect } from "react";
import {
  IconBook,
  IconCheck,
  IconClock,
  IconExternalLink,
  IconListCheck,
  IconLock,
  IconPencil,
  IconVideo,
} from "@tabler/icons-react";

import { StudentModuleContentList } from "@/components/modules/student-module-content-list";
import { ModuleProgressBadge } from "@/components/modules/module-progress-badge";
import {
  AssessmentProgressBadge,
  formatAssessmentScore,
} from "@/components/progress/assessment-progress-badge";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatVideoConferenceSchedule } from "@/lib/domain/modules/format-video-conference-schedule";
import type { ModuleProgressItem } from "@/lib/domain/trainings/progress-types";
import type { StudentModuleDetail } from "@/lib/infrastructure/db/repositories/module-repository";
import { cn } from "@/lib/utils";

type StudentModuleViewProps = {
  module: StudentModuleDetail;
  trainingId: string;
  trainingTitle?: string;
  progressItem?: ModuleProgressItem;
  moduleNumber?: number;
  totalModules?: number;
  /** Quiz unlocks only once the module's video conference schedule has started. */
  quizUnlocked?: boolean;
  /** Latihan unlocks only once the module's quiz has been completed. */
  latihanUnlocked?: boolean;
  /** Video conference link is joinable only from the scheduled time onward. */
  videoConferenceStarted?: boolean;
};

function getModuleCompletionPercent(progressItem?: ModuleProgressItem): number {
  if (!progressItem) {
    return 0;
  }

  let completed = 0;
  if (progressItem.status === "completed") completed += 1;
  if (progressItem.quiz.hasPassed) completed += 1;
  if (progressItem.latihan.hasPassed) completed += 1;

  return Math.round((completed / 3) * 100);
}

function ChecklistItem({
  done,
  label,
  detail,
}: {
  done: boolean;
  label: string;
  detail?: string;
}) {
  return (
    <li className="flex items-start gap-3">
      <span
        className={cn(
          "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border",
          done
            ? "border-primary bg-primary text-primary-foreground"
            : "border-muted-foreground/30 bg-background",
        )}
      >
        {done ? <IconCheck className="size-3" /> : null}
      </span>
      <div className="min-w-0 space-y-0.5">
        <p
          className={cn(
            "text-sm font-medium",
            done && "text-muted-foreground line-through",
          )}
        >
          {label}
        </p>
        {detail ? (
          <p className="text-xs text-muted-foreground">{detail}</p>
        ) : null}
      </div>
    </li>
  );
}

export function StudentModuleView({
  module,
  trainingId,
  trainingTitle,
  progressItem,
  moduleNumber,
  totalModules,
  quizUnlocked = true,
  latihanUnlocked = true,
  videoConferenceStarted = true,
}: StudentModuleViewProps) {
  const status = module.progress?.status ?? "not_started";
  const completionPercent = getModuleCompletionPercent(progressItem);
  const quizPath = `/student/trainings/${trainingId}/modules/${module.id}/quiz`;
  const latihanPath = `/student/trainings/${trainingId}/modules/${module.id}/latihan`;
  const quizLockReason = module.videoConferenceScheduledAt
    ? `Terbuka pada ${formatVideoConferenceSchedule(module.videoConferenceScheduledAt)}.`
    : "Menunggu jadwal video conference dari trainer.";

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
      <section className="relative overflow-hidden rounded-2xl border bg-card">
        {module.thumbnail ? (
          <div className="absolute inset-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={module.thumbnail}
              alt=""
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/70" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
        )}

        <div className="relative space-y-4 p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-2">
            {trainingTitle ? (
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                {trainingTitle}
              </span>
            ) : null}
            {moduleNumber && totalModules ? (
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                Modul {moduleNumber} dari {totalModules}
              </span>
            ) : null}
            <ModuleProgressBadge status={status} />
          </div>

          <div className="space-y-2">
            <h1 className="font-heading text-2xl font-bold tracking-tight md:text-3xl">
              {module.title}
            </h1>
            {module.description ? (
              <p className="max-w-3xl text-sm text-muted-foreground md:text-base">
                {module.description}
              </p>
            ) : null}
          </div>

          <div className="max-w-md space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress modul</span>
              <span className="font-medium tabular-nums">{completionPercent}%</span>
            </div>
            <Progress value={completionPercent} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Selesaikan materi, quiz, dan latihan untuk menyelesaikan modul ini.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                  <IconBook className="size-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">Materi Pembelajaran</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {module.contents.length} materi tersedia
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <StudentModuleContentList contents={module.contents} />
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Aktivitas Modul</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-3 rounded-xl border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <IconListCheck className="size-4 text-primary" />
                    <span className="font-medium">Quiz</span>
                  </div>
                  {progressItem ? (
                    <AssessmentProgressBadge status={progressItem.quiz.status} />
                  ) : null}
                </div>
                <p className="text-xs text-muted-foreground">
                  {progressItem
                    ? formatAssessmentScore(
                        progressItem.quiz.bestScore,
                        progressItem.quiz.passingGrade,
                        progressItem.quiz.hasPassed,
                      )
                    : `Nilai minimum ${module.minQuizScore}%`}
                </p>
                {quizUnlocked ? (
                  <ButtonLink
                    className="w-full"
                    variant={
                      progressItem?.quiz.hasPassed ? "outline" : "default"
                    }
                    href={quizPath}
                  >
                    <IconListCheck className="size-4" />
                    {progressItem?.quiz.hasPassed
                      ? "Ulangi Quiz"
                      : "Kerjakan Quiz"}
                  </ButtonLink>
                ) : (
                  <div className="space-y-1.5">
                    <Button className="w-full" variant="outline" disabled>
                      <IconLock className="size-4" />
                      Quiz Terkunci
                    </Button>
                    <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                      <IconClock className="mt-0.5 size-3.5 shrink-0" />
                      {quizLockReason}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-3 rounded-xl border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <IconPencil className="size-4 text-primary" />
                    <span className="font-medium">Latihan</span>
                  </div>
                  {progressItem ? (
                    <AssessmentProgressBadge status={progressItem.latihan.status} />
                  ) : null}
                </div>
                <p className="text-xs text-muted-foreground">
                  {progressItem
                    ? formatAssessmentScore(
                        progressItem.latihan.bestScore,
                        progressItem.latihan.passingGrade,
                        progressItem.latihan.hasPassed,
                      )
                    : `Nilai minimum ${module.minLatihanScore}%`}
                </p>
                {latihanUnlocked ? (
                  <ButtonLink
                    className="w-full"
                    variant={
                      progressItem?.latihan.hasPassed ? "outline" : "default"
                    }
                    href={latihanPath}
                  >
                    <IconPencil className="size-4" />
                    {progressItem?.latihan.hasPassed
                      ? "Ulangi Latihan"
                      : "Kerjakan Latihan"}
                  </ButtonLink>
                ) : (
                  <div className="space-y-1.5">
                    <Button className="w-full" variant="outline" disabled>
                      <IconLock className="size-4" />
                      Latihan Terkunci
                    </Button>
                    <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                      <IconListCheck className="mt-0.5 size-3.5 shrink-0" />
                      Selesaikan quiz modul ini terlebih dahulu.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {module.videoConferenceLink && module.videoConferenceScheduledAt ? (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <IconVideo className="size-4 text-primary" />
                  <CardTitle className="text-base">Video Conference</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {formatVideoConferenceSchedule(module.videoConferenceScheduledAt)}
                </p>
                {videoConferenceStarted ? (
                  <ButtonLink
                    className="w-full"
                    variant="outline"
                    href={module.videoConferenceLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <IconExternalLink className="size-4" />
                    Buka Meeting
                  </ButtonLink>
                ) : (
                  <>
                    <Button className="w-full" variant="outline" disabled>
                      <IconClock className="size-4" />
                      Belum dimulai
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Link meeting aktif saat jadwal dimulai.
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Checklist Penyelesaian</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <ChecklistItem
                  done={module.contents.length > 0 && status !== "not_started"}
                  label="Pelajari materi modul"
                  detail={
                    module.contents.length > 0
                      ? `${module.contents.length} materi tersedia`
                      : "Menunggu materi dari trainer"
                  }
                />
                <ChecklistItem
                  done={progressItem?.quiz.hasPassed ?? false}
                  label="Lulus quiz modul"
                  detail={
                    progressItem
                      ? formatAssessmentScore(
                          progressItem.quiz.bestScore,
                          progressItem.quiz.passingGrade,
                          progressItem.quiz.hasPassed,
                        )
                      : undefined
                  }
                />
                <ChecklistItem
                  done={progressItem?.latihan.hasPassed ?? false}
                  label="Lulus latihan modul"
                  detail={
                    progressItem
                      ? formatAssessmentScore(
                          progressItem.latihan.bestScore,
                          progressItem.latihan.passingGrade,
                          progressItem.latihan.hasPassed,
                        )
                      : undefined
                  }
                />
              </ul>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
