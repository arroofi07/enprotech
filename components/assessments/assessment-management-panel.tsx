"use client";

import { useState } from "react";
import { IconFileImport, IconPlus } from "@tabler/icons-react";

import { AssessmentImportDialog } from "@/components/assessments/assessment-import-dialog";
import { AssessmentQuestionFilters } from "@/components/assessments/assessment-question-filters";
import { AssessmentQuestionForm } from "@/components/assessments/assessment-question-form";
import { AssessmentQuestionTable } from "@/components/assessments/assessment-question-table";
import { AssessmentSettingsForm } from "@/components/assessments/assessment-settings-form";
import { ImportTemplateDownload } from "@/components/imports/import-template-download";
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

import { ListPagination } from "@/components/ui/list-pagination";
import { getEffectiveDisplayCount } from "@/lib/domain/assessments/prepare-attempt-questions";

type AssessmentManagementPanelProps = {
  trainingId: string;
  moduleId?: string;
  contextTitle: string;
  type: AssessmentType;
  assessment: AssessmentRecord;
  questions: QuestionRecord[];
  passingGrade: number;
  questionPage: number;
  questionTotalPages: number;
  questionTotal: number;
  paginationBasePath: string;
  enableQuestionSearch?: boolean;
  questionSearch?: string;
};

export function AssessmentManagementPanel({
  trainingId,
  moduleId,
  contextTitle,
  type,
  assessment,
  questions,
  passingGrade,
  questionPage,
  questionTotalPages,
  questionTotal,
  paginationBasePath,
  enableQuestionSearch = false,
  questionSearch,
}: AssessmentManagementPanelProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionRecord | null>(
    null,
  );

  const typeLabel = getAssessmentTypeLabel(type);
  const effectiveDisplayCount = getEffectiveDisplayCount(
    questionTotal,
    assessment.questionDisplayCount,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-semibold">
              {typeLabel} — {contextTitle}
            </h2>
            <Badge variant="secondary">{questionTotal} soal</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {getAssessmentTypeDescription(type)}
          </p>
          <p className="text-sm text-muted-foreground">
            Passing grade: <span className="font-medium">{passingGrade}%</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Tampilan student:{" "}
            <span className="font-medium text-foreground">
              {effectiveDisplayCount}
            </span>{" "}
            soal
            {assessment.shuffleQuestions ? " · diacak" : " · urutan tetap"}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <ImportTemplateDownload kind="questions" variant="button" />

          <Dialog open={importOpen} onOpenChange={setImportOpen}>
            <DialogTrigger render={<Button variant="outline" />}>
              <IconFileImport className="size-4" />
              Impor Excel
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Impor Soal dari Excel</DialogTitle>
                <DialogDescription>
                  Export template terlebih dahulu, isi data soal, lalu unggah
                  file Excel di sini.
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
            <DialogContent className="flex max-h-[90vh] max-w-4xl flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl">
              <DialogHeader className="shrink-0 border-b px-6 py-4">
                <DialogTitle>Tambah Soal {typeLabel}</DialogTitle>
                <DialogDescription>
                  Buat soal pilihan ganda dengan 5 opsi jawaban.
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

      <AssessmentSettingsForm
        assessment={assessment}
        trainingId={trainingId}
        moduleId={moduleId}
        type={type}
        totalQuestions={questionTotal}
      />

      <div className="space-y-4">
        {enableQuestionSearch ? (
          <AssessmentQuestionFilters search={questionSearch} />
        ) : null}

        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Daftar Soal</p>
          <p className="text-sm text-muted-foreground">
            Menampilkan{" "}
            <span className="font-medium text-foreground">
              {questions.length}
            </span>{" "}
            dari{" "}
            <span className="font-medium text-foreground">{questionTotal}</span>{" "}
            soal
          </p>
        </div>

        <AssessmentQuestionTable
          questions={questions}
          trainingId={trainingId}
          moduleId={moduleId}
          type={type}
          onEdit={setEditingQuestion}
          emptyMessage={
            questionSearch?.trim()
              ? "Tidak ada soal yang cocok dengan pencarian."
              : undefined
          }
        />

        <ListPagination
          page={questionPage}
          totalPages={questionTotalPages}
          basePath={paginationBasePath}
          searchParams={
            enableQuestionSearch ? { search: questionSearch } : undefined
          }
        />
      </div>

      <Dialog
        open={editingQuestion !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditingQuestion(null);
          }
        }}
      >
        <DialogContent className="flex max-h-[90vh] max-w-4xl flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl">
          <DialogHeader className="shrink-0 border-b px-6 py-4">
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
