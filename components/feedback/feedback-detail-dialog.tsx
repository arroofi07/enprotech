"use client";

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
import { RatingStars } from "@/components/feedback/rating-stars";
import type { FeedbackListItem } from "@/lib/infrastructure/db/repositories/feedback-repository";

type FeedbackDetailDialogProps = {
  feedback: FeedbackListItem;
};

function formatDate(value: Date): string {
  return new Date(value).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function FeedbackDetailDialog({ feedback }: FeedbackDetailDialogProps) {
  return (
    <Dialog>
      <DialogTrigger render={<Button type="button" variant="outline" size="sm" />}>
        Detail
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{feedback.studentName}</DialogTitle>
          <DialogDescription>
            {feedback.studentEmail} • {feedback.trainingTitle}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <Badge variant="outline">Diperbarui {formatDate(feedback.updatedAt)}</Badge>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium">Rating Training</p>
              <RatingStars value={feedback.trainingRating} readOnly size="sm" />
            </div>
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium">Rating Trainer</p>
              <RatingStars value={feedback.trainerRating} readOnly size="sm" />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Komentar</p>
            <p className="text-sm text-muted-foreground">
              {feedback.comment ?? "Tidak ada komentar."}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
