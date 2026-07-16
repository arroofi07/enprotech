"use client";

import { useActionState, useMemo, useState } from "react";
import { IconSearch } from "@tabler/icons-react";

import {
  enrollStudentsAction,
  removeEnrollmentAction,
  type TrainingActionState,
} from "@/app/actions/trainings";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useActionToast } from "@/hooks/use-action-toast";
import type { TrainingDetail } from "@/lib/application/trainings/get-training";
import { ROLE_LABELS } from "@/lib/domain/auth/role-labels";
import type { PublicUserRecord } from "@/lib/infrastructure/db/repositories/user-repository";

const initialState: TrainingActionState = {};

type TrainingEnrollmentSectionProps = {
  training: TrainingDetail;
  availableStudents: PublicUserRecord[];
};

export function TrainingEnrollmentSection({
  training,
  availableStudents,
}: TrainingEnrollmentSectionProps) {
  const [enrollState, enrollAction, enrollPending] = useActionState(
    enrollStudentsAction,
    initialState,
  );
  const [removeState, removeAction, removePending] = useActionState(
    removeEnrollmentAction,
    initialState,
  );
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  useActionToast(enrollState);
  useActionToast(removeState);

  const enrolledStudentIds = useMemo(
    () => new Set(training.enrollments.map((item) => item.studentId)),
    [training.enrollments],
  );

  const enrollableStudents = useMemo(
    () =>
      availableStudents.filter(
        (student) =>
          student.role === "student" && !enrolledStudentIds.has(student.id),
      ),
    [availableStudents, enrolledStudentIds],
  );

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return enrollableStudents;
    }

    return enrollableStudents.filter(
      (student) =>
        student.name.toLowerCase().includes(query) ||
        student.email.toLowerCase().includes(query),
    );
  }, [enrollableStudents, search]);

  const filteredStudentIds = useMemo(
    () => filteredStudents.map((student) => student.id),
    [filteredStudents],
  );

  const allFilteredSelected =
    filteredStudents.length > 0 &&
    filteredStudents.every((student) =>
      selectedStudentIds.includes(student.id),
    );

  function toggleStudent(studentId: string, checked: boolean) {
    setSelectedStudentIds((current) =>
      checked
        ? [...current, studentId]
        : current.filter((id) => id !== studentId),
    );
  }

  function toggleSelectAll(checked: boolean) {
    if (checked) {
      setSelectedStudentIds((current) => [
        ...new Set([...current, ...filteredStudentIds]),
      ]);
      return;
    }

    const filteredIds = new Set(filteredStudentIds);
    setSelectedStudentIds((current) =>
      current.filter((id) => !filteredIds.has(id)),
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tambah Peserta</CardTitle>
          <CardDescription>
            Pilih peserta aktif untuk didaftarkan ke training ini. Hanya akun
            dengan role Peserta yang ditampilkan.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {enrollableStudents.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Semua peserta aktif sudah terdaftar di training ini.
            </p>
          ) : (
            <form action={enrollAction} className="space-y-4">
              <input type="hidden" name="trainingId" value={training.id} />

              <div className="relative">
                <IconSearch className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Cari nama atau email peserta..."
                  className="pl-9"
                  aria-label="Cari peserta"
                />
              </div>

              <div className="rounded-lg border">
                <div className="flex items-center justify-between gap-3 border-b bg-muted/30 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="select-all-students"
                      checked={allFilteredSelected}
                      onCheckedChange={(checked) =>
                        toggleSelectAll(checked === true)
                      }
                      disabled={filteredStudents.length === 0}
                    />
                    <Label
                      htmlFor="select-all-students"
                      className="text-sm font-medium"
                    >
                      Pilih semua
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {filteredStudents.length} peserta
                    {search.trim() ? " cocok" : " tersedia"}
                    {selectedStudentIds.length > 0
                      ? ` · ${selectedStudentIds.length} terpilih`
                      : ""}
                  </p>
                </div>

                <div className="max-h-72 divide-y overflow-y-auto">
                  {filteredStudents.length === 0 ? (
                    <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                      Tidak ada peserta yang cocok dengan pencarian.
                    </p>
                  ) : (
                    filteredStudents.map((student) => {
                      const checkboxId = `student-${student.id}`;

                      return (
                        <div
                          key={student.id}
                          className="flex items-center gap-3 px-4 py-3"
                        >
                          <Checkbox
                            id={checkboxId}
                            checked={selectedStudentIds.includes(student.id)}
                            onCheckedChange={(checked) =>
                              toggleStudent(student.id, checked === true)
                            }
                          />
                          <Label
                            htmlFor={checkboxId}
                            className="flex min-w-0 flex-1 cursor-pointer items-center justify-between gap-3 font-normal"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">
                                {student.name}
                              </p>
                              <p className="truncate text-xs text-muted-foreground">
                                {student.email}
                              </p>
                            </div>
                            <Badge variant="secondary">
                              {ROLE_LABELS[student.role]}
                            </Badge>
                          </Label>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {selectedStudentIds.map((studentId) => (
                <input
                  key={studentId}
                  type="hidden"
                  name="studentIds"
                  value={studentId}
                />
              ))}

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={enrollPending || selectedStudentIds.length === 0}
                >
                  {enrollPending ? <Spinner data-icon="inline-start" /> : null}
                  Enroll Terpilih ({selectedStudentIds.length})
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Peserta Terdaftar ({training.enrollments.length})
          </CardTitle>
          <CardDescription>
            Daftar peserta yang sudah terdaftar di training ini.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 pb-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {training.enrollments.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-8 text-center text-muted-foreground"
                  >
                    Belum ada peserta terdaftar.
                  </TableCell>
                </TableRow>
              ) : (
                training.enrollments.map((enrollment) => (
                  <TableRow key={enrollment.id}>
                    <TableCell className="font-medium">
                      {enrollment.studentName}
                    </TableCell>
                    <TableCell>{enrollment.studentEmail}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">Peserta</Badge>
                    </TableCell>
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
        </CardContent>
      </Card>
    </div>
  );
}
