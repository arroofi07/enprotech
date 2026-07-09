"use client";

import { useCallback, useMemo, useState } from "react";

import { AssessmentAttemptHistory } from "@/components/assessments/assessment-attempt-history";
import {
  AssessmentResultCard,
  AssessmentReviewWrong,
} from "@/components/assessments/assessment-result-card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress, ProgressLabel } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Spinner } from "@/components/ui/spinner";
import { getAssessmentTypeLabel } from "@/lib/domain/assessments/labels";
import type { WrongAnswerReview } from "@/lib/domain/assessments/review-wrong-answers";
import type { AssessmentType } from "@/lib/domain/assessments/types";
import type {
  AssessmentAttemptRecord,
  AssessmentRecord,
  QuestionRecord,
} from "@/lib/infrastructure/db/repositories/assessment-repository";

type AssessmentTakeViewProps = {
  trainingId: string;
  moduleId?: string;
  type: AssessmentType;
  assessment: AssessmentRecord;
  questions: QuestionRecord[];
  passingGrade: number;
  bestScore: number;
  hasPassed: boolean;
  canRetry: boolean;
  hasCompleted?: boolean;
  inProgressAttempt: AssessmentAttemptRecord | null;
  attempts: AssessmentAttemptRecord[];
};

type SubmitResult = {
  score: number;
  passingGrade: number;
  passed: boolean;
  bestScore: number;
  wrongAnswers: WrongAnswerReview[];
};

type AttemptSession = {
  attemptId: string;
  questions: QuestionRecord[];
  answers: Record<string, string>;
};

export function AssessmentTakeView({
  trainingId,
  moduleId,
  type,
  assessment,
  questions: initialQuestions,
  passingGrade,
  bestScore,
  hasPassed,
  canRetry,
  hasCompleted = false,
  inProgressAttempt,
  attempts,
}: AssessmentTakeViewProps) {
  const typeLabel = getAssessmentTypeLabel(type);
  const isSingleAttempt = type === "pre_test";
  const [session, setSession] = useState<AttemptSession | null>(
    inProgressAttempt
      ? {
          attemptId: inProgressAttempt.id,
          questions: initialQuestions,
          answers: Object.fromEntries(
            inProgressAttempt.answers.map((answer) => [
              answer.questionId,
              answer.selectedOptionId,
            ]),
          ),
        }
      : null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [attemptHistory, setAttemptHistory] = useState(attempts);

  const answeredCount = useMemo(() => {
    if (!session) {
      return 0;
    }

    return Object.keys(session.answers).length;
  }, [session]);

  const progressValue = session
    ? Math.round((answeredCount / session.questions.length) * 100)
    : 0;

  const saveAnswers = useCallback(
    async (attemptId: string, answers: Record<string, string>) => {
      await fetch(`/api/attempts/${attemptId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: Object.entries(answers).map(
            ([questionId, selectedOptionId]) => ({
              questionId,
              selectedOptionId,
            }),
          ),
        }),
      });
    },
    [],
  );

  async function handleStart() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`/api/assessments/${assessment.id}/attempt`, {
        method: "POST",
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.message ?? "Gagal memulai attempt.");
        return;
      }

      const answers = Object.fromEntries(
        data.attempt.answers.map(
          (answer: { questionId: string; selectedOptionId: string }) => [
            answer.questionId,
            answer.selectedOptionId,
          ],
        ),
      );

      setSession({
        attemptId: data.attempt.id,
        questions: data.questions,
        answers,
      });
    } catch {
      setError("Gagal memulai attempt.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAnswerChange(questionId: string, optionId: string) {
    if (!session) {
      return;
    }

    const nextAnswers = { ...session.answers, [questionId]: optionId };
    setSession({ ...session, answers: nextAnswers });
    await saveAnswers(session.attemptId, nextAnswers);
  }

  async function handleSubmit() {
    if (!session) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await saveAnswers(session.attemptId, session.answers);

      const response = await fetch(`/api/attempts/${session.attemptId}/submit`, {
        method: "POST",
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.message ?? "Gagal submit jawaban.");
        return;
      }

      setResult(data);
      setSession(null);
      setAttemptHistory((current) => [
        {
          id: data.attemptId,
          studentId: "",
          assessmentId: assessment.id,
          score: data.score,
          answers: [],
          startedAt: new Date(),
          submittedAt: new Date(),
        },
        ...current,
      ]);
    } catch {
      setError("Gagal submit jawaban.");
    } finally {
      setLoading(false);
    }
  }

  const contextLabel = moduleId ? "modul" : "training";

  if (initialQuestions.length === 0) {
    return (
      <Alert>
        <AlertDescription>
          Belum ada soal {typeLabel.toLowerCase()} untuk {contextLabel} ini.
          Hubungi trainer Anda.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">{typeLabel}</h2>
          <p className="text-sm text-muted-foreground">
            Passing grade {passingGrade}% · Nilai tertinggi {bestScore}%
            {isSingleAttempt ? " · Hanya 1 attempt" : null}
          </p>
        </div>
        {isSingleAttempt ? (
          hasCompleted ? (
            <Badge>Selesai</Badge>
          ) : (
            <Badge variant="secondary">Belum Dikerjakan</Badge>
          )
        ) : hasPassed ? (
          <Badge>Lulus</Badge>
        ) : (
          <Badge variant="secondary">Belum Lulus</Badge>
        )}
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {result ? (
        <>
          <AssessmentResultCard
            score={result.score}
            passingGrade={result.passingGrade}
            bestScore={result.bestScore}
            passed={result.passed}
            typeLabel={typeLabel}
          />
          <AssessmentReviewWrong wrongAnswers={result.wrongAnswers} />
          {!isSingleAttempt && !result.passed && canRetry ? (
            <Button onClick={handleStart} disabled={loading}>
              {loading ? <Spinner className="size-4" /> : null}
              Coba Lagi
            </Button>
          ) : null}
        </>
      ) : session ? (
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex w-full items-center justify-between gap-3">
              <ProgressLabel>Progress Jawaban</ProgressLabel>
              <span className="text-xs text-muted-foreground tabular-nums">
                {answeredCount}/{session.questions.length}
              </span>
            </div>
            <Progress value={progressValue} />
          </div>

          {session.questions.map((question, index) => (
            <Card key={question.id}>
              <CardHeader>
                <CardTitle className="text-base">
                  {index + 1}. {question.questionText}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={session.answers[question.id] ?? ""}
                  onValueChange={(value) => {
                    if (value) {
                      void handleAnswerChange(question.id, value);
                    }
                  }}
                  className="space-y-3"
                >
                  {question.options.map((option, optionIndex) => {
                    const label = String.fromCharCode(65 + optionIndex);

                    return (
                      <div
                        key={option.id}
                        className="flex items-start gap-3 rounded-lg border p-3"
                      >
                        <RadioGroupItem value={option.id} id={option.id} />
                        <Label htmlFor={option.id} className="cursor-pointer">
                          <span className="font-medium">{label}.</span>{" "}
                          {option.text}
                        </Label>
                      </div>
                    );
                  })}
                </RadioGroup>
              </CardContent>
            </Card>
          ))}

          <div className="flex justify-end">
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? <Spinner className="size-4" /> : null}
              Submit Jawaban
            </Button>
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="space-y-4 p-6">
            <p className="text-sm text-muted-foreground">
              {isSingleAttempt && hasCompleted
                ? `${typeLabel} sudah dikerjakan dan tidak dapat diulang.`
                : hasPassed
                  ? `Anda sudah mencapai passing grade untuk ${typeLabel.toLowerCase()} ini.`
                  : `Mulai mengerjakan ${typeLabel.toLowerCase()}. Jawaban akan tersimpan otomatis saat Anda memilih opsi.`}
            </p>
            {canRetry ? (
              <Button onClick={handleStart} disabled={loading}>
                {loading ? <Spinner className="size-4" /> : null}
                {inProgressAttempt ? "Lanjutkan" : "Mulai"} {typeLabel}
              </Button>
            ) : null}
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Riwayat Attempt</h3>
        <AssessmentAttemptHistory
          attempts={attemptHistory}
          passingGrade={passingGrade}
        />
      </div>
    </div>
  );
}
