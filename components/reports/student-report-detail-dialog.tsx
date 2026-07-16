"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  formatAssessmentType,
  formatDateTime,
  formatEnrollmentStatus,
  formatScore,
} from "@/lib/domain/reports/format-labels";
import type { StudentReportDetail } from "@/lib/domain/reports/types";

type StudentReportDetailDialogProps = {
  studentId: string;
  trainingId: string;
};

export function StudentReportDetailDialog({
  studentId,
  trainingId,
}: StudentReportDetailDialogProps) {
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<StudentReportDetail | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadDetail() {
    setLoading(true);

    try {
      const params = new URLSearchParams({
        detail: "student",
        studentId,
        trainingId,
      });
      const response = await fetch(`/api/reports/training?${params.toString()}`);

      if (!response.ok) {
        const body = (await response.json()) as { message?: string };
        throw new Error(body.message ?? "Gagal memuat detail rekap.");
      }

      const data = (await response.json()) as StudentReportDetail;
      setDetail(data);
    } catch (fetchError) {
      setDetail(null);
      toast.error(
        fetchError instanceof Error
          ? fetchError.message
          : "Gagal memuat detail rekap.",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen) {
      void loadDetail();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button type="button" variant="outline" size="sm" />}>
        Lihat
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Detail Rekap Peserta</DialogTitle>
          <DialogDescription>
            Semua attempt dan nilai per assessment untuk peserta ini.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <p className="text-sm text-muted-foreground">Memuat detail...</p>
        ) : null}

        {detail ? (
          <div className="space-y-6">
            <div className="rounded-lg border p-4">
              <p className="font-medium">{detail.studentName}</p>
              <p className="text-sm text-muted-foreground">
                {detail.studentEmail}
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-sm">
                <Badge variant="secondary">{detail.trainingTitle}</Badge>
                <Badge variant="outline">
                  {formatEnrollmentStatus(detail.enrollmentStatus)}
                </Badge>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Terdaftar: {formatDateTime(detail.enrolledAt)}
              </p>
            </div>

            <div className="space-y-4">
              {detail.assessments.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Belum ada assessment untuk training ini.
                </p>
              ) : (
                detail.assessments.map((assessment) => (
                  <div
                    key={assessment.assessmentId}
                    className="rounded-lg border p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-medium">{assessment.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatAssessmentType(assessment.type)}
                          {assessment.moduleTitle
                            ? ` • ${assessment.moduleTitle}`
                            : ""}
                        </p>
                      </div>
                      <div className="text-right text-sm">
                        <p>
                          Best: {formatScore(assessment.bestScore)} /{" "}
                          {assessment.passingGrade}
                        </p>
                        <Badge
                          variant={
                            assessment.hasPassed ? "default" : "secondary"
                          }
                        >
                          {assessment.hasPassed ? "Lulus" : "Belum Lulus"}
                        </Badge>
                      </div>
                    </div>

                    {assessment.attempts.length === 0 ? (
                      <p className="mt-3 text-sm text-muted-foreground">
                        Belum ada attempt yang disubmit.
                      </p>
                    ) : (
                      <div className="mt-3 overflow-x-auto rounded-md border">
                        <table className="w-full text-sm">
                          <thead className="bg-muted/40">
                            <tr>
                              <th className="px-3 py-2 text-left font-medium">
                                Attempt
                              </th>
                              <th className="px-3 py-2 text-left font-medium">
                                Nilai
                              </th>
                              <th className="px-3 py-2 text-left font-medium">
                                Submit
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {assessment.attempts.map((attempt) => (
                              <tr key={attempt.id} className="border-t">
                                <td className="px-3 py-2">
                                  #{attempt.attemptNumber}
                                </td>
                                <td className="px-3 py-2">{attempt.score}</td>
                                <td className="px-3 py-2">
                                  {formatDateTime(attempt.submittedAt)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
