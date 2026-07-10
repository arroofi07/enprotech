"use client";

import { useActionState } from "react";

import {
  archiveTrainingAction,
  publishTrainingAction,
  type TrainingActionState,
} from "@/app/actions/trainings";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import type { TrainingStatus } from "@/lib/domain/trainings/types";

const initialState: TrainingActionState = {};

type TrainingManagementActionsProps = {
  trainingId: string;
  status: TrainingStatus;
};

export function TrainingManagementActions({
  trainingId,
  status,
}: TrainingManagementActionsProps) {
  const [publishState, publishAction, publishPending] = useActionState(
    publishTrainingAction,
    initialState,
  );
  const [archiveState, archiveAction, archivePending] = useActionState(
    archiveTrainingAction,
    initialState,
  );
  const feedback = [publishState, archiveState]
    .reverse()
    .find((state) => state.message);

  return (
    <div className="space-y-4">
      {feedback?.message ? (
        <Alert variant={feedback.error ? "destructive" : "default"}>
          <AlertDescription>{feedback.message}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {status === "draft" ? (
          <form action={publishAction}>
            <input type="hidden" name="trainingId" value={trainingId} />
            <Button type="submit" disabled={publishPending}>
              {publishPending ? <Spinner data-icon="inline-start" /> : null}
              Publikasikan
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
