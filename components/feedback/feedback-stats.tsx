import { IconMessage2, IconSchool, IconUser } from "@tabler/icons-react";

import { ProgressStatCard } from "@/components/progress/progress-stat-card";
import type { FeedbackStats as FeedbackStatsData } from "@/lib/infrastructure/db/repositories/feedback-repository";

type FeedbackStatsProps = {
  stats: FeedbackStatsData;
};

function formatRating(value: number | null): string {
  return value === null ? "—" : `${value.toFixed(1)} / 5`;
}

export function FeedbackStats({ stats }: FeedbackStatsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <ProgressStatCard
        title="Rata-rata Rating Training"
        value={formatRating(stats.avgTrainingRating)}
        icon={<IconSchool className="size-4" />}
      />
      <ProgressStatCard
        title="Rata-rata Rating Trainer"
        value={formatRating(stats.avgTrainerRating)}
        icon={<IconUser className="size-4" />}
      />
      <ProgressStatCard
        title="Total Feedback"
        value={String(stats.total)}
        icon={<IconMessage2 className="size-4" />}
      />
    </div>
  );
}
