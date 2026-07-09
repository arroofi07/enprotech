"use client";

import type { WrongAnswerReview } from "@/lib/domain/assessments/review-wrong-answers";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>Hasil {typeLabel}</CardTitle>
            <CardDescription>
              Passing grade: {passingGrade}%
            </CardDescription>
          </div>
          <Badge variant={passed ? "default" : "destructive"}>
            {passed ? "Lulus" : "Belum Lulus"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border p-4">
          <p className="text-xs text-muted-foreground">Nilai Attempt Ini</p>
          <p className="text-3xl font-semibold">{score}%</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-xs text-muted-foreground">Nilai Tertinggi</p>
          <p className="text-3xl font-semibold">{bestScore}%</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-xs text-muted-foreground">Status</p>
          <p className="text-lg font-medium">
            {passed ? "Mencapai passing grade" : "Perlu mencoba lagi"}
          </p>
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
        <CardHeader>
          <CardTitle>Review Jawaban</CardTitle>
          <CardDescription>Semua jawaban benar. Kerja bagus!</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Review Jawaban Salah</CardTitle>
        <CardDescription>
          Pelajari kembali soal yang belum benar.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {wrongAnswers.map((item, index) => (
          <div key={item.questionId} className="rounded-lg border p-4">
            <p className="text-sm font-medium">
              {index + 1}. {item.questionText}
            </p>
            <div className="mt-3 space-y-1 text-sm">
              <p>
                <span className="text-muted-foreground">Jawaban Anda: </span>
                <span className="text-destructive">
                  {item.selectedOptionText ?? "Tidak dijawab"}
                </span>
              </p>
              <p>
                <span className="text-muted-foreground">Jawaban Benar: </span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                  {item.correctOptionText}
                </span>
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
