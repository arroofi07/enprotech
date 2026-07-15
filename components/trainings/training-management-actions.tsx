"use client";

import { useActionState } from "react";

import {
  archiveTrainingAction,
  publishTrainingAction,
  type TrainingActionState,
} from "@/app/actions/trainings";
import { TrainingPublicationSummary } from "@/components/trainings/training-publication-summary";
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
import { Spinner } from "@/components/ui/spinner";
import { useActionToast } from "@/hooks/use-action-toast";
import type { TrainingStatus } from "@/lib/domain/trainings/types";
import type { TrainingPublicationSummary as TrainingPublicationSummaryData } from "@/lib/infrastructure/db/repositories/assessment-repository";

const initialState: TrainingActionState = {};

type TrainingManagementActionsProps = {
  trainingId: string;
  status: TrainingStatus;
  publicationSummary: TrainingPublicationSummaryData;
};

export function TrainingManagementActions({
  trainingId,
  status,
  publicationSummary,
}: TrainingManagementActionsProps) {
  const [publishState, publishAction, publishPending] = useActionState(
    publishTrainingAction,
    initialState,
  );
  const [archiveState, archiveAction, archivePending] = useActionState(
    archiveTrainingAction,
    initialState,
  );

  useActionToast(publishState);
  useActionToast(archiveState);

  return (
    <div className="space-y-4">
      <TrainingPublicationSummary summary={publicationSummary} />
      {!publicationSummary.isReadyToPublish &&
      (status === "draft" || status === "archived") ? (
        <p className="text-sm text-muted-foreground">
          Isi materi, quiz, dan latihan pada setiap modul serta soal pre-test
          dan post-test agar training dapat dipublikasikan.
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {status === "draft" || status === "archived" ? (
          <form action={publishAction}>
            <input type="hidden" name="trainingId" value={trainingId} />
            <Button
              type="submit"
              disabled={publishPending || !publicationSummary.isReadyToPublish}
            >
              {publishPending ? <Spinner data-icon="inline-start" /> : null}
              {status === "archived"
                ? "Publikasikan Kembali"
                : "Publikasikan"}
            </Button>
          </form>
        ) : null}

        {status !== "archived" ? (
          <AlertDialog>
            <AlertDialogTrigger render={<Button variant="destructive" />}>
              Arsipkan
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Arsipkan training?</AlertDialogTitle>
                <AlertDialogDescription>
                  Training tidak akan terlihat oleh student. Data enrollment tetap
                  tersimpan.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <form action={archiveAction}>
                  <input type="hidden" name="trainingId" value={trainingId} />
                  <Button
                    type="submit"
                    variant="destructive"
                    disabled={archivePending}
                  >
                    {archivePending ? <Spinner data-icon="inline-start" /> : null}
                    Arsipkan
                  </Button>
                </form>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : null}
      </div>
    </div>
  );
}
