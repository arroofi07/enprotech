"use client";

import {
  IconAlertTriangle,
  IconChevronLeft,
  IconChevronRight,
  IconCircleCheck,
  IconCircleCheckFilled,
  IconClipboardList,
  IconClock,
  IconDeviceFloppy,
  IconInfoCircle,
  IconListNumbers,
} from "@tabler/icons-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { AssessmentAttemptHistory } from "@/components/assessments/assessment-attempt-history";
import {
  AssessmentResultCard,
  AssessmentReviewWrong,
} from "@/components/assessments/assessment-result-card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Spinner } from "@/components/ui/spinner";
import { areAllQuestionsAnswered } from "@/lib/domain/assessments/are-all-questions-answered";
import { getAssessmentTypeLabel } from "@/lib/domain/assessments/labels";
import { cn } from "@/lib/utils";
import type { LatestAttemptReview } from "@/lib/application/assessments/build-latest-attempt-review";
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
  inProgressAttempt: AssessmentAttemptRecord | null;
  attempts: AssessmentAttemptRecord[];
  latestAttemptReview?: LatestAttemptReview | null;
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
  startedAt: Date;
};

function formatRemainingTime(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

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
  inProgressAttempt,
  attempts,
  latestAttemptReview = null,
}: AssessmentTakeViewProps) {
  const typeLabel = getAssessmentTypeLabel(type);
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
          startedAt: inProgressAttempt.startedAt,
        }
      : null,
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(latestAttemptReview);
  const [attemptHistory, setAttemptHistory] = useState(attempts);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [remainingMs, setRemainingMs] = useState<number | null>(null);
  const sessionRef = useRef(session);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  const answeredCount = useMemo(() => {
    if (!session) {
      return 0;
    }

    return session.questions.filter((question) => {
      const selectedOptionId = session.answers[question.id];
      return question.options.some((option) => option.id === selectedOptionId);
    }).length;
  }, [session]);

  const progressValue = session
    ? Math.round((answeredCount / session.questions.length) * 100)
    : 0;
  const unansweredCount = session
    ? session.questions.length - answeredCount
    : 0;
  const allAnswered = session
    ? areAllQuestionsAnswered(
        session.questions,
        Object.entries(session.answers).map(
          ([questionId, selectedOptionId]) => ({
            questionId,
            selectedOptionId,
          }),
        ),
      )
    : false;

  const startTitle = hasPassed
    ? "Kamu Sudah Lulus"
    : inProgressAttempt
      ? `Lanjutkan ${typeLabel}`
      : `Siap Mengerjakan ${typeLabel}?`;
  const startDescription =
    hasPassed
      ? `Kamu sudah mencapai passing grade untuk ${typeLabel.toLowerCase()} ini.`
      : inProgressAttempt
        ? "Kamu punya jawaban tersimpan. Lanjutkan dari tempat terakhir kamu berhenti."
        : "Baca setiap soal dengan teliti, lalu pilih satu jawaban yang paling tepat.";

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
    setResult(null);

    try {
      const response = await fetch(`/api/assessments/${assessment.id}/attempt`, {
        method: "POST",
      });
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message ?? "Gagal memulai attempt.");
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
        startedAt: new Date(data.attempt.startedAt),
      });
      setCurrentIndex(0);
    } catch {
      toast.error("Gagal memulai attempt.");
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

  const performSubmit = useCallback(
    async (target: AttemptSession, options?: { auto?: boolean }) => {
      setLoading(true);

      try {
        await saveAnswers(target.attemptId, target.answers);

        const response = await fetch(
          `/api/attempts/${target.attemptId}/submit`,
          { method: "POST" },
        );
        const data = await response.json();

        if (!response.ok) {
          toast.error(data.message ?? "Gagal submit jawaban.");
          return;
        }

        toast.success(
          options?.auto
            ? `Waktu habis, jawaban otomatis dikirim. Nilai Anda ${data.score}%.`
            : data.passed
              ? `Selamat! Anda lulus dengan nilai ${data.score}%.`
              : `Jawaban terkirim. Nilai Anda ${data.score}%.`,
        );
        setResult(data);
        setSession(null);
        setAttemptHistory((current) => [
          {
            id: data.attemptId,
            studentId: "",
            assessmentId: assessment.id,
            score: data.score,
            answers: [],
            questionIds: null,
            startedAt: new Date(),
            submittedAt: new Date(),
          },
          ...current,
        ]);
      } catch {
        toast.error("Gagal submit jawaban.");
      } finally {
        setLoading(false);
      }
    },
    [assessment.id, saveAnswers],
  );

  async function handleSubmit() {
    if (!session) {
      return;
    }

    if (!allAnswered) {
      const firstUnansweredIndex = session.questions.findIndex(
        (question) => !session.answers[question.id],
      );
      if (firstUnansweredIndex >= 0) {
        setCurrentIndex(firstUnansweredIndex);
      }
      toast.error(
        `Lengkapi ${unansweredCount} soal yang belum dijawab sebelum submit.`,
      );
      return;
    }

    await performSubmit(session);
  }

  useEffect(() => {
    if (!session || !assessment.timeLimit) {
      setRemainingMs(null);
      return;
    }

    const deadline =
      session.startedAt.getTime() + assessment.timeLimit * 60_000;
    let autoSubmitted = false;

    function tick() {
      const remaining = deadline - Date.now();
      setRemainingMs(Math.max(remaining, 0));

      if (remaining <= 0 && !autoSubmitted) {
        autoSubmitted = true;
        const current = sessionRef.current;
        if (current) {
          void performSubmit(current, { auto: true });
        }
      }
    }

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [session?.attemptId, assessment.timeLimit, performSubmit]);

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

  if (session) {
    const total = session.questions.length;
    const safeIndex = Math.min(currentIndex, total - 1);
    const currentQuestion = session.questions[safeIndex];
    const currentAnswer = session.answers[currentQuestion.id] ?? "";
    const isFirstQuestion = safeIndex === 0;
    const isLastQuestion = safeIndex === total - 1;

    return (
      <div className="flex flex-col gap-5 lg:flex-row">
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">{typeLabel}</p>
              <p className="text-xs text-muted-foreground">
                Soal {safeIndex + 1} dari {total}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {remainingMs !== null ? (
                <span
                  className={cn(
                    "flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold tabular-nums",
                    remainingMs <= 60_000
                      ? "border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-400"
                      : "border-input bg-muted/50 text-foreground",
                  )}
                >
                  <IconClock className="size-4" />
                  {formatRemainingTime(remainingMs)}
                </span>
              ) : null}
              <span className="text-sm font-semibold tabular-nums">
                {progressValue}%
              </span>
            </div>
          </div>
          <Progress value={progressValue} />

          <div className="rounded-xl border bg-card p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {safeIndex + 1}
              </span>
              <p className="pt-1 font-medium leading-relaxed">
                {currentQuestion.questionText}
              </p>
            </div>

            <RadioGroup
              value={currentAnswer}
              onValueChange={(value) => {
                if (value) {
                  void handleAnswerChange(currentQuestion.id, value);
                }
              }}
              className="mt-5"
            >
              {currentQuestion.options.map((option, optionIndex) => {
                const optionLabel = String.fromCharCode(65 + optionIndex);
                const selected = currentAnswer === option.id;

                return (
                  <Label
                    key={option.id}
                    htmlFor={option.id}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 text-sm font-normal leading-relaxed transition-colors",
                      selected
                        ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                        : "hover:border-input hover:bg-muted/50",
                    )}
                  >
                    <RadioGroupItem
                      value={option.id}
                      id={option.id}
                      className="mt-0.5"
                    />
                    <span>
                      <span className="font-medium">{optionLabel}.</span>{" "}
                      {option.text}
                    </span>
                  </Label>
                );
              })}
            </RadioGroup>
          </div>

          <div className="flex items-center justify-between gap-3">
            <Button
              variant="outline"
              onClick={() => setCurrentIndex(safeIndex - 1)}
              disabled={isFirstQuestion}
            >
              <IconChevronLeft className="size-4" />
              Sebelumnya
            </Button>
            <Button
              onClick={() => setCurrentIndex(safeIndex + 1)}
              disabled={isLastQuestion}
            >
              Berikutnya
              <IconChevronRight className="size-4" />
            </Button>
          </div>
        </div>

        <aside className="lg:w-64 lg:shrink-0">
          <div className="space-y-4 rounded-xl border bg-card p-4 lg:sticky lg:top-2">
            <div>
              <p className="text-sm font-semibold">Navigasi Soal</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {answeredCount} dari {total} soal terjawab
              </p>
            </div>

            <div className="grid grid-cols-6 gap-2 sm:grid-cols-8 lg:grid-cols-5">
              {session.questions.map((question, index) => {
                const isAnswered = Boolean(session.answers[question.id]);
                const isCurrent = index === safeIndex;

                return (
                  <button
                    key={question.id}
                    type="button"
                    onClick={() => setCurrentIndex(index)}
                    aria-current={isCurrent ? "true" : undefined}
                    aria-label={`Soal ${index + 1}${
                      isAnswered ? " (sudah dijawab)" : ""
                    }`}
                    className={cn(
                      "flex aspect-square items-center justify-center rounded-md border text-sm font-medium transition-colors",
                      isAnswered
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input bg-background text-foreground hover:bg-muted",
                      isCurrent &&
                        "ring-2 ring-primary ring-offset-2 ring-offset-background",
                    )}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
              <span className="flex items-center gap-2">
                <span className="size-3 rounded-sm bg-primary" />
                Sudah dijawab
              </span>
              <span className="flex items-center gap-2">
                <span className="size-3 rounded-sm border border-input bg-background" />
                Belum dijawab
              </span>
            </div>

            <div className="space-y-2 border-t pt-4">
              {allAnswered ? (
                <p className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                  <IconCircleCheckFilled className="size-3.5 shrink-0" />
                  Semua soal sudah dijawab
                </p>
              ) : (
                <p className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                  <IconAlertTriangle className="size-3.5 shrink-0" />
                  {unansweredCount} soal belum dijawab
                </p>
              )}
              <Button
                onClick={handleSubmit}
                disabled={loading || !allAnswered}
                className="w-full"
              >
                {loading ? <Spinner className="size-4" /> : null}
                Submit Jawaban
              </Button>
            </div>
          </div>
        </aside>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">{typeLabel}</h2>
          <p className="text-sm text-muted-foreground">
            Nilai tertinggi {result ? result.bestScore : bestScore}%
          </p>
        </div>
        {(result ? result.passed : hasPassed) ? (
          <Badge>Lulus</Badge>
        ) : (
          <Badge variant="secondary">Belum Lulus</Badge>
        )}
      </div>

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
          {!result.passed && canRetry ? (
            <Button onClick={handleStart} disabled={loading}>
              {loading ? <Spinner className="size-4" /> : null}
              Coba Lagi
            </Button>
          ) : null}
        </>
      ) : (
        <Card>
          <CardContent className="space-y-6 p-6">
            <div className="flex items-start gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <IconClipboardList className="size-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">{startTitle}</h3>
                <p className="text-sm text-muted-foreground">
                  {startDescription}
                </p>
              </div>
            </div>

            <div
              className={cn(
                "grid gap-3 sm:grid-cols-2",
                assessment.timeLimit ? "lg:grid-cols-3" : null,
              )}
            >
              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <IconListNumbers className="size-4" />
                  <span className="text-xs">Jumlah Soal</span>
                </div>
                <p className="mt-1 text-3xl font-semibold">
                  {initialQuestions.length}
                </p>
              </div>
              {assessment.timeLimit ? (
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <IconClock className="size-4" />
                    <span className="text-xs">Batas Waktu</span>
                  </div>
                  <p className="mt-1 text-3xl font-semibold">
                    {assessment.timeLimit}
                    <span className="text-base font-normal text-muted-foreground">
                      {" "}
                      menit
                    </span>
                  </p>
                </div>
              ) : null}
              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <IconCircleCheck className="size-4" />
                  <span className="text-xs">Nilai Tertinggi</span>
                </div>
                <p className="mt-1 text-3xl font-semibold">{bestScore}%</p>
              </div>
            </div>

            <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
              <IconDeviceFloppy className="mt-0.5 size-4 shrink-0" />
              <span>
                Jawaban tersimpan otomatis. Semua soal wajib dijawab sebelum
                submit manual. Jika waktu habis, jawaban yang sudah dipilih
                akan dikirim otomatis dan soal kosong dihitung salah. Kamu
                dapat mencoba lagi selama belum lulus.
              </span>
            </div>

            {canRetry ? (
              <Button
                size="lg"
                onClick={handleStart}
                disabled={loading}
                className="w-full sm:w-auto"
              >
                {loading ? <Spinner className="size-4" /> : null}
                {inProgressAttempt ? "Lanjutkan" : "Mulai"} {typeLabel}
              </Button>
            ) : (
              <div className="flex items-center gap-2 rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
                <IconInfoCircle className="size-4 shrink-0" />
                <span>
                  Kamu tidak dapat mengerjakan {typeLabel.toLowerCase()} saat
                  ini.
                </span>
              </div>
            )}
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
