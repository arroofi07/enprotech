"use client";

import { useState } from "react";
import { IconFileImport, IconPlus } from "@tabler/icons-react";

import { AssessmentImportDialog } from "@/components/assessments/assessment-import-dialog";
import { AssessmentQuestionForm } from "@/components/assessments/assessment-question-form";
import { AssessmentQuestionTable } from "@/components/assessments/assessment-question-table";
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
  getAssessmentTypeDescription,
  getAssessmentTypeLabel,
} from "@/lib/domain/assessments/labels";
import type { AssessmentType } from "@/lib/domain/assessments/types";
import type {
  AssessmentRecord,
  QuestionRecord,
} from "@/lib/infrastructure/db/repositories/assessment-repository";

type AssessmentManagementPanelProps = {
  trainingId: string;
  moduleId?: string;
  contextTitle: string;
  type: AssessmentType;
  assessment: AssessmentRecord;
  questions: QuestionRecord[];
  passingGrade: number;
};

export function AssessmentManagementPanel({
  trainingId,
  moduleId,
  contextTitle,
  type,
  assessment,
  questions,
  passingGrade,
}: AssessmentManagementPanelProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionRecord | null>(
    null,
  );

  const typeLabel = getAssessmentTypeLabel(type);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-semibold">
              {typeLabel} — {contextTitle}
            </h2>
            <Badge variant="secondary">{questions.length} soal</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {getAssessmentTypeDescription(type)}
          </p>
          <p className="text-sm text-muted-foreground">
            Passing grade: <span className="font-medium">{passingGrade}%</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Dialog open={importOpen} onOpenChange={setImportOpen}>
            <DialogTrigger render={<Button variant="outline" />}>
              <IconFileImport className="size-4" />
              Impor Excel
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Impor Soal dari Excel</DialogTitle>
                <DialogDescription>
                  Unggah file Excel sesuai template untuk menambahkan banyak
                  soal sekaligus.
                </DialogDescription>
              </DialogHeader>
              <AssessmentImportDialog
                assessmentId={assessment.id}
                trainingId={trainingId}
                moduleId={moduleId}
                type={type}
                onSuccess={() => setImportOpen(false)}
              />
            </DialogContent>
          </Dialog>

          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger render={<Button />}>
              <IconPlus className="size-4" />
              Tambah Soal
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Tambah Soal {typeLabel}</DialogTitle>
                <DialogDescription>
                  Buat soal pilihan ganda dengan 4 opsi jawaban.
                </DialogDescription>
              </DialogHeader>
              <AssessmentQuestionForm
                assessmentId={assessment.id}
                trainingId={trainingId}
                moduleId={moduleId}
                type={type}
                onSuccess={() => setCreateOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <AssessmentQuestionTable
        questions={questions}
        trainingId={trainingId}
        moduleId={moduleId}
        type={type}
        onEdit={setEditingQuestion}
      />

      <Dialog
        open={editingQuestion !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditingQuestion(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Soal</DialogTitle>
            <DialogDescription>
              Perbarui pertanyaan dan opsi jawaban.
            </DialogDescription>
          </DialogHeader>
          {editingQuestion ? (
            <AssessmentQuestionForm
              assessmentId={assessment.id}
              trainingId={trainingId}
              moduleId={moduleId}
              type={type}
              question={editingQuestion}
              onSuccess={() => setEditingQuestion(null)}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
