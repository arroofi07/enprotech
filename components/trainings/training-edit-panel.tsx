"use client";

import { useActionState, useMemo, useState } from "react";

import {
  enrollStudentsAction,
  removeEnrollmentAction,
  updateTrainingAction,
  type TrainingActionState,
} from "@/app/actions/trainings";
import { TrainingManagementActions } from "@/components/trainings/training-management-actions";
import { TrainingStatusBadge } from "@/components/trainings/training-status-badge";
import { ButtonLink } from "@/components/ui/button-link";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
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
  const [enrollState, enrollAction, enrollPending] = useActionState(
    enrollStudentsAction,
    initialState,
  );
  const [removeState, removeAction, removePending] = useActionState(
    removeEnrollmentAction,
    initialState,
  );
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  const enrolledStudentIds = useMemo(
    () => new Set(training.enrollments.map((item) => item.studentId)),
    [training.enrollments],
  );

  const enrollableStudents = availableStudents.filter(
    (student) => !enrolledStudentIds.has(student.id),
  );

  const feedback = [updateState, enrollState, removeState]
    .reverse()
    .find((state) => state.message);

  function toggleStudent(studentId: string, checked: boolean) {
    setSelectedStudentIds((current) =>
      checked
        ? [...current, studentId]
        : current.filter((id) => id !== studentId),
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <TrainingStatusBadge status={training.status} />
        {training.isPretestActive ? (
          <span className="text-sm text-muted-foreground">Pre-test aktif</span>
        ) : null}
      </div>

      {feedback?.message ? (
        <Alert variant={feedback.error ? "destructive" : "default"}>
          <AlertDescription>{feedback.message}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <ButtonLink href={`/trainer/trainings/${training.id}/modules`}>
          Kelola Modul
        </ButtonLink>
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

        <TabsContent value="enrollment" className="mt-6 space-y-6">
          <div className="rounded-lg border p-4">
            <h3 className="mb-4 text-sm font-medium">Enroll Student</h3>
            {enrollableStudents.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Semua student aktif sudah terdaftar.
              </p>
            ) : (
              <form action={enrollAction} className="space-y-4">
                <input type="hidden" name="trainingId" value={training.id} />
                <div className="max-h-48 space-y-2 overflow-y-auto rounded-md border p-3">
                  {enrollableStudents.map((student) => (
                    <div key={student.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`student-${student.id}`}
                        checked={selectedStudentIds.includes(student.id)}
                        onCheckedChange={(checked) =>
                          toggleStudent(student.id, checked === true)
                        }
                      />
                      <Label
                        htmlFor={`student-${student.id}`}
                        className="text-sm font-normal"
                      >
                        {student.name} ({student.email})
                      </Label>
                    </div>
                  ))}
                </div>
                {selectedStudentIds.map((studentId) => (
                  <input
                    key={studentId}
                    type="hidden"
                    name="studentIds"
                    value={studentId}
                  />
                ))}
                <Button
                  type="submit"
                  disabled={enrollPending || selectedStudentIds.length === 0}
                >
                  {enrollPending ? <Spinner data-icon="inline-start" /> : null}
                  Enroll Terpilih ({selectedStudentIds.length})
                </Button>
              </form>
            )}
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {training.enrollments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Belum ada student terdaftar.
                  </TableCell>
                </TableRow>
              ) : (
                training.enrollments.map((enrollment) => (
                  <TableRow key={enrollment.id}>
                    <TableCell>{enrollment.studentName}</TableCell>
                    <TableCell>{enrollment.studentEmail}</TableCell>
                    <TableCell className="capitalize">
                      {enrollment.status.replace("_", " ")}
                    </TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger
                          render={<Button variant="outline" size="xs" />}
                        >
                          Hapus
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Hapus enrollment?</AlertDialogTitle>
                            <AlertDialogDescription>
                              {enrollment.studentName} akan dihapus dari training
                              ini.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <form action={removeAction}>
                              <input
                                type="hidden"
                                name="trainingId"
                                value={training.id}
                              />
                              <input
                                type="hidden"
                                name="enrollmentId"
                                value={enrollment.id}
                              />
                              <Button
                                type="submit"
                                variant="destructive"
                                disabled={removePending}
                              >
                                Hapus
                              </Button>
                            </form>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <TrainingManagementActions
            trainingId={training.id}
            status={training.status}
            isPretestActive={training.isPretestActive}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
