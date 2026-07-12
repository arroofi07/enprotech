import type { VideoConferenceState } from "@/lib/domain/modules/video-conference-access";
import { getVideoConferenceStatusLabel } from "@/lib/domain/modules/video-conference-access";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type VideoConferenceStatusBadgeProps = {
  state: VideoConferenceState;
  className?: string;
};

function getVariant(state: VideoConferenceState) {
  switch (state) {
    case "live":
      return "default" as const;
    case "ended":
      return "secondary" as const;
    case "scheduled":
      return "outline" as const;
    case "not_scheduled":
      return "outline" as const;
  }
}

export function VideoConferenceStatusBadge({
  state,
  className,
}: VideoConferenceStatusBadgeProps) {
  return (
    <Badge
      variant={getVariant(state)}
      className={cn(
        state === "live" && "bg-emerald-600 text-white hover:bg-emerald-600/90",
        state === "ended" && "text-muted-foreground",
        className,
      )}
    >
      {state === "live" ? (
        <span className="relative flex size-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-white/70 opacity-75" />
          <span className="relative inline-flex size-2 rounded-full bg-white" />
        </span>
      ) : null}
      {getVideoConferenceStatusLabel(state)}
    </Badge>
  );
}
