"use client";

import { IconMessage2 } from "@tabler/icons-react";

import { FeedbackDetailDialog } from "@/components/feedback/feedback-detail-dialog";
import { RatingStars } from "@/components/feedback/rating-stars";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import type { FeedbackListItem } from "@/lib/infrastructure/db/repositories/feedback-repository";

type FeedbackTableProps = {
  feedback: FeedbackListItem[];
};

function formatDate(value: Date): string {
  return new Date(value).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const columns: DataTableColumn<FeedbackListItem>[] = [
  {
    id: "student",
    header: "Peserta",
    cell: (item) => (
      <div className="min-w-0">
        <p className="truncate font-medium">{item.studentName}</p>
        <p className="truncate text-xs text-muted-foreground">
          {item.studentEmail}
        </p>
      </div>
    ),
  },
  {
    id: "training",
    header: "Training",
    cell: (item) => <span className="text-sm">{item.trainingTitle}</span>,
  },
  {
    id: "trainingRating",
    header: "Rating Training",
    cell: (item) => <RatingStars value={item.trainingRating} readOnly size="sm" />,
  },
  {
    id: "trainerRating",
    header: "Rating Trainer",
    cell: (item) => <RatingStars value={item.trainerRating} readOnly size="sm" />,
  },
  {
    id: "comment",
    header: "Komentar",
    cell: (item) => (
      <p className="line-clamp-2 max-w-xs text-sm text-muted-foreground">
        {item.comment ?? "—"}
      </p>
    ),
  },
  {
    id: "updatedAt",
    header: "Diperbarui",
    cell: (item) => (
      <span className="text-sm text-muted-foreground">
        {formatDate(item.updatedAt)}
      </span>
    ),
  },
  {
    id: "actions",
    header: <span className="sr-only">Aksi</span>,
    headerClassName: "text-right",
    className: "text-right",
    cell: (item) => <FeedbackDetailDialog feedback={item} />,
  },
];

export function FeedbackTable({ feedback }: FeedbackTableProps) {
  return (
    <DataTable
      columns={columns}
      data={feedback}
      getRowKey={(item) => item.id}
      emptyState={{
        message: "Belum ada feedback yang dikirim peserta.",
        icon: IconMessage2,
      }}
    />
  );
}
