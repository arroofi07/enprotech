"use client";

import {
  IconAlertTriangle,
  IconCheck,
  IconCircleCheckFilled,
  IconX,
} from "@tabler/icons-react";

import type { WrongAnswerReview } from "@/lib/domain/assessments/review-wrong-answers";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
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
              ? `Selamat! Kamu berhasil mencapai passing grade ${passingGrade}%.`
              : `Nilai kamu belum mencapai passing grade ${passingGrade}%. Tetap semangat!`}
          </p>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 border-t pt-4 sm:justify-start">
            <div>
              <p className="text-xs text-muted-foreground">Passing Grade</p>
              <p className="text-xl font-semibold tabular-nums">
                {passingGrade}%
              </p>
            </div>
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
      <CardContent>
        <Accordion defaultValue={[wrongAnswers[0].questionId]}>
          {wrongAnswers.map((item, index) => (
            <AccordionItem key={item.questionId} value={item.questionId}>
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <span className="flex items-start gap-2.5">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-[0.7rem] font-semibold text-destructive">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium">
                    {item.questionText}
                  </span>
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-2">
                <div className="space-y-2.5">
                  <div className="flex items-start gap-2 rounded-md border border-destructive/20 bg-destructive/5 p-2.5">
                    <IconX className="mt-0.5 size-4 shrink-0 text-destructive" />
                    <div className="space-y-0.5">
                      <p className="text-xs text-muted-foreground">
                        Jawaban Kamu
                      </p>
                      <p className="text-sm text-destructive">
                        {item.selectedOptionText ?? "Tidak dijawab"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 rounded-md border border-emerald-500/20 bg-emerald-500/5 p-2.5">
                    <IconCheck className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <div className="space-y-0.5">
                      <p className="text-xs text-muted-foreground">
                        Jawaban Benar
                      </p>
                      <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                        {item.correctOptionText}
                      </p>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
