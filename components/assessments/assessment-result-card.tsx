"use client";

import {
  IconAlertTriangle,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconCircleCheckFilled,
  IconX,
} from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";

import type { WrongAnswerReview } from "@/lib/domain/assessments/review-wrong-answers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

function ScoreGauge({ value, passed }: { value: number; passed: boolean }) {
  const clamped = Math.max(0, Math.min(100, value));
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="relative flex size-32 shrink-0 items-center justify-center">
      <svg viewBox="0 0 120 120" className="size-full -rotate-90">
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          strokeWidth="10"
          className="stroke-muted"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn(
            "transition-[stroke-dashoffset] duration-700",
            passed ? "stroke-emerald-500" : "stroke-destructive",
          )}
        />
      </svg>
      <div className="absolute flex flex-col items-center leading-none">
        <span className="text-3xl font-bold tabular-nums">{clamped}%</span>
        <span className="mt-1 text-xs text-muted-foreground">Nilai kamu</span>
      </div>
    </div>
  );
}

type AssessmentResultCardProps = {
  score: number;
  passingGrade: number;
  bestScore: number;
  passed: boolean;
  typeLabel: string;
};

export function AssessmentResultCard({
  score,
  passingGrade,
  bestScore,
  passed,
  typeLabel,
}: AssessmentResultCardProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-6 py-2 sm:flex-row sm:gap-8">
        <ScoreGauge value={score} passed={passed} />
        <div className="flex-1 space-y-4 text-center sm:text-left">
          <div className="flex flex-col items-center gap-2 sm:flex-row">
            <Badge variant={passed ? "default" : "destructive"} className="gap-1">
              {passed ? (
                <IconCircleCheckFilled className="size-3.5" />
              ) : (
                <IconAlertTriangle className="size-3.5" />
              )}
              {passed ? "Lulus" : "Belum Lulus"}
            </Badge>
            <span className="text-sm font-medium">Hasil {typeLabel}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {passed
              ? "Selamat! Kamu dinyatakan lulus."
              : "Nilai kamu belum memenuhi syarat kelulusan. Tetap semangat!"}
          </p>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 border-t pt-4 sm:justify-start">
            <div>
              <p className="text-xs text-muted-foreground">Nilai Tertinggi</p>
              <p className="text-xl font-semibold tabular-nums">{bestScore}%</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

type AssessmentReviewWrongProps = {
  wrongAnswers: WrongAnswerReview[];
};

export function AssessmentReviewWrong({
  wrongAnswers,
}: AssessmentReviewWrongProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = wrongAnswers.length;

  useEffect(() => {
    setCurrentPage(1);
  }, [wrongAnswers]);

  const currentItem = useMemo(() => {
    const safePage = Math.min(Math.max(currentPage, 1), totalPages);
    return wrongAnswers[safePage - 1] ?? null;
  }, [currentPage, totalPages, wrongAnswers]);

  if (wrongAnswers.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center gap-3 py-2">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <IconCircleCheckFilled className="size-6" />
          </div>
          <div>
            <p className="font-semibold">Semua jawaban benar!</p>
            <p className="text-sm text-muted-foreground">
              Kerja bagus, tidak ada soal yang perlu ditinjau ulang.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentItem) {
    return null;
  }

  const safePage = Math.min(Math.max(currentPage, 1), totalPages);
  const isFirstPage = safePage <= 1;
  const isLastPage = safePage >= totalPages;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>Review Jawaban Salah</CardTitle>
            <CardDescription>
              Pelajari kembali soal yang belum benar.
            </CardDescription>
          </div>
          <Badge variant="secondary">{wrongAnswers.length} soal</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium">
            Soal {safePage} dari {totalPages}
          </p>
          <p className="text-xs text-muted-foreground">
            {totalPages} jawaban perlu ditinjau
          </p>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-start gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-sm font-semibold text-destructive">
              {safePage}
            </span>
            <p className="pt-1 font-medium leading-relaxed">
              {currentItem.questionText}
            </p>
          </div>

          <div className="mt-5 space-y-2.5">
            <div className="flex items-start gap-2 rounded-md border border-destructive/20 bg-destructive/5 p-2.5">
              <IconX className="mt-0.5 size-4 shrink-0 text-destructive" />
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground">Jawaban Kamu</p>
                <p className="text-sm text-destructive">
                  {currentItem.selectedOptionText ?? "Tidak dijawab"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2 rounded-md border border-emerald-500/20 bg-emerald-500/5 p-2.5">
              <IconCheck className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground">Jawaban Benar</p>
                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  {currentItem.correctOptionText}
                </p>
              </div>
            </div>
          </div>
        </div>

        {totalPages > 1 ? (
          <>
            <div className="grid grid-cols-6 gap-2 sm:grid-cols-8 lg:grid-cols-10">
              {wrongAnswers.map((item, index) => {
                const pageNumber = index + 1;
                const isCurrent = pageNumber === safePage;

                return (
                  <button
                    key={item.questionId}
                    type="button"
                    onClick={() => setCurrentPage(pageNumber)}
                    aria-current={isCurrent ? "true" : undefined}
                    aria-label={`Soal salah ${pageNumber}`}
                    className={cn(
                      "flex aspect-square items-center justify-center rounded-md border text-sm font-medium transition-colors",
                      isCurrent
                        ? "border-destructive bg-destructive text-destructive-foreground"
                        : "border-input bg-background text-foreground hover:bg-muted",
                    )}
                  >
                    {pageNumber}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between gap-3 border-t pt-4">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(safePage - 1)}
                disabled={isFirstPage}
              >
                <IconChevronLeft className="size-4" />
                Sebelumnya
              </Button>
              <Button
                onClick={() => setCurrentPage(safePage + 1)}
                disabled={isLastPage}
              >
                Berikutnya
                <IconChevronRight className="size-4" />
              </Button>
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
