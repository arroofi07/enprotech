"use client";

import { useActionState } from "react";

import {
  activatePretestAction,
  updateTrainingAction,
  type TrainingActionState,
} from "@/app/actions/trainings";
import { TrainingEnrollmentSection } from "@/components/trainings/training-enrollment-section";
import { TrainingManagementActions } from "@/components/trainings/training-management-actions";
import { TrainingStatusBadge } from "@/components/trainings/training-status-badge";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useActionToast } from "@/hooks/use-action-toast";
import type { TrainingDetail } from "@/lib/application/trainings/get-training";
import type { PublicUserRecord } from "@/lib/infrastructure/db/repositories/user-repository";

const initialState: TrainingActionState = {};

type TrainingEditPanelProps = {
  training: TrainingDetail;
  availableStudents: PublicUserRecord[];
};

function formatDeadlineForInput(deadline: string | null): string {
  return deadline ?? "";
}

export function TrainingEditPanel({
  training,
  availableStudents,
}: TrainingEditPanelProps) {
  const [updateState, updateAction, updatePending] = useActionState(
    updateTrainingAction,
    initialState,
  );
  const [pretestState, pretestAction, pretestPending] = useActionState(
    activatePretestAction,
    initialState,
  );

  useActionToast(updateState);
  useActionToast(pretestState);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <TrainingStatusBadge status={training.status} />
          {training.isPretestActive ? (
            <span className="text-sm text-muted-foreground">Pre-test aktif</span>
          ) : null}
        </div>

        {training.status === "active" && !training.isPretestActive ? (
          <form action={pretestAction}>
            <input type="hidden" name="trainingId" value={training.id} />
            <Button type="submit" variant="secondary" disabled={pretestPending}>
              {pretestPending ? <Spinner data-icon="inline-start" /> : null}
              Aktifkan Pre-test
            </Button>
          </form>
        ) : null}
      </div>

      <Tabs defaultValue="detail">
        <TabsList>
          <TabsTrigger value="detail">Detail</TabsTrigger>
          <TabsTrigger value="enrollment">
            Enrollment ({training.enrollments.length})
          </TabsTrigger>
          <TabsTrigger value="settings">Pengaturan</TabsTrigger>
        </TabsList>

        <TabsContent value="detail" className="mt-6">
          <form action={updateAction} className="space-y-6">
            <input type="hidden" name="trainingId" value={training.id} />
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="title">Judul Training</FieldLabel>
                <Input
                  id="title"
                  name="title"
                  defaultValue={training.title}
                  required
                  minLength={3}
                  maxLength={200}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="description">Deskripsi</FieldLabel>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={training.description ?? ""}
                  rows={4}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="thumbnail">URL Thumbnail</FieldLabel>
                <Input
                  id="thumbnail"
                  name="thumbnail"
                  type="url"
                  defaultValue={training.thumbnail ?? ""}
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="passingGrade">Passing Grade (%)</FieldLabel>
                  <Input
                    id="passingGrade"
                    name="passingGrade"
                    type="number"
                    min={0}
                    max={100}
                    defaultValue={training.passingGrade}
                    required
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="deadline">Deadline</FieldLabel>
                  <Input
                    id="deadline"
                    name="deadline"
                    type="date"
                    defaultValue={formatDeadlineForInput(training.deadline)}
                  />
                </Field>
              </div>
            </FieldGroup>

            <Button type="submit" disabled={updatePending}>
              {updatePending ? <Spinner data-icon="inline-start" /> : null}
              Simpan Perubahan
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="enrollment" className="mt-6">
          <TrainingEnrollmentSection
            training={training}
            availableStudents={availableStudents}
          />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <TrainingManagementActions
            trainingId={training.id}
            status={training.status}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
