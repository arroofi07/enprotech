"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IconMessage2, IconSend } from "@tabler/icons-react";
import { toast } from "sonner";

import {
  submitFeedbackFormAction,
  type FeedbackActionState,
} from "@/app/actions/feedback";
import { RatingStars } from "@/components/feedback/rating-stars";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import type { TrainingFeedback } from "@/lib/db/schema/training-feedback";

type FeedbackSubmitFormProps = {
  trainingId: string;
  trainingTitle: string;
  feedback: TrainingFeedback | null;
};

const initialState: FeedbackActionState = {};

export function FeedbackSubmitForm({
  trainingId,
  trainingTitle,
  feedback,
}: FeedbackSubmitFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    submitFeedbackFormAction,
    initialState,
  );

  const [trainingRating, setTrainingRating] = useState(
    feedback?.trainingRating ?? 0,
  );
  const [trainerRating, setTrainerRating] = useState(
    feedback?.trainerRating ?? 0,
  );

  useEffect(() => {
    if (state.success) {
      toast.success(state.message ?? "Feedback berhasil disimpan.");
      router.push("/student/feedback");
    } else if (state.error) {
      toast.error(state.message ?? "Gagal menyimpan feedback.");
    }
  }, [state, router]);

  const canSubmit = trainingRating > 0 && trainerRating > 0 && !isPending;

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="trainingId" value={trainingId} />
      <input type="hidden" name="trainingRating" value={trainingRating} />
      <input type="hidden" name="trainerRating" value={trainerRating} />

      <FieldGroup className="gap-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <IconMessage2 className="size-4" />
            </span>
            Feedback untuk {trainingTitle}
          </div>
          <p className="text-sm text-muted-foreground">
            Berikan penilaian dan masukan Anda untuk training ini.
          </p>
        </div>

        <Field>
          <FieldLabel>Rating Training</FieldLabel>
          <RatingStars value={trainingRating} onChange={setTrainingRating} />
          <FieldDescription>
            Seberapa puas Anda dengan materi dan pelaksanaan training ini?
          </FieldDescription>
        </Field>

        <Field>
          <FieldLabel>Rating Trainer</FieldLabel>
          <RatingStars value={trainerRating} onChange={setTrainerRating} />
          <FieldDescription>
            Seberapa puas Anda dengan penyampaian trainer/pengajar?
          </FieldDescription>
        </Field>
      </FieldGroup>

      <FieldSeparator />

      <FieldGroup className="gap-5">
        <Field>
          <FieldLabel htmlFor="comment">Komentar / Saran</FieldLabel>
          <Textarea
            id="comment"
            name="comment"
            defaultValue={feedback?.comment ?? ""}
            placeholder="Bagikan komentar, kritik, atau saran Anda..."
            rows={4}
            maxLength={2000}
            className="min-h-24 text-sm md:text-sm"
          />
          <FieldDescription>Opsional.</FieldDescription>
        </Field>
      </FieldGroup>

      <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          {feedback
            ? "Perubahan akan memperbarui feedback Anda yang sudah ada."
            : "Pastikan kedua rating sudah dipilih sebelum menyimpan."}
        </p>
        <Button type="submit" size="lg" className="shrink-0" disabled={!canSubmit}>
          {isPending ? <Spinner className="size-4" data-icon="inline-start" /> : (
            <IconSend data-icon="inline-start" />
          )}
          {feedback ? "Perbarui Feedback" : "Kirim Feedback"}
        </Button>
      </div>
    </form>
  );
}
